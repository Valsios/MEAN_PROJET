/*************************************************
 * INITIALISATION DATABASE : CENTRE COMMERCIAL
 * MongoDB / MEAN Stack
 *************************************************/


/***********************
 * USERS (AUTH UNIQUE)
 ***********************/
db.createCollection("users");

db.users.createIndex(
  { email: 1 },
  { unique: true }
);

db.users.insertOne({
  email: "admin@centre.mg",
  password: "$2a$12$gCx.Qz.USJ4SwM3ANa.BJ.ZKyMdNcv3C1Da2aNf9M4a5a2zYFwuHW",
  role: "admin", // admin | boutique | client
  profilId: null,
  status: true,
  createdAt: new Date()
});

/***********************
 * CLIENTS
 ***********************/
db.createCollection("clients");

db.clients.createIndex(
  { email: 1 },
  { unique: true }
);

const client1 = db.clients.insertOne({
  nom: "Rakoto",
  prenom: "Jean",
  telephone: "+261320000000",
  adresse: "Antananarivo",
  email: "jean.rakoto@gmail.com"
});

db.users.insertOne({
  email: "contact@client1.mg",
  password: "$2a$12$5/JDO1kiTAZlnN1O1kEXceVBxTsGOg10rBcpgxBc1.Q3J4K7nMfhu",
  role: "client",
  profilId: client1.insertedId,
  status: true,
  createdAt: new Date()
});

const client2 = db.clients.insertOne({
  nom: "Rakoto",
  prenom: "Vals",
  telephone: "+26134000101",
  adresse: "Mahajanga",
  email: "vals.rakoto@gmail.com"
});

db.users.insertOne({
  email: "contact@client2.mg",
  password: "$2a$12$5/JDO1kiTAZlnN1O1kEXceVBxTsGOg10rBcpgxBc1.Q3J4K7nMfhu",
  role: "client",
  profilId: client2.insertedId,
  status: true,
  createdAt: new Date()
});

/***********************
 * BOXES (ENTITÉ PHYSIQUE)
 ***********************/
db.createCollection("boxes");

db.boxes.createIndex(
  { numero: 1, etage: 1 },
  { unique: true }
);

const box1 = db.boxes.insertOne({
  numero: 12,
  etage: 1,
  statut: "libre"
});

db.boxes.updateOne(
  { _id: box1.insertedId },
  { $set: { prixActuel: 100000 } }
);

/***********************
 * BOUTIQUES
 ***********************/

db.createCollection("categories");
db.categories.insertMany([
  {
    _id: ObjectId("65abc0010000000000000001"),
    nom: "Informatique",
    description: "Vente de matériel et services informatiques",
  },
  {
    _id: ObjectId("65abc0010000000000000002"),
    nom: "Vêtements",
    description: "Mode, prêt-à-porter",
  },
  {
    _id: ObjectId("65abc0010000000000000003"),
    nom: "Restauration",
    description: "Restaurants et fast-food",
  }
]);

db.createCollection("boutiques");

db.boutiques.createIndex(
  { email: 1 },
  { unique: true }
);

const boutique1 = db.boutiques.insertOne({
  nom: "Tech World",
  telephone: "+261341234567",
  email: "contact@techworld.mg",
  boxActuelleId: null
});
db.boutiques.updateOne(
  { email: "contact@techworld.mg" },   // qui je modifie
  {
    $set: {
      categorieId: ObjectId("65abc0010000000000000001")
    }
  }
);


/***********************
 * MOUVEMENTS_BOX
 * (occupation & historique)
 ***********************/
db.createCollection("mouvements_box");

/* Une seule occupation active par box */
db.mouvements_box.createIndex(
  { boxId: 1 },
  {
    unique: true,
    partialFilterExpression: { dateFin: null }
  }
);

/***********************
 * OCCUPATION INITIALE (EXEMPLE)
 ***********************/
db.mouvements_box.insertOne({
  boxId: box1.insertedId,
  boutiqueId: boutique1.insertedId,
  dateDebut: new Date("2026-01-01"),
  dateFin: null,
  statut: "en_cours"
});

/***********************
 * SYNCHRONISATION BOX / BOUTIQUE
 ***********************/
db.boxes.updateOne(
  { _id: box1.insertedId },
  { $set: { statut: "occupee" } }
);

db.boutiques.updateOne(
  { _id: boutique1.insertedId },
  { $set: { boxActuelleId: box1.insertedId } }
);

/***********************
 * USER BOUTIQUE (LOGIN)
 ***********************/
db.users.insertOne({
  email: "contact@techworld.mg",
  password: "$2a$12$KvrtLtOEZ0a7X3xJlWtP1e6aC0Nw/mOjtMqdUreg3zlWlrUJUePse",
  role: "boutique",
  profilId: boutique1.insertedId,
  status: true,
  createdAt: new Date()
});


