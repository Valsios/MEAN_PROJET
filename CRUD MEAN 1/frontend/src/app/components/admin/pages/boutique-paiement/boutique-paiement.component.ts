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
        this.genererMois();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des informations';
        console.error('Erreur:', err);
      }
    });
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