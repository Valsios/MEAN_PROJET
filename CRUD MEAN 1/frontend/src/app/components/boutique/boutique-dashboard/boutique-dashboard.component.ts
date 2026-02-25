import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service';
import { FormsModule } from '@angular/forms'; // À ajouter dans les imports

// Interfaces
interface Client {
  _id: string | null;
  email: string | null;
  telephone?: string | null;
}

interface Commande {
  _id: string | null;
  client: Client | null;
  typeCommande: 'en_ligne' | 'sur_place';
  statut: 'en_attente' | 'validee' | 'annule';
  createdAt: Date;
  validateOrCanceledAt: Date;
  articles: Array<{
    produitId: string;
    nomProduit: string;
    quantite: number;
    prixUnitaire: number;
    remise: number;
    total: number;
  }>;
  montantTotal: number;
}

interface AvisClient {
  _id: string;
  client: {
    id: string;
    email: string;
  } | null;
  commentaire: string;
  note: number;
  boutiqueId: string;
  createdAt: Date;
}

interface PaiementLoyer {
  _id: string;
  boutiqueId: string;
  boxId: string;
  montant: number;
  mois: number;
  annee: number;
  datePaiement: Date;
  createdAt: Date;
}

interface Box {
  _id: string;
  numero: number;
  etage: number;
  prixActuel: number;
  statut: 'libre' | 'occupee';
}

interface Boutique {
  _id: string;
  nom: string;
  telephone: string;
  email: string;
  boxActuelleId: Box | string | null;
  categorieId: any;
  dateEntryBox: Date;
}

interface Profile {
  _id: string;
  nom?: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-dashboard-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueHeaderComponent, BoutiqueFooterComponent],
  templateUrl: './boutique-dashboard.component.html'
})
export class BoutiqueDashboardComponent implements OnInit {
  activeListe: string | null = null;
  
  // Profile
  profile: Profile | null = null;
  
  // Données typées
  boutique: any ;
  box : Box | null = null;
  commandesValidees: Commande[] = [];
  avisBoutique: AvisClient[] = [];
  paiementsLoyer: PaiementLoyer[] = [];
  
  // Loading states
  isLoadingBoutique: boolean = false;
  isLoadingCA: boolean = false;
  isLoadingAvis: boolean = false;
  isLoadingLoyer: boolean = false;
  
  // ID de la boutique connectée
  boutiqueId: string = '';

  // ========== PROPRIÉTÉS POUR LE LOYER ==========
  anneeSelectionnee: number = new Date().getFullYear();
  
  statistiquesLoyer = {
    totalPaye: 0,
    montantMensuel: 0,
    moisPayes: 0,
    moisRestants: 12,
    anneeComplete: false
  };

  moisListe = [
    { index: 1, nom: 'Janvier' },
    { index: 2, nom: 'Février' },
    { index: 3, nom: 'Mars' },
    { index: 4, nom: 'Avril' },
    { index: 5, nom: 'Mai' },
    { index: 6, nom: 'Juin' },
    { index: 7, nom: 'Juillet' },
    { index: 8, nom: 'Août' },
    { index: 9, nom: 'Septembre' },
    { index: 10, nom: 'Octobre' },
    { index: 11, nom: 'Novembre' },
    { index: 12, nom: 'Décembre' }
  ];

  Math = Math;

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit() {
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
    
    if (this.profile?._id) {
      this.boutiqueId = this.profile._id;
      this.boutique = this.profile;
      this.chargerDonnees();
    } else {
      console.error('Aucun profil trouvé');
    }
  }

  chargerDonnees() {
    // Charger les infos boutique avec le box
    this.isLoadingBoutique = true;
    this.boutiqueService.getBox(this.boutiqueId).subscribe({
      next: (box: Box) => {
        this.box = box;
        this.isLoadingBoutique = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement boutique:', err);
        this.isLoadingBoutique = false;
      }
    });

    // Charger les commandes validées
    this.isLoadingCA = true;
    this.boutiqueService.getCommandesValidee(this.boutiqueId).subscribe({
      next: (commandes: Commande[]) => {
        this.commandesValidees = commandes || [];
        this.isLoadingCA = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement commandes:', err);
        this.commandesValidees = [];
        this.isLoadingCA = false;
      }
    });

    // Charger les avis boutique
    this.isLoadingAvis = true;
    this.boutiqueService.getAvisClient(this.boutiqueId).subscribe({
      next: (avis: AvisClient[]) => {
        this.avisBoutique = avis || [];
        this.isLoadingAvis = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement avis:', err);
        this.avisBoutique = [];
        this.isLoadingAvis = false;
      }
    });

    // Charger l'historique des loyers
    this.chargerPaiementsLoyer();
  }

  // ========== MÉTHODES POUR LE LOYER ==========
  
