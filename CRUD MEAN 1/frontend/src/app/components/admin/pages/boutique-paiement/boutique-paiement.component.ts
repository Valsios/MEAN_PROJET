import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaiementLoyerService } from '../../../../services/paiement-loyer/paiement-loyer.service';

@Component({
  selector: 'app-boutique-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './boutique-paiement.component.html',
  styleUrls: ['./boutique-paiement.component.css']
})
export class BoutiquePaiementComponent implements OnInit {
  boutique: any;
  dernierPaiement: any;
  prochainMois!: number;
  prochaineAnnee!: number;

  nombreMois: number = 1;
  moisAPayer: string[] = [];

  boutiqueId!: string;
  error: string = '';

  // Propriétés pour afficher des informations supplémentaires
  boxActuelleId: string | null = null;
  messageInfo: string = '';

  moisFrancais = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(
    private route: ActivatedRoute,
    private paiementService: PaiementLoyerService
  ) {}

  ngOnInit() {
    this.boutiqueId = this.route.snapshot.paramMap.get('id')!;
    if (!this.boutiqueId) {
      this.error = 'ID de boutique non valide';
      return;
    }
    this.loadInfo();
  }

  loadInfo() {
    this.error = '';
    
    this.paiementService.getInfo(this.boutiqueId).subscribe({
      next: (res) => {
        this.boutique = res.boutique;
        this.dernierPaiement = res.dernierPaiement;
        this.prochainMois = res.prochainMois;
        this.prochaineAnnee = res.prochaineAnnee;
        this.boxActuelleId = res.boutique.boxActuelleId?._id;
        
        // Générer un message explicatif
        this.genererMessageInfo();
        this.genererMois();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des informations';
        console.error('Erreur:', err);
      }
    });
  }

  /**
   * Génère un message explicatif sur le calcul du prochain mois
   */
  genererMessageInfo() {
    if (!this.boutique || !this.dernierPaiement) {
      this.messageInfo = 'Premier paiement pour cette boutique. Le loyer est dû à partir de la date d\'entrée dans le box.';
    } else if (this.dernierPaiement.boxId === this.boxActuelleId) {
      this.messageInfo = `Dernier paiement effectué pour le box actuel. Le prochain mois à payer est ${this.moisFrancais[this.prochainMois]} ${this.prochaineAnnee}.`;
    } else {
      this.messageInfo = `Dernier paiement effectué pour un ancien box. Le calcul reprend à partir du dernier paiement du box actuel ou de la date d'entrée.`;
    }
  }

  genererMois() {
    if (!this.nombreMois || this.nombreMois < 1) {
      this.nombreMois = 1;
    }
    if (this.nombreMois > 12) {
      this.nombreMois = 12;
    }

    this.moisAPayer = [];
    let mois = this.prochainMois;
    let annee = this.prochaineAnnee;

    for (let i = 0; i < this.nombreMois; i++) {
      this.moisAPayer.push(`${this.moisFrancais[mois]} ${annee}`);

      mois++;
      if (mois > 12) {
        mois = 1;
        annee++;
      }
    }
  }

  payer() {
    if (this.nombreMois < 1 || this.nombreMois > 12) {
      alert('Veuillez saisir un nombre de mois valide (entre 1 et 12)');
      return;
    }

    const montantTotal = this.boutique.boxActuelleId.prixActuel * this.nombreMois;
    
    if (!confirm(`Confirmez-vous le paiement de ${montantTotal.toLocaleString()} Ar pour ${this.nombreMois} mois de loyer ?`)) {
      return;
    }

    this.paiementService.payer({
      boutiqueId: this.boutiqueId,
      nombreMois: this.nombreMois
    }).subscribe({
      next: (res) => {
        alert('✓ Paiement effectué avec succès !');
        this.loadInfo();
        this.nombreMois = 1;
      },
      error: (err) => {
        alert('✗ ' + (err.error?.message || 'Erreur lors du paiement'));
        console.error('Erreur paiement:', err);
      }
    });
  }
}