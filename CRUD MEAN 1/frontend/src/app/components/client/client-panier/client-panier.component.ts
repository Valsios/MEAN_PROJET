import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';

import { AuthService } from '../../../auth/auth.service';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../../../services/client/client.service';

@Component({
  selector: 'app-client-panier',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    ClientHeaderComponent,
    ClientFooterComponent
  ],
  templateUrl: './client-panier.component.html',
})
export class ClientPanierComponent implements OnInit {

  //profile 
  profile : any;
  user : any;
  // Propriétés
  paniers: any[] = [];
  panierSelectionne: any = null;
  totalPanier: number = 0;
  totalToutesBoutiques: number = 0;
  
  // États de chargement
  isLoading: boolean = false;
  isLoadingAction: boolean = false;
  
  // Messages
  message: { type: string, text: string } | null = null;

  
  constructor(
    private panierService: ClientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.recupererClientInfo();
    this.chargerPaniers();
  }

  // Afficher un message (remplace toastr)
  showMessage(type: 'success' | 'error' | 'warning' | 'info', text: string) {
    this.message = { type, text };
    
    // Auto-effacer après 3 secondes
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }

  // Récupérer les infos du client connecté
  recupererClientInfo() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
  }

  // Charger tous les paniers du client
  chargerPaniers() {
    if (!this.profile._id) {
      this.showMessage('warning', 'Veuillez vous connecter');
      return;
    }

    this.isLoading = true;
    
    this.panierService.getPaniers(this.profile._id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.paniers = response || [];
          this.calculerTotaux();
          
          if (this.paniers.length === 0) {
            this.showMessage('info', 'Votre panier est vide');
          }
        },
        error: (error) => {
          console.error('Erreur chargement paniers:', error);
          this.showMessage('error', 'Erreur lors du chargement de votre panier');
        }
      });
  }

  // Calculer les totaux
  calculerTotaux() {
    this.totalToutesBoutiques = 0;
    
    this.paniers.forEach(panier => {
      const totalPanier = panier.articles?.reduce((sum: number, article: any) => {
        return sum + (article.prixUnitaire * article.quantite);
      }, 0) || 0;
      
      panier.sousTotal = totalPanier;
      panier.remiseTotale = panier.articles?.reduce((sum: number, article: any) => {
        const remise = (article.prixUnitaire * article.quantite * (article.remise || 0)) / 100;
        return sum + remise;
      }, 0) || 0;
      
      panier.totalApresRemise = totalPanier - panier.remiseTotale;
      this.totalToutesBoutiques += panier.totalApresRemise;
    });
  }

  // Voir les détails d'un panier
  voirDetailsPanier(panier: any) {
    if (this.panierSelectionne?._id === panier._id) {
      this.panierSelectionne = null;
    } else {
      this.panierSelectionne = panier;
    }
  }

  // Fermer les détails
  fermerDetails() {
    this.panierSelectionne = null;
  }

  // Augmenter la quantité
  augmenterQuantite(panier: any, article: any) {
    if (this.isLoadingAction) return;
    
    this.isLoadingAction = true;
    
    if (article.quantite >= (article.stock || 999)) {
      this.showMessage('warning', 'Stock insuffisant');
      this.isLoadingAction = false;
      return;
    }
    
    const nouvelleQuantite = article.quantite + 1;
    
    this.panierService.mettreAJourQuantite(
      panier._id,
      article.produitId,
      nouvelleQuantite
    ).pipe(finalize(() => this.isLoadingAction = false))
    .subscribe({
      next: () => {
        article.quantite = nouvelleQuantite;
        article.total = article.prixUnitaire * nouvelleQuantite * (1 - (article.remise || 0)/100);
        this.mettreAJourPanier(panier);
        this.showMessage('success', 'Quantité mise à jour');
      },
      error: (error) => {
        console.error('Erreur mise à jour:', error);
        this.showMessage('error', 'Erreur lors de la mise à jour');
      }
    });
  }

  // Diminuer la quantité
  diminuerQuantite(panier: any, article: any) {
    if (this.isLoadingAction) return;
    
    if (article.quantite <= 1) {
      this.supprimerArticle(panier, article);
      return;
    }
    
    this.isLoadingAction = true;
    const nouvelleQuantite = article.quantite - 1;
    
    this.panierService.mettreAJourQuantite(
      panier._id,
      article.produitId,
      nouvelleQuantite
    ).pipe(finalize(() => this.isLoadingAction = false))
    .subscribe({
      next: () => {
        article.quantite = nouvelleQuantite;
        article.total = article.prixUnitaire * nouvelleQuantite * (1 - (article.remise || 0)/100);
        this.mettreAJourPanier(panier);
        this.showMessage('success', 'Quantité mise à jour');
      },
      error: (error) => {
        console.error('Erreur mise à jour:', error);
        this.showMessage('error', 'Erreur lors de la mise à jour');
      }
    });
  }

  // Supprimer un article
  supprimerArticle(panier: any, article: any) {
    if (this.isLoadingAction) return;
    
    if (!confirm('Supprimer cet article du panier ?')) return;
    
    this.isLoadingAction = true;
    
    this.panierService.supprimerArticle(panier._id, article.produitId)
      .pipe(finalize(() => this.isLoadingAction = false))
      .subscribe({
        next: () => {
          const index = panier.articles.indexOf(article);
          if (index > -1) {
            panier.articles.splice(index, 1);
          }
          
          if (panier.articles.length === 0) {
            this.supprimerPanierVide(panier);
          } else {
            this.mettreAJourPanier(panier);
          }
          
          this.showMessage('success', 'Article supprimé du panier');
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.showMessage('error', 'Erreur lors de la suppression');
        }
      });
  }

  // Supprimer un panier vide
  supprimerPanierVide(panier: any) {
    const index = this.paniers.indexOf(panier);
    if (index > -1) {
      this.paniers.splice(index, 1);
    }
    if (this.panierSelectionne === panier) {
      this.panierSelectionne = null;
    }
    this.calculerTotaux();
  }

  // Mettre à jour les totaux du panier
  mettreAJourPanier(panier: any) {
    panier.sousTotal = panier.articles.reduce((sum: number, article: any) => {
      return sum + (article.prixUnitaire * article.quantite);
    }, 0);
    
    panier.remiseTotale = panier.articles.reduce((sum: number, article: any) => {
      const remise = (article.prixUnitaire * article.quantite * (article.remise || 0)) / 100;
      return sum + remise;
    }, 0);
    
    panier.totalApresRemise = panier.sousTotal - panier.remiseTotale;
    panier.montantTotal = panier.totalApresRemise;
    
    this.calculerTotaux();
  }

  // Valider le panier d'une boutique
  validerPanier(panier: any) {
    if (this.isLoadingAction) return;
    
    if (panier.articles.length === 0) {
      this.showMessage('warning', 'Panier vide');
      return;
    }
    
    if (!confirm(`Valider la commande chez ${panier.boutiqueNom || 'cette boutique'} ?`)) return;
    
    this.isLoadingAction = true;
    
    this.panierService.validerCommande(panier._id)
      .pipe(finalize(() => this.isLoadingAction = false))
      .subscribe({
        next: () => {
          this.showMessage('success', 'Commande validée avec succès !');
          
          const index = this.paniers.indexOf(panier);
          if (index > -1) {
            this.paniers.splice(index, 1);
          }
          
          if (this.panierSelectionne === panier) {
            this.panierSelectionne = null;
          }
          
          this.calculerTotaux();
        },
        error: (error) => {
          console.error('Erreur validation:', error);
          alert('Erreur de validation :' + error.error.message);
          this.showMessage('error', 'Erreur lors de la validation');
        }
      });
  }

  // Valider tous les paniers
  validerTousPaniers() {
    if (this.isLoadingAction) return;
    
    if (this.paniers.length === 0) {
      this.showMessage('warning', 'Aucun article dans le panier');
      return;
    }
    
    if (!confirm('Valider toutes les commandes ?')) return;
    
    this.isLoadingAction = true;
    
    let paniersValides = 0;
    let erreurs = 0;
    
    this.paniers.forEach(panier => {
      this.panierService.validerCommande(panier._id).subscribe({
        next: () => {
          paniersValides++;
          if (paniersValides + erreurs === this.paniers.length) {
            this.terminerValidation(paniersValides, erreurs);
          }
        },
        error: (error) => {
          erreurs++;
          console.error(`Erreur validation panier ${panier._id}:`, error);
          if (paniersValides + erreurs === this.paniers.length) {
            this.terminerValidation(paniersValides, erreurs);
          }
        }
      });
    });
  }

  terminerValidation(succes: number, erreurs: number) {
    this.isLoadingAction = false;
    
    if (erreurs === 0) {
      this.showMessage('success', `${succes} commande(s) validée(s) avec succès !`);
      this.chargerPaniers();
    } else {
      this.showMessage('warning', `${succes} validée(s), ${erreurs} erreur(s)`);
    }
  }

  // Vider tout le panier
  viderPanier() {
    if (this.isLoadingAction) return;
    
    if (this.paniers.length === 0) return;
    
    if (!confirm('Vider tout le panier ?')) return;
    
    this.isLoadingAction = true;
    
    this.panierService.viderPaniers(this.profile._id)
      .pipe(finalize(() => this.isLoadingAction = false))
      .subscribe({
        next: () => {
          this.paniers = [];
          this.panierSelectionne = null;
          this.totalToutesBoutiques = 0;
          this.showMessage('success', 'Panier vidé');
        },
        error: (error) => {
          console.error('Erreur vidage panier:', error);
          this.showMessage('error', 'Erreur lors du vidage du panier');
        }
      });
  }

  // Continuer les achats
  continuerAchats() {
    this.router.navigate(['/boutiques']);
  }

  // Formater le prix
  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' MGA';
  }

  // Obtenir le nom de la boutique
  getNomBoutique(panier: any): string {
    return panier.boutiqueNom || panier.boutiqueId?.nom || 'Boutique';
  }
  
  // Formater la date
  getDateCommande(date: string): string {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}