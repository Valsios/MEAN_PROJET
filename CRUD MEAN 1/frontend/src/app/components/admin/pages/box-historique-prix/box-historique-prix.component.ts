import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MouvementPrixService } from '../../../../services/mouvement-prix/mouvement-prix.service';

@Component({
  selector: 'app-box-historique-prix',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './box-historique-prix.component.html',
  styleUrls: ['./box-historique-prix.component.css']
})
export class BoxHistoriquePrixComponent implements OnInit {
  mouvements: any[] = [];
  boxId!: string;
  
  // États
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private mouvementPrixService: MouvementPrixService
  ) {}

  ngOnInit(): void {
    this.boxId = this.route.snapshot.paramMap.get('id')!;
    if (!this.boxId) {
      this.error = 'ID de box non valide';
      this.loading = false;
      return;
    }
    this.loadHistorique();
  }

  loadHistorique() {
    this.loading = true;
    this.error = '';
    
    this.mouvementPrixService.getHistorique(this.boxId)
      .subscribe({
        next: (data) => {
          this.mouvements = data.sort((a: any, b: any) => 
            new Date(b.dateMvt).getTime() - new Date(a.dateMvt).getTime()
          );
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors du chargement de l\'historique';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  // Méthodes pour les statistiques
  getPremierPrix(): number {
    if (this.mouvements.length === 0) return 0;
    return this.mouvements[this.mouvements.length - 1].ancienPrix;
  }

  getPremiereDate(): Date {
    if (this.mouvements.length === 0) return new Date();
    return this.mouvements[this.mouvements.length - 1].dateMvt;
  }

  getDernierPrix(): number {
    if (this.mouvements.length === 0) return 0;
    return this.mouvements[0].nouveauPrix;
  }

  getDerniereDate(): Date {
    if (this.mouvements.length === 0) return new Date();
    return this.mouvements[0].dateMvt;
  }

  // Méthodes pour les variations
  getVariation(mouvement: any): string {
    const ancien = mouvement.ancienPrix;
    const nouveau = mouvement.nouveauPrix;
    const variation = ((nouveau - ancien) / ancien * 100).toFixed(1);
    return variation;
  }

  getVariationClass(mouvement: any): string {
    const ancien = mouvement.ancienPrix;
    const nouveau = mouvement.nouveauPrix;
    if (nouveau > ancien) return 'variation-up';
    if (nouveau < ancien) return 'variation-down';
    return 'variation-stable';
  }

  getVariationIcon(mouvement: any): string {
    const ancien = mouvement.ancienPrix;
    const nouveau = mouvement.nouveauPrix;
    if (nouveau > ancien) return 'bi-arrow-up';
    if (nouveau < ancien) return 'bi-arrow-down';
    return 'bi-dash';
  }
}