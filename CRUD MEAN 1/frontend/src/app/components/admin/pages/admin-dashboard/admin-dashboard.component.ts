import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats!: DashboardStats;
  loading = true;
  error = '';
  
  // Filtres
  moisActuel = new Date().getMonth() + 1;
  anneeActuelle = new Date().getFullYear();
  moisFiltre: number = this.moisActuel;
  anneeFiltre: number = this.anneeActuelle;
  
  // Onglet actif
  activeTab: 'ensemble' | 'financier' | 'occupation' | 'client' | 'performance' = 'ensemble';
  
  // Mois en français
  moisFrancais = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = '';
    
    this.dashboardService.getDashboardStats(this.moisFiltre, this.anneeFiltre)
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des statistiques';
          this.loading = false;
          console.error('Erreur dashboard:', err);
        }
      });
  }

  appliquerFiltres() {
    this.loadStats();
  }

  getMoisNom(moisNum: number): string {
    return this.moisFrancais[moisNum - 1];
  }

  // Helper pour les pourcentages
  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  // Helper pour les montants
  formatMontant(montant: number): string {
    return montant.toLocaleString() + ' Ar';
  }

  // Helper pour les dates
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  // Récupérer la valeur maximale des paiements pour l'échelle du graphique
getMaxPaiement(): number {
  if (!this.stats?.paiementsParMois || this.stats.paiementsParMois.length === 0) {
    return 1;
  }
  return Math.max(...this.stats.paiementsParMois.map(p => p.montant));
}

// Récupérer la valeur maximale des reports pour l'échelle du graphique
getMaxReports(): number {
  if (!this.stats?.evolutionReports || this.stats.evolutionReports.length === 0) {
    return 1;
  }
  return Math.max(...this.stats.evolutionReports.map(r => r.count));
}

// Récupérer la valeur maximale des reports par catégorie
getMaxReportsCategorie(): number {
  if (!this.stats?.reportsParCategorie || this.stats.reportsParCategorie.length === 0) {
    return 1;
  }
  return Math.max(...this.stats.reportsParCategorie.map(c => c.count));
}

// Combiner les entrées et sorties par mois
getMouvementsParMois(): any[] {
  if (!this.stats?.mouvementsParMois) return [];

  const mouvementsMap = new Map();
  
  // La structure de mouvementsParMois dans le backend est un objet avec deux propriétés
  // { entrees: [...], sorties: [...] }
  
  // Traiter les entrées
  if (this.stats.mouvementsParMois.entrees && Array.isArray(this.stats.mouvementsParMois.entrees)) {
    this.stats.mouvementsParMois.entrees.forEach((e: any) => {
      if (e && e._id) {
        const key = `${e._id.annee}-${e._id.mois}`;
        mouvementsMap.set(key, {
          mois: this.getMoisNom(e._id.mois) + ' ' + e._id.annee,
          entrees: e.count || 0,
          sorties: 0,
          annee: e._id.annee,
          moisNum: e._id.mois
        });
      }
    });
  }

  // Traiter les sorties
  if (this.stats.mouvementsParMois.sorties && Array.isArray(this.stats.mouvementsParMois.sorties)) {
    this.stats.mouvementsParMois.sorties.forEach((s: any) => {
      if (s && s._id) {
        const key = `${s._id.annee}-${s._id.mois}`;
        if (mouvementsMap.has(key)) {
          const existing = mouvementsMap.get(key);
          existing.sorties = s.count || 0;
        } else {
          mouvementsMap.set(key, {
            mois: this.getMoisNom(s._id.mois) + ' ' + s._id.annee,
            entrees: 0,
            sorties: s.count || 0,
            annee: s._id.annee,
            moisNum: s._id.mois
          });
        }
      }
    });
  }

  // Convertir en tableau et trier
  const result = Array.from(mouvementsMap.values());
  result.sort((a: any, b: any) => {
    if (a.annee !== b.annee) return b.annee - a.annee;
    return b.moisNum - a.moisNum;
  });
  
  result.forEach((item: any) => {
    item.solde = (item.entrees || 0) - (item.sorties || 0);
  });
  
  return result;
}

// Vérifier si les données existent
hasData(): boolean {
  return !!this.stats;
}

// Sécurité pour totalBoxes
getTotalBoxes() {
  return this.stats?.totalBoxes || { total: 0, libres: 0, occupees: 0 };
}

// Calculer le pourcentage d'occupation
getOccupationPercentage(): number {
  const totalBoxes = this.getTotalBoxes();
  if (totalBoxes.total === 0) return 0;
  return (totalBoxes.occupees / totalBoxes.total) * 100;
}

// Calculer le pourcentage de box libres
getLibresPercentage(): number {
  const totalBoxes = this.getTotalBoxes();
  if (totalBoxes.total === 0) return 0;
  return (totalBoxes.libres / totalBoxes.total) * 100;
}

// Obtenir le nombre de boutiques à jour
getBoutiquesAJour(): number {
  if (!this.stats?.totalBoxes?.occupees) return 0;
  return Math.round(this.stats.totalBoxes.occupees * (this.stats.tauxRecouvrement || 0) / 100);
}
}