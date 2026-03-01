import { Component } from '@angular/core';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { AuthService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';
import { ClientService } from '../../../services/client/client.service';
import { finalize } from 'rxjs';

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

  // États de chargement
  isLoading: boolean = false;
  produitEnCours: string | null = null; 

  //
  user :any;
  profile :any;

  // ========== PROPRIÉTÉS POUR LES AVIS BOUTIQUE ==========
  boutiqueReviews: any[] = [];
  boutiqueNoteGlobale: number = 0;
  boutiqueTotalReviews: number = 0;
  boutiqueReviewsParNote: { [key: number]: number } = {1:0, 2:0, 3:0, 4:0, 5:0};
  isLoadingBoutiqueReviews: boolean = false;
  
  // Pagination des avis boutique
  boutiqueCurrentPage: number = 1;
  boutiquePageSize: number = 3;
  boutiquePaginatedReviews: any[] = [];
  boutiqueTotalPages: number = 1;
  showAllBoutiqueReviews: boolean = false;

  // ========== PROPRIÉTÉS POUR LA NOTATION ==========
  showRatingModal: boolean = false;  // Nouvelle propriété pour le modal personnalisé
  selectedRating: number = 0;
  hoverRating: number = 0;
  boutiqueComment: string = '';
  isSubmittingRating: boolean = false;
  ratingMessage: { type: string, icon: string, text: string } | null = null;

  Math = Math; // Pour utiliser Math dans le template

  constructor(
    private boutiqueService: BoutiqueService,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private route : ActivatedRoute
  ) {
    this.loadUserData();
    // Récupérer l'ID au moment de l'instanciation
    this.boutiqueId = this.route.snapshot.paramMap.get('id') || '';
    this.boutiqueService.getBoutiqueByIdVals(this.boutiqueId).subscribe(
      {
        next: (data) => {
          this.boutique = data[0]; 
          console.log(this.boutique);
          // Charger les avis après avoir récupéré la boutique
          this.chargerBoutiqueReviews();
        },
        error: (err) => console.error(err)
      }
    );
    console.log('ID récupéré:', this.boutiqueId);
  }

  ngOnInit(): void {
    this.chargerProduits(this.boutiqueId);
  }

  loadUserData() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
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

  // ========== MÉTHODES POUR LES AVIS BOUTIQUE ==========
  chargerBoutiqueReviews() {
    if (!this.boutiqueId) return;
    
    this.isLoadingBoutiqueReviews = true;
    
    // Utiliser le service pour récupérer les avis sur la boutique
    this.boutiqueService.getAvisClient(this.boutiqueId).subscribe({
      next: (reviews) => {
        this.boutiqueReviews = reviews || [];
        this.boutiqueTotalReviews = this.boutiqueReviews.length;
        this.calculerStatsBoutique();
        this.updateBoutiquePagination();
        this.isLoadingBoutiqueReviews = false;
      },
      error: (error) => {
        console.error('Erreur chargement avis boutique:', error);
        this.isLoadingBoutiqueReviews = false;
      }
    });
  }

  calculerStatsBoutique() {
    if (this.boutiqueReviews.length === 0) {
      this.boutiqueNoteGlobale = 0;
      return;
    }

    // Réinitialiser les compteurs
    this.boutiqueReviewsParNote = {1:0, 2:0, 3:0, 4:0, 5:0};
    
    let total = 0;
    this.boutiqueReviews.forEach(review => {
      total += review.note;
      this.boutiqueReviewsParNote[review.note]++;
    });
    
    this.boutiqueNoteGlobale = total / this.boutiqueReviews.length;
  }

  updateBoutiquePagination() {
    const pageSize = this.showAllBoutiqueReviews ? this.boutiqueTotalReviews : this.boutiquePageSize;
    this.boutiqueTotalPages = Math.ceil(this.boutiqueTotalReviews / pageSize);
    
    const startIndex = (this.boutiqueCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    this.boutiquePaginatedReviews = this.boutiqueReviews.slice(startIndex, endIndex);
  }

  changeBoutiquePage(page: number) {
    const pageSize = this.showAllBoutiqueReviews ? this.boutiqueTotalReviews : this.boutiquePageSize;
    const totalPages = Math.ceil(this.boutiqueTotalReviews / pageSize);
    
    if (page < 1 || page > totalPages) return;
    this.boutiqueCurrentPage = page;
    this.updateBoutiquePagination();
  }

  toggleAllReviews() {
    this.showAllBoutiqueReviews = !this.showAllBoutiqueReviews;
    this.boutiqueCurrentPage = 1; // Revenir à la première page
    this.updateBoutiquePagination();
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

  ajouterPanier(produitId: any, quantite: number = 1): void {
    // Marquer le produit comme en cours d'ajout
    this.produitEnCours = produitId
    this.isLoading = true;

    // Préparer les données
    const data = {
      boutiqueId: this.boutiqueId,
      produitId: produitId,
      quantite: quantite,
      clientEmail: this.profile?.email,
      clientTelephone: this.profile?.telephone
    };

    // Appel au service
    this.clientService.ajouterAuPanier(this.profile?._id, data)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.produitEnCours = null;
      }))
      .subscribe({
        next: (response) => {
          alert('Ajouté au panier');
        },
        error: (error) => {
          console.error('Erreur ajout panier:', error);
          alert('Erreur lors de l\'ajout au panier');
        }
      });
  }

  detailsProduit(produitId: string): void {
    this.router.navigate([`/client-produit-details/${produitId}`]);
  }

  // ========== MÉTHODES POUR LA NOTATION (MODAL PERSONNALISÉ) ==========
  openRatingModal() {
    if (!this.profile?._id) {
      alert('Veuillez vous connecter pour noter cette boutique');
      this.router.navigate(['/login']);
      return;
    }

    // Réinitialiser le formulaire
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.boutiqueComment = '';
    this.ratingMessage = null;
    
    // Ouvrir le modal personnalisé (pas de Bootstrap)
    this.showRatingModal = true;
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  closeRatingModal() {
    this.showRatingModal = false;
    this.ratingMessage = null;
    
    // Réactiver le scroll du body
    document.body.style.overflow = 'auto';
  }

  submitBoutiqueRating() {
    if (!this.selectedRating) {
      this.showRatingMessage('warning', 'Veuillez sélectionner une note', 'warning');
      return;
    }

    if (!this.profile?._id) {
      this.showRatingMessage('danger', 'Vous devez être connecté', 'close');
      return;
    }

    this.isSubmittingRating = true;
    this.ratingMessage = null;

    const ratingData = {
      boutiqueId: this.boutiqueId,
      clientId: this.profile._id,
      clientEmail: this.profile.email,
      note: this.selectedRating,
      commentaire: this.boutiqueComment.trim() || null
    };

    console.log('Données envoyées:', ratingData);

    // Appel au service pour noter la boutique
    this.boutiqueService.noterBoutique(ratingData).subscribe({
      next: (response) => {
        this.isSubmittingRating = false;
        this.showRatingMessage('success', 'Merci pour votre avis !', 'checkmark-circle');
        
        // Fermer le modal après 1.5 secondes
        setTimeout(() => {
          this.closeRatingModal();
          // Recharger les avis
          this.chargerBoutiqueReviews();
        }, 1500);
      },
      error: (error) => {
        this.isSubmittingRating = false;
        console.error('Erreur notation boutique:', error);
        
        if (error.status === 409) {
          this.showRatingMessage('warning', 'Vous avez déjà noté cette boutique', 'warning');
        } else {
          this.showRatingMessage('danger', 'Erreur lors de la publication', 'close');
        }
      }
    });
  }

  showRatingMessage(type: string, text: string, icon: string) {
    this.ratingMessage = { type, text, icon };
    setTimeout(() => {
      this.ratingMessage = null;
    }, 3000);
  }
}