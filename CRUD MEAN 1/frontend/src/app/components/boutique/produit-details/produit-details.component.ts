import { Component } from '@angular/core';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit/produit.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-produit-details',
  standalone: true,
  imports: [CommonModule, BoutiqueHeaderComponent, BoutiqueFooterComponent, ReactiveFormsModule],
  templateUrl: './produit-details.component.html',
})

export class ProduitDetailsComponent {
  produit: any;
  promotionActive: any;
  reviews: any[] = [];
  produitId!: string;
  prixFinal!: number;
  imagePreview: string | null = null;
  selectedFileBase64: string | null = null;
  
  // AJOUT : État de chargement principal
  dataLoaded: boolean = false;
  
  // Propriétés pour les reviews
  noteGlobale: number = 0;
  totalReviews: number = 0;
  reviewsParNote: { [key: number]: number } = {1:0, 2:0, 3:0, 4:0, 5:0};
  isLoadingReviews: boolean = false;
  
  // Pagination des reviews (côté client)
  currentPage: number = 1;
  pageSize: number = 5;
  paginatedReviews: any[] = [];
  
  // Formulaires
  updateForm: FormGroup;
  priceForm: FormGroup;
  stockForm: FormGroup;
  promoForm: FormGroup;

  today: string = new Date().toISOString().split('T')[0];
  
  // Loading states pour les actions
  isLoading: boolean = false;

  // Compteur pour suivre les requêtes terminées
  private loadedRequests: number = 0;
  private totalRequests: number = 3; // produit + promotion + reviews

  Math = Math; // Pour utiliser Math dans le template

  constructor(
    private produitService: ProduitService, 
    private router: Router, 
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Récupérer l'ID au moment de l'instanciation
    this.produitId = this.route.snapshot.paramMap.get('id') || '';
    console.log('ID récupéré:', this.produitId);
    
    // Initialiser les formulaires
    this.updateForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });

    this.priceForm = this.fb.group({
      nouveauPrix: ['', [Validators.required, Validators.min(0)]]
    });

    this.stockForm = this.fb.group({
      quantite: ['', [Validators.required, Validators.min(1)]]
    });

    this.promoForm = this.fb.group({
      pourcentage: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      dateFin: ['']
    });
  }

  ngOnInit() {
    if (this.produitId) {
      this.chargerDonneesCompletes();
    } else {
      this.router.navigate(['/boutique-produits']);
    }
  }

  private checkAllDataLoaded() {
    this.loadedRequests++;
    if (this.loadedRequests === this.totalRequests) {
      // Toutes les requêtes sont terminées
      this.dataLoaded = true;
    }
  }

  chargerDonneesCompletes() {
    // Réinitialiser
    this.dataLoaded = false;
    this.loadedRequests = 0;
    
    // Charger produit
    this.produitService.getProduitById(this.produitId).subscribe({
      next: (produit) => {
        this.produit = produit;
        
        // Remplir le formulaire d'update avec les données existantes
        this.updateForm.patchValue({
          nom: produit.nom,
          description: produit.description
        });
        
        this.calculerPrixFinal();
        this.checkAllDataLoaded();
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.checkAllDataLoaded(); // Compter même en erreur
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
        
        // Pré-remplir le formulaire si une promotion existe
        if (this.promotionActive) {
          this.promoForm.patchValue({
            pourcentage: this.promotionActive.pourcentage,
            dateFin: this.promotionActive.dateFin ? new Date(this.promotionActive.dateFin).toISOString().split('T')[0] : ''
          });
        }
        this.checkAllDataLoaded();
      },
      error: (error) => {
        console.error('Erreur chargement promotion:', error);
        this.checkAllDataLoaded(); // Compter même en erreur
      }
    });

    // Charger les reviews
    this.loadReviews();
  }

  // MÉTHODES POUR LES REVIEWS
  loadReviews() {
    this.isLoadingReviews = true;
    
    // Utilisation directe de la fonction getReviews
    this.produitService.getReviews(this.produitId).subscribe({
      next: (response) => {
        // La réponse peut être directement un tableau ou un objet avec une propriété data
        this.reviews = Array.isArray(response) ? response : response.data || [];
        this.totalReviews = this.reviews.length;
        this.calculateGlobalNote();
        this.updatePaginatedReviews();
        this.isLoadingReviews = false;
        this.checkAllDataLoaded(); // Compter la requête reviews
      },
      error: (error) => {
        console.error('Erreur chargement reviews:', error);
        this.isLoadingReviews = false;
        this.checkAllDataLoaded(); // Compter même en erreur
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

  // Pagination côté client
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

  // Mettre à jour le prix
  onUpdatePrice() {
    if (this.priceForm.valid) {
      this.isLoading = true;
      
      const newPrice = this.priceForm.value.nouveauPrix;
      
      this.produitService.updatePrice(this.produitId, newPrice).subscribe({
        next: (response) => {
          console.log('Prix mis à jour:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Erreur mise à jour prix:', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Mettre à jour le produit (nom, description, image)
  onUpdateProduct() {
    if (this.updateForm.valid) {
      this.isLoading = true;
      
      const productData = {
        nom: this.updateForm.value.nom,
        description: this.updateForm.value.description || '',
        image: this.selectedFileBase64 || null
      };
     
      this.produitService.updateProduct(this.produitId, productData).subscribe({
        next: (response) => {
          console.log('Produit mis à jour:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Erreur mise à jour produit:', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Ravitailler le stock
  onRestock() {
    if (this.stockForm.valid) {
      this.isLoading = true;
      
      const quantite = this.stockForm.value.quantite;
      
      this.produitService.restockProduct(this.produitId, quantite).subscribe({
        next: (response) => {
          console.log('Stock ravitaillé:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Erreur ravitaillement:', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Sélection d'image
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        let base64String = reader.result as string;
        const commaIndex = base64String.indexOf(',');
        this.imagePreview = reader.result as string;
        this.selectedFileBase64 = commaIndex >= 0 ? base64String.substring(commaIndex + 1) : base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  // Ajouter ou remplacer une promotion
  onAjouterPromo() {
    if (this.promoForm.valid) {
      this.isLoading = true;
      
      const promoData = {
        produitId: this.produitId,
        pourcentage: this.promoForm.value.pourcentage,
        dateFin: this.promoForm.value.dateFin || null
      };

      if (this.promotionActive) {
        this.produitService.remplacerPromotion(this.promotionActive._id, promoData).subscribe({
          next: (response) => {
            console.log('Promotion remplacée:', response);
            window.location.reload();
          },
          error: (error) => {
            console.error('Erreur remplacement promotion:', error);
            this.isLoading = false;
          }
        });
      } else {
        this.produitService.ajouterPromotion(promoData).subscribe({
          next: (response) => {
            console.log('Promotion ajoutée:', response);
            window.location.reload();
          },
          error: (error) => {
            console.error('Erreur ajout promotion:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }

  // Désactiver la promotion active
  onDesactiverPromo() {
    if (confirm('Êtes-vous sûr de vouloir désactiver cette promotion ?')) {
      this.isLoading = true;
      
      this.produitService.desactiverPromotion(this.promotionActive._id).subscribe({
        next: (response) => {
          console.log('Promotion désactivée:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Erreur désactivation promotion:', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Getters
  get pourcentageControl() {
    return this.promoForm.get('pourcentage');
  }

  get dateFinControl() {
    return this.promoForm.get('dateFin');
  }

  get priceControl() {
    return this.priceForm.get('nouveauPrix');
  }

  get quantiteControl() {
    return this.stockForm.get('quantite');
  }

  get nomControl() {
    return this.updateForm.get('nom');
  }
}