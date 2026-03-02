const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: "./conf.env" });
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));    

// Routes
app.use('/articles', require('./routes/articleRoutes'));

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/boxes', require('./routes/boxRoutes'));

app.use('/boutiques', require('./routes/boutiqueRoutes'));

app.use('/categories', require('./routes/categorieRoutes'));

app.use('/paiements', require('./routes/paiementLoyerRoutes'));

app.use('/mouvements', require('./routes/mouvementBoxRoutes'));

app.use('/mouvements-prix', require('./routes/mouvementPrixLoyerRoutes'));

app.use('/reports', require('./routes/reportRoutes'));

app.use('/clients', require('./routes/clientRoutes'));

app.use('/dashboard', require('./routes/dashboardAdminRoutes'));

// ------- VALS ---------

app.use('/api/produit', require('./routes/produitRoutesVals'));
app.use('/api/client', require('./routes/clientRoutesVals'));
app.use('/api/commande', require('./routes/commandeRoutesVals'));
app.use('/api/boutique', require('./routes/boutiqueRoutesVals'));
app.use('/api/mouvements-prix', require('./routes/mouvementPrixLoyerRoutesVals'));
app.use('/api/paiements-loyer', require('./routes/paiementLoyerRoutesVals'));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API fonctionne correctement' });
});



app.listen(PORT, () => console.log(`Serveur démarré sur le port
${PORT}`));


