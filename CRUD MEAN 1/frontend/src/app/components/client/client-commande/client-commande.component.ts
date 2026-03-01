import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { ClientFooterComponent } from '../client-footer/client-footer.component';
import { ClientService } from '../../../services/client/client.service';

@Component({
  selector: 'app-client-commande',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ClientHeaderComponent,
    ClientFooterComponent
  ],
  templateUrl: './client-commande.component.html',
})
export class ClientCommandeComponent implements OnInit {
  // Propriétés
  commandes: any[] = [];
  commandesFiltrees: any[] = [];
  commandeSelectionnee: any = null;
  
  // Filtres
  filtreStatut: string = 'tous'; // 'tous', 'en_attente', 'validee', 'annule'
  
  // États
  isLoading: boolean = false;
  
  // Client connecté
 profile : any;
 user : any;

  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    validees: 0,
    annule:0
   
  };

  Math = Math; // Pour utilisation dans le template

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.recupererClientInfo();
    this.chargerCommandes();
  }

  // Récupérer les infos du client
  recupererClientInfo() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
  }

  // Charger les commandes
  chargerCommandes() {
    if (!this.profile) {
      console.error('Client non connecté');
      return;
    }

    this.isLoading = true;
    
    this.clientService.getCommandes(this.profile._id).subscribe({
      next: (response) => {
        this.commandes = response || [];
        this.appliquerFiltre();
        this.calculerStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.isLoading = false;
      }
    });
  }

  // Appliquer le filtre
  appliquerFiltre() {
    if (this.filtreStatut === 'tous') {
      this.commandesFiltrees = [...this.commandes];
    } else {
      this.commandesFiltrees = this.commandes.filter(c => c.statut === this.filtreStatut);
    }
  }

  // Calculer les statistiques
  calculerStats() {
    this.stats = {
      total: this.commandes.length,
      enAttente: this.commandes.filter(c => c.statut === 'en_attente').length,
      validees: this.commandes.filter(c => c.statut === 'validee').length,
      annule: this.commandes.filter(c => c.statut === 'annule').length
    };
  }

  // Voir les détails d'une commande
  voirDetails(commande: any) {
    if (this.commandeSelectionnee?._id === commande._id) {
      this.commandeSelectionnee = null; // Fermer si déjà ouvert
    } else {
      this.commandeSelectionnee = commande;
    }
  }

  // Fermer les détails
  fermerDetails() {
    this.commandeSelectionnee = null;
  }

  // Changer le filtre
  changerFiltre(statut: string) {
    this.filtreStatut = statut;
    this.appliquerFiltre();
    this.fermerDetails();
  }

  // Formater la date
  formatDate(date: string): string {
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

  // Obtenir la classe CSS pour le statut
  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'bg-warning text-dark',
      'validee': 'bg-success text-white',
      'annule': 'bg-danger text-white',
      'panier': 'bg-secondary text-white'
    };
    return classes[statut] || 'bg-light';
  }

  // Obtenir le libellé du statut
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'annule': 'Annulée',
      'panier': 'En panier'
    };
    return labels[statut] || statut;
  }

  // Calculer le total d'une commande
  calculerTotal(commande: any): number {
    if (commande.montantTotal) return commande.montantTotal;
    
    return commande.articles?.reduce((sum: number, article: any) => {
      const totalArticle = article.prixUnitaire * article.quantite;
      if (article.remise > 0) {
        return sum + (totalArticle * (1 - article.remise / 100));
      }
      return sum + totalArticle;
    }, 0) || 0;
  }

  // Voir les détails du produit
  voirProduit(produitId: string) {
    if (produitId) {
      this.router.navigate([`/produit-details/${produitId}`]);
    }
  }

  // Recharger la page
  recharger() {
    this.filtreStatut = 'tous';
    this.chargerCommandes();
    this.fermerDetails();
  }
}