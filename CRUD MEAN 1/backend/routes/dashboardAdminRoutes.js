const express = require('express');
const router = express.Router();
const Boutique = require('../models/Boutique');
const Box = require('../models/Box');
const PaiementLoyer = require('../models/PaiementLoyer');
const Report = require('../models/Report');
const User = require('../models/User');
const MouvementBox = require('../models/MouvementBox');
const MouvementPrixLoyer = require('../models/MouvementPrixLoyer');

router.get('/stats', async (req, res) => {
  try {
    const { mois: moisFilter, annee: anneeFilter } = req.query;
    const maintenant = new Date();
    const moisActuel = moisFilter ? parseInt(moisFilter) : maintenant.getMonth() + 1;
    const anneeActuelle = anneeFilter ? parseInt(anneeFilter) : maintenant.getFullYear();

    // 1. KPIs principaux
    const totalBoutiques = await Boutique.countDocuments();
    
    const totalBoxes = await Box.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          libres: { $sum: { $cond: [{ $eq: ['$statut', 'libre'] }, 1, 0] } },
          occupees: { $sum: { $cond: [{ $eq: ['$statut', 'occupee'] }, 1, 0] } }
        }
      }
    ]);

    // Revenus du mois
    const revenusMois = await PaiementLoyer.aggregate([
      {
        $match: {
          mois: moisActuel,
          annee: anneeActuelle
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);

    // Reports en attente
    const reportsEnAttente = await Report.countDocuments({ statut: 'en_attente' });

    // 2. Paiements par mois (6 derniers mois)
    const paiementsParMois = await PaiementLoyer.aggregate([
      {
        $group: {
          _id: {
            annee: '$annee',
            mois: '$mois'
          },
          montant: { $sum: '$montant' }
        }
      },
      { $sort: { '_id.annee': -1, '_id.mois': -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          annee: '$_id.annee',
          moisNum: '$_id.mois',
          mois: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], '$_id.mois'] },
              ' ',
              { $toString: '$_id.annee' }
            ]
          },
          montant: 1
        }
      }
    ]);

    // 3. Taux de recouvrement
    const boutiquesAvecBox = await Boutique.find({ boxActuelleId: { $ne: null } }).populate('boxActuelleId');
    let boutiquesAJour = 0;

    for (const boutique of boutiquesAvecBox) {
      const paiementExiste = await PaiementLoyer.findOne({
        boutiqueId: boutique._id,
        boxId: boutique.boxActuelleId._id,
        mois: moisActuel,
        annee: anneeActuelle
      });
      if (paiementExiste) boutiquesAJour++;
    }

    const tauxRecouvrement = boutiquesAvecBox.length > 0 
      ? (boutiquesAJour / boutiquesAvecBox.length) * 100 
      : 0;

    // 4. Occupation par étage
    const occupationParEtage = await Box.aggregate([
      {
        $group: {
          _id: '$etage',
          total: { $sum: 1 },
          libres: { $sum: { $cond: [{ $eq: ['$statut', 'libre'] }, 1, 0] } },
          occupees: { $sum: { $cond: [{ $eq: ['$statut', 'occupee'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          etage: '$_id',
          libres: 1,
          occupees: 1,
          total: 1
        }
      }
    ]);

    // 5. Mouvements par mois
    const mouvementsParMois = await MouvementBox.aggregate([
      {
        $facet: {
          entrees: [
            {
              $group: {
                _id: {
                  annee: { $year: '$dateDebut' },
                  mois: { $month: '$dateDebut' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.annee': -1, '_id.mois': -1 } },
            { $limit: 6 }
          ],
          sorties: [
            {
              $match: { dateFin: { $ne: null } }
            },
            {
              $group: {
                _id: {
                  annee: { $year: '$dateFin' },
                  mois: { $month: '$dateFin' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.annee': -1, '_id.mois': -1 } },
            { $limit: 6 }
          ]
        }
      }
    ]);

    // 6. Reports par catégorie
    const reportsParCategorie = await Report.aggregate([
      {
        $lookup: {
          from: 'boutiques',
          localField: 'boutiqueId',
          foreignField: '_id',
          as: 'boutique'
        }
      },
      { $unwind: '$boutique' },
      {
        $lookup: {
          from: 'categories',
          localField: 'boutique.categorieId',
          foreignField: '_id',
          as: 'categorie'
        }
      },
      { $unwind: '$categorie' },
      {
        $group: {
          _id: '$categorie.nom',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          categorie: '$_id',
          count: 1
        }
      }
    ]);

    // 7. Statistiques reports
    const reportsParStatut = await Report.aggregate([
      {
        $group: {
          _id: null,
          en_attente: { $sum: { $cond: [{ $eq: ['$statut', 'en_attente'] }, 1, 0] } },
          valide: { $sum: { $cond: [{ $eq: ['$statut', 'valide'] }, 1, 0] } },
          refuse: { $sum: { $cond: [{ $eq: ['$statut', 'refuse'] }, 1, 0] } }
        }
      }
    ]);

    // 8. Évolution des reports
    const evolutionReports = await Report.aggregate([
      {
        $group: {
          _id: {
            annee: { $year: '$dateReport' },
            mois: { $month: '$dateReport' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.annee': -1, '_id.mois': -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          annee: '$_id.annee',
          moisNum: '$_id.mois',
          mois: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], '$_id.mois'] },
              ' ',
              { $toString: '$_id.annee' }
            ]
          },
          count: 1
        }
      }
    ]);

    // 9. Nouveaux utilisateurs par mois
    const nouveauxUtilisateurs = await User.aggregate([
      {
        $group: {
          _id: {
            annee: { $year: '$createdAt' },
            mois: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.annee': -1, '_id.mois': -1 } },
      { $limit: 18 }, // 6 mois * 3 rôles
      {
        $group: {
          _id: {
            annee: '$_id.annee',
            mois: '$_id.mois'
          },
          roles: {
            $push: {
              role: '$_id.role',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id.annee': -1, '_id.mois': -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          annee: '$_id.annee',
          moisNum: '$_id.mois',
          mois: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'], '$_id.mois'] },
              ' ',
              { $toString: '$_id.annee' }
            ]
          },
          admin: {
            $sum: {
              $map: {
                input: '$roles',
                as: 'r',
                in: { $cond: [{ $eq: ['$$r.role', 'admin'] }, '$$r.count', 0] }
              }
            }
          },
          boutique: {
            $sum: {
              $map: {
                input: '$roles',
                as: 'r',
                in: { $cond: [{ $eq: ['$$r.role', 'boutique'] }, '$$r.count', 0] }
              }
            }
          },
          client: {
            $sum: {
              $map: {
                input: '$roles',
                as: 'r',
                in: { $cond: [{ $eq: ['$$r.role', 'client'] }, '$$r.count', 0] }
              }
            }
          },
          total: { $sum: '$roles.count' }
        }
      }
    ]);

    // 10. Évolution des prix des box
    const evolutionPrixBox = await MouvementPrixLoyer.aggregate([
      {
        $lookup: {
          from: 'boxes',
          localField: 'boxId',
          foreignField: '_id',
          as: 'box'
        }
      },
      { $unwind: '$box' },
      {
        $group: {
          _id: '$boxId',
          boxNumero: { $first: '$box.numero' },
          etage: { $first: '$box.etage' },
          prixActuel: { $first: '$box.prixActuel' },
          historique: {
            $push: {
              date: '$dateMvt',
              ancienPrix: '$ancienPrix',
              nouveauPrix: '$nouveauPrix',
              motif: '$motif'
            }
          }
        }
      },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          boxId: '$_id',
          boxNumero: 1,
          etage: 1,
          prixActuel: 1,
          historique: { $slice: ['$historique', 5] } // 5 derniers changements
        }
      }
    ]);

    // 11. Boutiques en retard de paiement
    const boutiquesEnRetard = [];
    for (const boutique of boutiquesAvecBox) {
      const dernierPaiement = await PaiementLoyer.findOne({
        boutiqueId: boutique._id,
        boxId: boutique.boxActuelleId._id
      }).sort({ annee: -1, mois: -1 });

      if (!dernierPaiement) {
        // Jamais payé - vérifier date d'entrée
        const mouvement = await MouvementBox.findOne({
          boutiqueId: boutique._id,
          dateFin: null
        });
        if (mouvement) {
          const dateDebut = new Date(mouvement.dateDebut);
          if (dateDebut.getMonth() + 1 < moisActuel || dateDebut.getFullYear() < anneeActuelle) {
            boutiquesEnRetard.push({
              ...boutique.toObject(),
              moisEnRetard: 1
            });
          }
        }
      } else if (dernierPaiement.annee < anneeActuelle || 
                (dernierPaiement.annee === anneeActuelle && dernierPaiement.mois < moisActuel - 1)) {
        boutiquesEnRetard.push({
          ...boutique.toObject(),
          moisEnRetard: 1
        });
      }
    }

    // 12. Derniers paiements
    const derniersPaiements = await PaiementLoyer.find()
      .populate('boutiqueId', 'nom')
      .populate('boxId', 'numero')
      .sort({ datePaiement: -1 })
      .limit(5)
      .then(paiements => paiements.map(p => ({
        _id: p._id,
        boutiqueNom: p.boutiqueId?.nom || 'Inconnue',
        boxNumero: p.boxId?.numero || '?',
        montant: p.montant,
        mois: p.mois,
        annee: p.annee,
        datePaiement: p.datePaiement
      })));

    // 13. Derniers reports
    const derniersReports = await Report.find()
      .populate('boutiqueId', 'nom')
      .sort({ dateReport: -1 })
      .limit(5)
      .then(reports => reports.map(r => ({
        _id: r._id,
        title: r.title,
        boutiqueNom: r.boutiqueId?.nom || 'Inconnue',
        statut: r.statut,
        dateReport: r.dateReport
      })));

    // 14. Derniers mouvements
    const derniersMouvements = await MouvementBox.find()
      .populate('boutiqueId', 'nom')
      .populate('boxId', 'numero')
      .sort({ dateDebut: -1 })
      .limit(5)
      .then(mouvements => mouvements.map(m => ({
        _id: m._id,
        boutiqueNom: m.boutiqueId?.nom || 'Inconnue',
        boxNumero: m.boxId?.numero || '?',
        type: m.dateFin ? 'sortie' : 'entree',
        date: m.dateFin || m.dateDebut
      })));

    res.json({
      totalBoutiques,
      totalBoxes: totalBoxes[0] || { total: 0, libres: 0, occupees: 0 },
      revenusMois: revenusMois[0]?.total || 0,
      reportsEnAttente,
      paiementsParMois: paiementsParMois.reverse(),
      tauxRecouvrement: Math.round(tauxRecouvrement * 100) / 100,
      occupationParEtage,
      mouvementsParMois: mouvementsParMois[0] || { entrees: [], sorties: [] },
      reportsParCategorie,
      reportsParStatut: reportsParStatut[0] || { en_attente: 0, valide: 0, refuse: 0 },
      evolutionReports: evolutionReports.reverse(),
      nouveauxUtilisateurs: nouveauxUtilisateurs.reverse(),
      evolutionPrixBox,
      boutiquesEnRetard: boutiquesEnRetard.slice(0, 5),
      derniersPaiements,
      derniersReports,
      derniersMouvements
    });

  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;