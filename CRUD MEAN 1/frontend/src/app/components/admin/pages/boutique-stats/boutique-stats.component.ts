import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MouvementService } from '../../../../services/mouvement-box/mouvement-box.service';

@Component({
  selector: 'app-boutique-stats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-stats.component.html',
  styleUrls: ['./boutique-stats.component.css']
})
export class BoutiqueStatsComponent implements OnInit {
  boutique: any;
  mouvements: any[] = [];
  paiements: any[] = [];
  boutiqueId: string = '';
  
  // États
  loading = true;
  error = '';

  moisFrancais = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(
    private route: ActivatedRoute,
    private mouvementService: MouvementService
  ) {}

  ngOnInit() {
    this.boutiqueId = this.route.snapshot.paramMap.get('id')!;
    if (!this.boutiqueId) {
      this.error = 'ID de boutique non valide';
      this.loading = false;
      return;
    }
    this.loadMouvements();
  }

  loadMouvements() {
    this.loading = true;
    this.error = '';
    
    this.mouvementService.getMouvementsByBoutique(this.boutiqueId)
      .subscribe({
        next: (res) => {
          this.boutique = res.boutique;
          this.mouvements = res.mouvements || [];
          this.paiements = res.paiements || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors du chargement des statistiques';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  getTotalPaye(): number {
    return this.paiements.reduce((total, p) => total + (p.montant || 0), 0);
  }

  getDernierPaiement(): string {
    if (this.paiements.length === 0) return '';
    
    const dernier = this.paiements[this.paiements.length - 1];
    return `${this.moisFrancais[dernier.mois]} ${dernier.annee}`;
  }

  getStatutBadgeClass(statut: string): string {
    switch(statut) {
      case 'en_cours':
        return 'bg-warning text-dark';
      case 'terminee':
        return 'bg-success';
      case 'annulee':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'en_cours':
        return 'bi-hourglass-split';
      case 'terminee':
        return 'bi-check-circle';
      case 'annulee':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }
}