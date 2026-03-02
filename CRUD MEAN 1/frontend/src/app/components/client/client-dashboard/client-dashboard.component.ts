import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule,ClientHeaderComponent,ClientFooterComponent,ReactiveFormsModule,FormsModule],
  templateUrl: './client-dashboard.component.html'
})
export class ClientDashboardComponent {
  // Données
  boutiques: any[] = [];
  boutiquesFiltrees: any[] = [];
  
  // Catégories (à adapter avec votre liste)
  listeCategoriesBoutique: any[] = [];
  
  // Filtres
  searchTerm: string = '';
  categorieActive: string = '';

  // AJOUT : État de chargement
  dataLoaded: boolean = false;

  constructor(private router: Router, private boutiqueService : BoutiqueService) {}

  ngOnInit(): void {
    this.chargerDonneesInitiales();
  }

  // NOUVELLE MÉTHODE : Charge les données en parallèle
  chargerDonneesInitiales(): void {
    this.dataLoaded = false;
    
    // Charger les catégories et les boutiques en parallèle
    forkJoin({
      categories: this.boutiqueService.getAllCategorie(),
      boutiques: this.boutiqueService.getAllBoutique()
    }).subscribe({
      next: (results) => {
        // Traiter les catégories
        this.listeCategoriesBoutique = results.categories || [];
        console.log('Catégories chargées:', this.listeCategoriesBoutique);
        
        // Traiter les boutiques
        this.boutiques = results.boutiques || [];
        console.log('Boutiques chargées:', this.boutiques);
        
        // Appliquer le filtre initial
        this.filtrerBoutiques();
        
        // Données chargées avec succès
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        // Même en erreur, on arrête le loading
        this.dataLoaded = true;
        
        // Initialiser avec des valeurs par défaut
        this.listeCategoriesBoutique = [];
        this.boutiques = [];
        this.boutiquesFiltrees = [];
      }
    });
  }

  // MÉTHODE MODIFIÉE : Supprimée car fusionnée dans chargerDonneesInitiales
  // chargerBoutiques(): void { ... }

  // MÉTHODE MODIFIÉE : Supprimée car fusionnée dans chargerDonneesInitiales
  // chargerCategories(): void { ... }

  filtrerBoutiques(): void {
    if (!this.boutiques || this.boutiques.length === 0) {
      this.boutiquesFiltrees = [];
      return;
    }

    this.boutiquesFiltrees = this.boutiques.filter(boutique => {
      // Filtre par recherche (sur nom)
      const matchSearch = !this.searchTerm || 
        (boutique.nom && boutique.nom.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Filtre par catégorie
      const matchCategorie = !this.categorieActive || 
        this.boutiqueCorrespondCategorie(boutique, this.categorieActive);
      
      return matchSearch && matchCategorie;
    });
  }

  // Méthode utilitaire pour vérifier si une boutique correspond à une catégorie
  boutiqueCorrespondCategorie(boutique: any, categorieId: string): boolean {
    if (!boutique || !boutique.categorieId) return false;
    
    // Extraire l'ID de la catégorie de la boutique
    const boutiqueCategorieId = boutique.categorieId?.$oid || boutique.categorieId;
    
    // Comparer avec l'ID de la catégorie active
    return boutiqueCategorieId === categorieId;
  }

  getCategorieBoutique(boutique: any): string {
    if (!boutique || !boutique.categorieId) return 'Non catégorisé';
    
    // Extraire l'ID de la catégorie (gère les formats avec/sans $oid)
    const categorieId = boutique.categorieId?.$oid || boutique.categorieId;
    
    // Chercher la catégorie correspondante dans la liste
    const categorie = this.listeCategoriesBoutique.find(cat => {
      const catId = cat._id?.$oid || cat._id;
      return catId === categorieId;
    });
    
    return categorie ? categorie.nom : 'Non catégorisé';
  }

  resetFiltre(): void {
    this.searchTerm = '';
    this.categorieActive = '';
    this.filtrerBoutiques();
  }

  voirBoutique(id: any): void {
    const boutiqueId = id.$oid || id;
    this.router.navigate([`/client-catalogue-produit/${boutiqueId}`]);
  }

  reportBoutique(boutiqueId: string) {
    this.router.navigate(['/client/report', boutiqueId]);
  }
}