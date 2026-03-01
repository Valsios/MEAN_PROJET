import { Component, OnInit } from '@angular/core';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { ProduitService } from '../../../services/produit/produit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-boutique-panier',
  standalone: true,
  imports: [CommonModule,BoutiqueHeaderComponent,BoutiqueFooterComponent,ReactiveFormsModule],
  templateUrl: './boutique-panier.component.html',
})
export class BoutiquePanierComponent implements OnInit {
  
  lignePanierForm: FormGroup;
  produits: any[] = []; // À remplacer par votre service
  clients: any[] = []; // À remplacer par votre service
  
  produitsFiltres: any[] = [];
  produitSelectionne: any = null;
  afficherResultats = false;
  quantiteMax = 999;
  
  articlesPanier: any[] = [];
  typeCommande: 'en_ligne' | 'sur_place' = 'sur_place';
  clientSelectionne: any = null;

  profile : any;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder,private boutiqueService: BoutiqueService,
      private authService: AuthService,
      private router: Router,
    private produitService : ProduitService) {
      const storedProfile = localStorage.getItem('profile');
      this.profile = storedProfile ? JSON.parse(storedProfile) : null;
    this.lignePanierForm = this.fb.group({
      rechercheProduit: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    const storedProfile = localStorage.getItem('profile');
    const profile = storedProfile ? JSON.parse(storedProfile) : null;
    this.chargerProduits(profile._id);
    this.chargerClients();
  }

  chargerProduits(boutiqueId : any) {
   this.boutiqueService.getBoutiqueWithProduits(boutiqueId).subscribe({
      next: (produits) => {
        this.produits = produits; // Directement le tableau de produits
        console.log('Produits chargés:', this.produits);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.produits = [];
      }
    });
  }

  chargerClients() {
    // Appel service pour charger les clients
    // this.clients = ...
  }

  rechercherProduits() {
    const recherche = this.lignePanierForm.get('rechercheProduit')?.value?.toLowerCase();
    if (recherche && recherche.length >= 2) {
      this.produitsFiltres = this.produits.filter(p => 
        p.nom.toLowerCase().includes(recherche)
      );
    } else {
      this.produitsFiltres = [];
    }
  }
  // Dans BoutiquePanierComponent
  chargerPromotionProduit(produitId: string): Promise<any> {
    return new Promise((resolve) => {
      this.produitService.getPromotionActive(produitId).subscribe({
        next: (promotion) => {
          resolve(promotion);
        },
        error: (err) => {
          console.error('Erreur chargement promotion:', err);
          resolve(null);
        }
      });
    });
  }
    onBlurRecherche() {
    // Petit délai pour permettre le clic sur un élément de la liste
    setTimeout(() => {
      this.afficherResultats = false;
    }, 200);
  }

  changerQuantite(index: number, event: any) {
    const nouvelleQuantite = parseInt(event.target.value);
    if (!isNaN(nouvelleQuantite) && nouvelleQuantite > 0) {
      const article = this.articlesPanier[index];
      if (!article.stockRestant || nouvelleQuantite <= article.stockRestant + article.quantite) {
        article.quantite = nouvelleQuantite;
        this.mettreAJourTotal(index);
      }
    }
  }


  selectionnerClient(event: any) {
    this.clientSelectionne = event.target.value;
  }

  selectionnerProduit(produit: any) {
    this.produitSelectionne = produit;
    this.lignePanierForm.patchValue({
      rechercheProduit: produit.nom
    });
    this.afficherResultats = false;
    
    // Mettre à jour la quantité max basée sur le stock
    if (produit.gestionStock) {
      this.quantiteMax = produit.stockActuel;
      this.lignePanierForm.get('quantite')?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(produit.stockActuel)
      ]);
    } else {
      this.quantiteMax = 999;
      this.lignePanierForm.get('quantite')?.setValidators([
        Validators.required, 
        Validators.min(1)
      ]);
    }
    this.lignePanierForm.get('quantite')?.updateValueAndValidity();
  }

  async ajouterLigne() {
    if (this.lignePanierForm.valid && this.produitSelectionne) {
      const quantite = this.lignePanierForm.get('quantite')?.value;
      
      // Charger la promotion active
      const promotion = await this.chargerPromotionProduit(this.produitSelectionne._id);
      
      // Calculer le total avec la promotion si elle existe
      let total = this.produitSelectionne.prixActuel * quantite;
      let remise = 0;
      
      
      if (promotion) {
       
        
       
          remise = promotion.pourcentage;
          total = this.produitSelectionne.prixActuel * quantite * (1 - promotion.pourcentage / 100);

      }
      
      const article = {
        produitId: this.produitSelectionne._id,
        nomProduit: this.produitSelectionne.nom,
        quantite: quantite,
        prixUnitaire: this.produitSelectionne.prixActuel,
        remise: remise, // Pourcentage appliqué
        total: total,
        stockRestant: this.produitSelectionne.gestionStock ? 
          this.produitSelectionne.stockActuel - quantite : undefined,
        promotion: promotion
      };
      
      this.articlesPanier.push(article);
      this.recalculerTotaux();
      
      // Réinitialiser
      this.lignePanierForm.reset({ quantite: 1 });
      this.produitSelectionne = null;
    }
  }

  augmenterQuantite(index: number) {
    const article = this.articlesPanier[index];
    if (!article.stockRestant || article.quantite <= article.stockRestant) {
      article.quantite++;
      this.mettreAJourTotal(index);
    }
  }

  diminuerQuantite(index: number) {
    if (this.articlesPanier[index].quantite > 1) {
      this.articlesPanier[index].quantite--;
      this.mettreAJourTotal(index);
    }
  }

  mettreAJourTotal(index: number) {
    const article = this.articlesPanier[index];
    const prixApresRemise = article.prixUnitaire * (1 - article.remise / 100);
    article.total = prixApresRemise * article.quantite;
    this.recalculerTotaux();
  }

  supprimerLigne(index: number) {
    this.articlesPanier.splice(index, 1);
    this.recalculerTotaux();
  }

  viderPanier() {
    this.articlesPanier = [];
    this.recalculerTotaux();
  }

  recalculerTotaux() {
    // Les getters calculeront automatiquement
  }

  get sousTotal(): number {
    return this.articlesPanier.reduce((sum, article) => 
      sum + (article.prixUnitaire * article.quantite), 0
    );
  }

  get remiseTotale(): number {
    return this.sousTotal - this.montantTotal;
  }

  get montantTotal(): number {
    return this.articlesPanier.reduce((sum, article) => sum + article.total, 0);
  }

 


validerCommande() {
  if (this.isLoading) return; // Éviter les doubles clics
  
  const commande = {
    boutiqueId: this.profile._id,
    client: null,
    typeCommande: this.typeCommande,
    statut: this.typeCommande === 'en_ligne' ? 'en_attente' : 'validee',
    articles: this.articlesPanier.map(a => ({
      produitId: a.produitId,
      nomProduit: a.nomProduit,
      quantite: a.quantite,
      prixUnitaire: a.prixUnitaire,
      remise: a.remise,
      total: a.total
    })),
    createdAt : new Date(),
    montantTotal: this.montantTotal,
    validateOrCanceledAt : new Date()
  };
  
  console.log('Commande à valider:', commande);
  
 
  this.isLoading = true;
  
  this.boutiqueService.createCommande(commande).subscribe({
    next: (response) => {
      console.log('✅ Commande créée avec succès:', response);
     if (confirm('Commande validée avec succès ! Cliquez sur OK pour recharger la page.')) {
      window.location.reload();
}
      
      
    },
    error: (err) => {
      console.error('❌ Erreur:', err);
      alert('Erreur lors de la validation de la commande');
    },
    complete: () => {
      
      this.isLoading = false;
    }
  });
}
}
