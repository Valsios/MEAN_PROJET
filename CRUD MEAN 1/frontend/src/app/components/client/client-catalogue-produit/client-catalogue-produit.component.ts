import { Component } from '@angular/core';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';

@Component({
  selector: 'app-client-catalogue-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientHeaderComponent, ClientFooterComponent],
  templateUrl: './client-catalogue-produit.component.html',
})
export class ClientCatalogueProduitComponent {
  produits: any[] = [];           // Tous les produits (affichés dans le HTML)
    tousLesProduits: any[] = [];    // Copie de sauvegarde pour réinitialiser
    searchTerm: string = '';   
    boutiqueId : any;
    boutique : any;     // Terme de recherche
  
    constructor(
      private boutiqueService: BoutiqueService,
      private authService: AuthService,
      private router: Router,
      private route : ActivatedRoute
    ) {
       // Récupérer l'ID au moment de l'instanciation
      this.boutiqueId = this.route.snapshot.paramMap.get('id') || '';
      this.boutiqueService.getBoutiqueById(this.boutiqueId).subscribe(
        {
          next: (data) => {
          this.boutique = data[0]; 
          console.log(this.boutique);
        },
        error: (err) => console.error(err)
        }
      );
      console.log('ID récupéré:', this.boutiqueId);
    }
  
    ngOnInit(): void {
      this.chargerProduits(this.boutiqueId);
    }
  
    chargerProduits(boutiqueId: string): void {
      this.boutiqueService.getBoutiqueWithProduits(boutiqueId).subscribe({
        next: (data) => {
          this.tousLesProduits = data;  // Sauvegarde tous les produits
          this.produits = data;          // Initialise l'affichage
          console.log('Boutique avec produits:', this.produits);
        },
        error: (err) => console.error(err)
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
  
    
  
    ajouterPanier(produitId: string): void {
      //this.router.navigate([`/produit-details/${produitId}`]);
    }
}