/***********************
 * MOUVEMENT_PRIX_LOYER
 * (historique changement prix)
 ***********************/
db.createCollection("mouvement_prix_loyer");

db.mouvement_prix_loyer.createIndex(
  { boxId: 1, dateMvt: -1 }
);

/* Exemple : changement de prix */
db.mouvement_prix_loyer.insertOne({
  boxId: box1.insertedId,
  ancienPrix: 100000,
  nouveauPrix: 120000,
  dateMvt: new Date(),
  motif: "Réajustement annuel"
});

/* Synchronisation prix actuel */
db.boxes.updateOne(
  { _id: box1.insertedId },
  { $set: { prixActuel: 120000 } }
);

/***********************
 * PAIEMENT_LOYER
 * (historique paiements loyer)
 ***********************/
db.createCollection("paiement_loyer");

/* Un paiement unique par boutique / mois / année */
db.paiement_loyer.createIndex(
  { boutiqueId: 1, mois: 1, annee: 1 },
  { unique: true }
);

/* Exemple de paiement */
db.paiement_loyer.insertOne({
  boutiqueId: boutique1.insertedId,
  boxId: box1.insertedId,
  montant: 120000,
  mois: 1,
  annee: 2026,
  datePaiement: new Date("2026-01-05"),
  createdAt: new Date()
});







/***********************
 * FIN INITIALISATION
 ***********************/
print("✅ Base centre_commercial initialisée avec succès");


/* =========================
   1. COLLECTION PRODUITS
========================= */
db.createCollection("produits");

/* On récupère la boutique existante (la seule) */
const boutique = db.boutiques.findOne();

/* Insertion de 2 produits */
const produitsInsert = db.produits.insertMany([
  {
    nom: "T-shirt Noir",
    description: "T-shirt coton haute qualité",
    boutiqueId: boutique._id,
    type: "produit", // produit | plat | service
    gestionStock: true,
    stockActuel: 25,
    prixActuel: 30000,
    createdAt: new Date()
  },
  {
    nom: "Burger Classic",
    description: "Burger avec steak et fromage",
    boutiqueId: boutique._id,
    type: "plat",
    gestionStock: false,
    stockActuel: null,
    prixActuel: 15000,
    createdAt: new Date()
  }
]);

/* =========================
   2. MOUVEMENT PRIX PRODUIT
========================= */
db.createCollection("mouvementprixproduits");

/* Historique des prix pour chaque produit */
db.mouvement_prix_produit.insertMany([
  {
    produitId: produitsInsert.insertedIds["0"],
    ancienPrix: null,
    nouveauPrix: 30000,
    dateApplication: new Date(),
    commentaire: "Prix initial"
  },
  {
    produitId: produitsInsert.insertedIds["1"],
    ancienPrix: null,
    nouveauPrix: 15000,
    dateApplication: new Date(),
    commentaire: "Prix initial"
  }
]);

/* =========================
   3. PROMOTIONS PRODUITS
========================= */
db.createCollection("promotions_produit");

db.promotions_produit.insertMany([
  {
    produitId: produitsInsert.insertedIds["0"],
    pourcentage: 10, // -10%
    dateDebut: new Date(),
    dateFin: null
  },
  {
    produitId: produitsInsert.insertedIds["1"],
    pourcentage: 20, // -20%
    dateDebut: new Date(),
    dateFin: null
  }
]);

/* =========================
   4. INDEX UTILES
========================= */
db.produits.createIndex({ boutiqueId: 1 });
db.mouvement_prix_produit.createIndex({ produitId: 1 });
db.promotions_produit.createIndex({ produitId: 1 });

print("✅ Données produits, prix et promotions initialisées avec succès !");

// ajout champ image à produit
db.produits.updateMany(
  {},
  {
    $set: {
      image: null
    }
  }
);


// 1. Récupérer les IDs des clients
const clientVals = db.clients.findOne({ email: "vals.rakoto@gmail.com" });
const clientSoa = db.clients.findOne({ email: "jean.rakoto@gmail.com" });

// 2. ID du produit
const produitId = ObjectId("699210026a8b84657f2ae029");

// 3. Insérer les 2 reviews
db.reviewproduits.insertMany([
  {
    client: {
      id: clientVals._id,
      email: clientVals.email
    },
    commentaire: "Excellent produit ! Correspond parfaitement à mes attentes. Livraison rapide et emballage soigné.",
    note: 5,
    produitId: produitId,
    createdAt: new Date()
  },
  {
    client: {
      id: clientSoa._id,
      email: clientSoa.email
    },
    commentaire: "Produit de bonne qualité mais un peu cher. Le service client est réactif.",
    note: 4,
    produitId: produitId,
    createdAt: new Date()
  }
]);

// 4. Vérifier le résultat
db.reviewproduits.find().pretty();