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

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.use('/api/mouvements-prix', require('./routes/mouvementPrixLoyerRoutes'));
app.use('/api/paiements-loyer', require('./routes/paiementLoyerRoutes'));



app.listen(PORT, () => console.log(`Serveur démarré sur le port
${PORT}`));


