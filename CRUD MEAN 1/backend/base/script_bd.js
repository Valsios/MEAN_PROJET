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

/***********************
 * BOUTIQUES
 ***********************/
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
 * FIN INITIALISATION
 ***********************/
print("✅ Base centre_commercial initialisée avec succès");
