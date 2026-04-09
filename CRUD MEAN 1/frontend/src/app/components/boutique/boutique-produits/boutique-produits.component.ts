import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-boutique-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueHeaderComponent, BoutiqueFooterComponent],
  templateUrl: './boutique-produits.component.html',
  styleUrls: ['./boutique-produits.component.css'] // Ajoutez ce fichier pour les styles
})
export class BoutiqueProduitsComponent implements OnInit {
  produits: any[] = [];           // Tous les produits (affichés dans le HTML)
  tousLesProduits: any[] = [];    // Copie de sauvegarde pour réinitialiser
  searchTerm: string = '';        // Terme de recherche
  
  // AJOUT : État de chargement
  dataLoaded: boolean = false;
  
  // AJOUT : État d'erreur
  error: string | null = null;

  constructor(
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedProfile = localStorage.getItem('profile');
    const profile = storedProfile ? JSON.parse(storedProfile) : null;
    
    if (profile?._id) {
      this.chargerProduits(profile._id);
    } else {
      this.error = 'Profil boutique non trouvé';
      this.dataLoaded = true; // Arrêter le loading même en erreur
    }
  }

  chargerProduits(boutiqueId: string): void {
    // Réinitialiser les états
    this.dataLoaded = false;
    this.error = null;
    
    this.boutiqueService.getBoutiqueWithProduits(boutiqueId).subscribe({
      next: (data) => {
        this.tousLesProduits = data;  // Sauvegarde tous les produits
        this.produits = data;          // Initialise l'affichage
        console.log('Boutique avec produits:', this.produits);
        // Données chargées avec succès
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.error = 'Erreur lors du chargement des produits';
        // Même en erreur, on arrête le loading pour ne pas bloquer l'interface
        this.dataLoaded = true;
        // Initialiser avec des tableaux vides
        this.tousLesProduits = [];
        this.produits = [];
      }
    });
  }

  // Filtrage dynamique (se déclenche à chaque frappe)
  filtrerProduits(): void {
    if (!this.searchTerm.trim()) {
      // Si recherche vide, restaurer tous les produits
      this.produits = [...this.tousLesProduits];
    } else {
      // Filtrer par nom (insensible à la casse)
      const terme = this.searchTerm.toLowerCase().trim();
      this.produits = this.tousLesProduits.filter(produit => 
        produit.nom?.toLowerCase().includes(terme)
      );
    }
  }

  // Réinitialiser la recherche
  resetFiltre(): void {
    this.searchTerm = '';
    this.produits = [...this.tousLesProduits];
  }

  produitForm(): void {
    this.router.navigate(['/produit-form']);
  }

  deleteProduct(productId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.boutiqueService.deleteProduit(productId).subscribe({
        next: (response) => {
          console.log('Produit supprimé avec succès', response);
          // Mettre à jour les deux listes
          this.tousLesProduits = this.tousLesProduits.filter(p => p._id !== productId);
          this.produits = this.produits.filter(p => p._id !== productId);
          
          // Afficher un message de succès (optionnel)
          // Vous pourriez utiliser un service de toast ici
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  detailsProduit(produitId: string): void {
    this.router.navigate([`/produit-details/${produitId}`]);
  }
}