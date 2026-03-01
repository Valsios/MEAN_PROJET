import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit/produit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';
import { ClientService } from '../../../services/client/client.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-produit-details',
  standalone: true,
  imports: [
    CommonModule, 
    ClientHeaderComponent, 
    ClientFooterComponent, 
    ReactiveFormsModule,
    FormsModule  // Ajouté pour ngModel
  ],
  templateUrl: './client-produit-details.component.html',
})

export class ClientProduitDetailsComponent {
  produit: any;
  promotionActive: any;
  reviews: any[] = [];
  produitId!: string;
  prixFinal!: number;
  
  // Propriétés pour les reviews
  noteGlobale: number = 0;
  totalReviews: number = 0;
  reviewsParNote: { [key: number]: number } = {1:0, 2:0, 3:0, 4:0, 5:0};
  isLoadingReviews: boolean = false;
  
  // Pagination des reviews (côté client)
  currentPage: number = 1;
  pageSize: number = 5;
  paginatedReviews: any[] = [];
  
  // Propriétés pour le formulaire de review
  selectedRating: number = 0;
  hoverRating: number = 0;
  reviewComment: string = '';
  isLoadingReview: boolean = false;
  reviewMessage: { type: string, icon: string, text: string } | null = null;
  
  // Client connecté
  clientId: string = '';
  clientEmail: string = '';

  today: string = new Date().toISOString().split('T')[0];
  
  // Loading states
  isLoading: boolean = false;

  Math = Math; // Pour utiliser Math dans le template

  constructor(
    private produitService: ProduitService, 
    private clientService: ClientService,
    private router: Router, 
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Récupérer l'ID au moment de l'instanciation
    this.produitId = this.route.snapshot.paramMap.get('id') || '';
    console.log('ID récupéré:', this.produitId);
    
    // Récupérer les infos du client connecté
    this.recupererClientInfo();
  }

  ngOnInit() {
    if (this.produitId) {
      this.chargerDonneesCompletes();
    } else {
      this.router.navigate(['/client-dashboard']);
    }
  }

  // Récupérer les infos du client connecté
  recupererClientInfo() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.clientId = userData._id || userData.id;
      this.clientEmail = userData.email;
    }
  }

  chargerDonneesCompletes() {
    // Charger produit
    this.produitService.getProduitById(this.produitId).subscribe({
      next: (produit) => {
        this.produit = produit;        
        this.calculerPrixFinal();
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
      }
    });

    // Charger promotion
    this.produitService.getPromotionActive(this.produitId).subscribe({
      next: (promo) => {
        console.log('Promotion reçue:', promo);
        
        // Traiter le pourcentage si c'est un objet
        if (promo && promo.pourcentage) {
          if (typeof promo.pourcentage === 'object') {
            promo.pourcentage = promo.pourcentage.value || 
                               promo.pourcentage.$numberDecimal || 
                               Number(promo.pourcentage);
          }
        }
        
        this.promotionActive = promo;
        this.calculerPrixFinal();
        
      },
      error: (error) => {
        console.error('Erreur chargement promotion:', error);
      }
    });

    // Charger les reviews
    this.loadReviews();
  }

  // ========== MÉTHODES POUR LES REVIEWS ==========
  
  loadReviews() {
    this.isLoadingReviews = true;
    
    this.produitService.getReviews(this.produitId).subscribe({
      next: (response) => {
        this.reviews = Array.isArray(response) ? response : response.data || [];
        this.totalReviews = this.reviews.length;
        this.calculateGlobalNote();
        this.updatePaginatedReviews();
        this.isLoadingReviews = false;
      },
      error: (error) => {
        console.error('Erreur chargement reviews:', error);
        this.isLoadingReviews = false;
      }
    });
  }

  calculateGlobalNote() {
    if (this.reviews.length === 0) {
      this.noteGlobale = 0;
      return;
    }
    
    // Réinitialiser les compteurs
    this.reviewsParNote = {1:0, 2:0, 3:0, 4:0, 5:0};
    
    let total = 0;
    this.reviews.forEach(review => {
      total += review.note;
      this.reviewsParNote[review.note]++;
    });
    
    this.noteGlobale = total / this.reviews.length;
  }

  // Pagination
  updatePaginatedReviews() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReviews = this.reviews.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    const totalPages = Math.ceil(this.totalReviews / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.updatePaginatedReviews();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalReviews / this.pageSize);
  }

  // ========== MÉTHODES POUR LE FORMULAIRE DE REVIEW ==========
  
  soumettreReview() {
    

    this.isLoadingReview = true;

    const reviewData = {
      produitId: this.produitId,
      clientId: this.clientId,
      clientEmail: this.clientEmail,
      note: this.selectedRating,
      commentaire: this.reviewComment.trim() || null,
      date: new Date()
    };

    this.produitService.ajouterReview(reviewData).subscribe({
      next: (response) => {
        this.isLoadingReview = false;
        alert('Votre avis a été publié avec succès !');
        
        // Réinitialiser le formulaire
        this.selectedRating = 0;
        this.hoverRating = 0;
        this.reviewComment = '';
        
        // Recharger les reviews
        this.loadReviews();
      },
      error: (error) => {
        this.isLoadingReview = false;
        console.error('Erreur ajout review:', error);
        
      }
    });
  }

  

  // ========== AUTRES MÉTHODES ==========
  
  calculerPrixFinal() {
    if (this.produit && this.promotionActive) {
      const pourcentage = Number(this.promotionActive.pourcentage);
      if (!isNaN(pourcentage)) {
        const reduction = this.produit.prixActuel * (pourcentage / 100);
        this.prixFinal = this.produit.prixActuel - reduction;
      } else {
        this.prixFinal = this.produit.prixActuel;
      }
    } else if (this.produit) {
      this.prixFinal = this.produit.prixActuel;
    }
  }

  // Ajouter au panier
  ajouterPanier() {
    // Logique d'ajout au panier
    console.log('Ajouter au panier:', this.produitId);
  }

  // Retour à la liste
  retourListe() {
    this.router.navigate(['/client-dashboard']);
  }
}