import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service';

@Component({
  selector: 'app-commandes-client-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueHeaderComponent, BoutiqueFooterComponent],
  templateUrl: './commande-client-liste.component.html',
})
export class CommandeClientListeComponent implements OnInit {
  commandes: any[] = [];
  commandeSelectionnee: any = null;
  isLoading: boolean = false;
  isLoadingAction: boolean = false;
  profile: any;
  client : any;
  
  // Pagination
  page: number = 1;
  limit: number = 10;
  total: number = 0;

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit() {
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
    this.chargerCommandes();
  }

  chargerCommandes() {
    this.isLoading = true;
    
    // Filtre pour les commandes en ligne en attente uniquement
    const params = {
      boutiqueId: this.profile._id,
      typeCommande: 'en_ligne',
      statut: 'en_attente',
      page: this.page,
      limit: this.limit
    };
    
    this.boutiqueService.getCommandes(params.boutiqueId).subscribe({
      next: (response: any) => {
        // Adaptation selon la structure de votre API
        this.commandes = response.commandes || response;
        this.total = response.total || this.commandes.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.isLoading = false;
      }
    });
  }

  voirDetails(commande: any) {
    this.commandeSelectionnee = commande;
    this.getClientInfo(commande);
  }

  fermerDetails() {
    this.commandeSelectionnee = null;
  }

  validerCommande() {
    if (!this.commandeSelectionnee) return;
    
    if (confirm('Valider cette commande ? Le stock sera décrémenté.')) {
      this.isLoadingAction = true;
      
      this.boutiqueService.validerCommande(this.commandeSelectionnee._id).subscribe({
        next: (response) => {
          alert('Commande validée avec succès !');
          
          // Recharger la liste
          this.chargerCommandes();
          
          // Fermer les détails
          this.commandeSelectionnee = null;
          this.isLoadingAction = false;
        },
        error: (err) => {
          console.error('Erreur validation:', err);
          alert('Erreur lors de la validation');
          this.isLoadingAction = false;
        }
      });
    }
  }

  annulerCommande() {
    if (!this.commandeSelectionnee) return;
    
    if (confirm('Annuler cette commande ? Cette action est irréversible.')) {
      this.isLoadingAction = true;
      
      this.boutiqueService.annulerCommande(this.commandeSelectionnee._id).subscribe({
        next: (response) => {
          alert('Commande annulée');
          this.chargerCommandes();
          this.commandeSelectionnee = null;
          this.isLoadingAction = false;
        },
        error: (err) => {
          console.error('Erreur annulation:', err);
          alert('Erreur lors de l\'annulation');
          this.isLoadingAction = false;
        }
      });
    }
  }

  changerPage(page: number) {
    this.page = page;
    this.chargerCommandes();
  }

  // Utilitaires
  getDateCommande(date: any): string {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSousTotal(commande: any): number {
    if (!commande.articles) return 0;
    return commande.articles.reduce((sum: number, a: any) => 
      sum + (a.prixUnitaire * a.quantite), 0);
  }

  getRemiseTotale(commande: any): number {
    return this.getSousTotal(commande) - (commande.montantTotal || 0);
  }

  getClientInfo(commande: any): any {
    return commande.boutiqueId;
  }
}