import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../services/boutique/boutique.service';

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

  constructor(private router: Router, private boutiqueService : BoutiqueService) {}

  ngOnInit(): void {
    this.chargerCategories();
    this.chargerBoutiques();
  }

  chargerBoutiques(): void {
    // Appel service pour récupérer les boutiques
      this.boutiqueService.getAllBoutique().subscribe(data => {
      this.boutiques = data;
      this.filtrerBoutiques();
    });

  }

  chargerCategories(): void {
    // Appel service pour récupérer les boutiques
      this.boutiqueService.getAllCategorie().subscribe(data => {
      this.listeCategoriesBoutique = data;
    });

  }

  filtrerBoutiques(): void {
    this.boutiquesFiltrees = this.boutiques.filter(boutique => {
      // Filtre par recherche (sur email)
      const matchSearch = !this.searchTerm || 
        boutique.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre par catégorie
      const matchCategorie = !this.categorieActive || 
        boutique.categorieId === this.categorieActive;
      
      return matchSearch && matchCategorie;
    });
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
    this.filtrerBoutiques();
  }

  voirBoutique(id: any): void {
    const boutiqueId = id.$oid || id;
    this.router.navigate([`/client-catalogue-produit/${boutiqueId}`]);
  }
}
