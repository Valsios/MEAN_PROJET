const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: "./conf.env" });
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

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






app.listen(PORT, () => console.log(`Serveur démarré sur le port
${PORT}`));