  chargerPaiementsLoyer() {
    this.isLoadingLoyer = true;
    this.boutiqueService.getAllPayementLoyers(this.boutiqueId).subscribe({
      next: (paiements: PaiementLoyer[]) => {
        this.paiementsLoyer = paiements || [];
        this.calculerStatistiquesLoyer();
        this.isLoadingLoyer = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement loyers:', err);
        this.paiementsLoyer = [];
        this.calculerStatistiquesLoyer();
        this.isLoadingLoyer = false;
      }
    });
  }

  calculerStatistiquesLoyer() {
    const paiementsAnnee = this.paiementsLoyer.filter(p => p.annee === this.anneeSelectionnee);
    let totalPaye = 0;
    
    paiementsAnnee.forEach(p => {
      totalPaye += p.montant;
    });

    const montantMensuel = this.box?.prixActuel || 0;
    const moisPayes = paiementsAnnee.length;
    
    this.statistiquesLoyer = {
      totalPaye: totalPaye,
      montantMensuel: montantMensuel,
      moisPayes: moisPayes,
      moisRestants: 12 - moisPayes,
      anneeComplete: moisPayes === 12
    };
  }

  

  formatDate(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }


 
  // Calculs pour le CA
  get caTotal(): number {
    if (!this.commandesValidees || this.commandesValidees.length === 0) return 0;
    return this.commandesValidees.reduce((sum, cmd) => sum + (cmd.montantTotal || 0), 0);
  }

  get nombreCommandes(): number {
    return this.commandesValidees?.length || 0;
  }

  // Calculs pour les avis
  get totalAvis(): number {
    return this.avisBoutique?.length || 0;
  }

  get noteGlobale(): number {
    if (!this.avisBoutique || this.avisBoutique.length === 0) return 0;
    const sum = this.avisBoutique.reduce((s, a) => s + a.note, 0);
    return sum / this.avisBoutique.length;
  }

  get reviewsParNote(): { [key: number]: number } {
    const counts: { [key: number]: number } = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    if (this.avisBoutique && this.avisBoutique.length > 0) {
      this.avisBoutique.forEach(avis => {
        const note = avis.note;
        if (note >= 1 && note <= 5) {
          counts[note] = (counts[note] || 0) + 1;
        }
      });
    }
    
    return counts;
  }

  // Calculs pour le loyer (anciennes méthodes adaptées)
  get montantLoyer(): number {
    return this.box?.prixActuel || 0;
  }

  get estLoyerPaye(): boolean {
    if (!this.paiementsLoyer || this.paiementsLoyer.length === 0) return false;
    
    const aujourdhui = new Date();
    const moisActuel = aujourdhui.getMonth() + 1;
    const anneeActuelle = aujourdhui.getFullYear();
    
    return this.paiementsLoyer.some(p => 
      p && p.mois === moisActuel && p.annee === anneeActuelle
    );
  }

  get prochainPaiementLoyer(): Date {
    const aujourdhui = new Date();
    return new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 1);
  }

  // Historique des loyers (ancienne méthode adaptée)
  get historiqueLoyerMois(): Array<{ 
    mois: number; 
    annee: number; 
    paye: boolean; 
    montant: number; 
    datePaiement?: Date;
    boxInfo?: string;
  }> {
    if (!this.paiementsLoyer || !this.boutique?.dateEntryBox) return [];
    
    const aujourdhui = new Date();
    const dateEntry = new Date(this.boutique.dateEntryBox);
    
    const totalMois = (aujourdhui.getFullYear() - dateEntry.getFullYear()) * 12 + 
                      (aujourdhui.getMonth() - dateEntry.getMonth()) + 1;
    
    const historique = [];
    
    for (let i = totalMois - 1; i >= 0; i--) {
      const date = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() - i, 1);
      const mois = date.getMonth() + 1;
      const annee = date.getFullYear();
      
      const paiement = this.paiementsLoyer.find(p => p && p.mois === mois && p.annee === annee);
      
      historique.push({
        mois,
        annee,
        paye: !!paiement,
        montant: paiement?.montant || this.montantLoyer,
        datePaiement: paiement?.datePaiement,
        boxInfo: this.getBoxInfo()
      });
    }
    
    return historique;
  }

  // Méthode pour basculer l'affichage
  toggleListe(liste: string): void {
    if (this.activeListe === liste) {
      this.activeListe = null;
    } else {
      this.activeListe = liste;
    }
  }

  // Méthode pour formater l'affichage client
  formatClient(client: Client | null): string {
    if (!client) return 'Client sur place';
    return client.email || client.telephone || 'Client inconnu';
  }

  // Méthode pour obtenir les infos du box
  getBoxInfo(): string {
    if (this.box) {
      return `Box n°${this.box.numero} - Étage ${this.box.etage}`;
    }
    return 'Box non assigné';
  }

  // Getter pour boxInfo (pour le template)
  get boxInfo(): string {
    return this.getBoxInfo();
  }
}