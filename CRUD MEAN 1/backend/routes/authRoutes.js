const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const Boutique = require('../models/Boutique');

// POST /api/auth/register-client - Inscription client
router.post('/register-client', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, adresse, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le client existe déjà
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà' });
    }

    // 1. Créer le client
    const client = new Client({
      nom,
      prenom,
      email,
      telephone,
      adresse
    });
    await client.save();

    // 2. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Créer l'utilisateur avec le profilId = client._id
    const user = new User({
      email,
      password: hashedPassword,
      role: 'client', // Forcé à 'client'
      profilId: client._id,
      status: true
    });

    await user.save();

    // 4. Créer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, profilId: user.profilId },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        profilId: user.profilId,
        status: user.status
      },
      client: {
        id: client._id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ancienne route register (gardée pour compatibilité)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password: hashedPassword,
      role: role || 'client',
      profilId: null,
      status: true
    });

    await user.save();

    // Créer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role, profilId: user.profilId }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role, profilId: user.profilId },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

     var profile;
    if(user.role === "boutique")
    {
      profile = await Boutique.findById(user.profilId);
    }
    else if(user.role === "client")
    {
      profile = await Client.findById(user.profilId);
    }
    else
    {
      profile = user;
    }

    // Si c'est un client, récupérer ses informations
    let clientData = null;
    if (user.role === 'client' && user.profilId) {
      const client = await Client.findById(user.profilId);
      if (client) {
        clientData = {
          id: client._id,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          telephone: client.telephone,
          adresse: client.adresse
        };
      }
    }

    res.json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        profilId: user.profilId,
        status: user.status
      },
      client: clientData,
      profile
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;