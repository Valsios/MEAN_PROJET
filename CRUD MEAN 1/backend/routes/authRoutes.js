const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Boutique = require('../models/Boutique');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
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
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
      profile
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
