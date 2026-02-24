import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service';

@Component({
  selector: 'app-boutique-loyers',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueHeaderComponent, BoutiqueFooterComponent],
  templateUrl: './boutique-loyers.component.html',
})
export class BoutiqueLoyersComponent implements OnInit {
  paiements: any[] = [];
  boxInfo: any = null;
  isLoading: boolean = false;
  profile: any;
  
  // Année sélectionnée
  anneeSelectionnee: number = new Date().getFullYear();
  
  // Statistiques
  statistiques: any = {
    totalPaye: 0,
    montantMensuel: 0,
    moisPayes: 0,
    moisRestants: 0,
    anneeComplete: false
  };

  // Mois en français
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

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit() {
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
    this.chargerInfoBox();
    this.chargerPaiements();
  }

  chargerInfoBox() {
    // Récupérer les infos du box associé à la boutique
    this.boutiqueService.getBox(this.profile._id).subscribe({
      next: (box) => {
        this.boxInfo = box;
      },
      error: (err) => console.error('Erreur chargement box:', err)
    });
  }

  chargerPaiements() {
    this.isLoading = true;
    
    const params = {
      boutiqueId: this.profile._id,
      annee: this.anneeSelectionnee
    };
    
    this.boutiqueService.getPayementLoyers(params).subscribe({
      next: (paiements) => {
        this.paiements = paiements;
        this.calculerStatistiques();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement paiements:', err);
        this.isLoading = false;
      }
    });
  }

  calculerStatistiques() {
    let totalPaye = 0;
    
    
    this.paiements.forEach(p => {
      totalPaye += p.montant;
    
    });

    const montantMensuel = this.boxInfo?.prixActuel || 0;
    
    this.statistiques = {
      totalPaye: totalPaye,
      montantMensuel: montantMensuel,
      moisPayes: this.paiements.length,
      moisRestants: 12 - this.paiements.length,
      anneeComplete: this.paiements.length === 12
    };
  }

  getPaiementParMois(mois: number) {

  if (this.profile?.dateEntryBox) {

    // 🔥 conversion obligatoire
    const entryDate = new Date(this.profile.dateEntryBox);

    const entryYear = entryDate.getFullYear();
    const entryMonth = entryDate.getMonth() + 1;

    if (
      this.anneeSelectionnee <= entryYear &&
      mois < entryMonth
    ) {
      return {
        boutiqueId: this.profile.boutiqueId,
        boxId: this.profile.boxId,
        montant: 0,
        mois: mois,
        annee: this.anneeSelectionnee,
        datePaiement: null,
        createdAt: new Date()
      };
    }
  }

  return this.paiements?.find(
    p => p.mois === mois && p.annee === this.anneeSelectionnee
  ) || null;
}

  getStatutPaiement(mois: number): { class: string, texte: string, icon: string } {
    const paiement = this.getPaiementParMois(mois);
    const aujourdhui = new Date();
    const moisActuel = aujourdhui.getMonth() + 1;
    const anneeActuelle = aujourdhui.getFullYear();
    
    if (paiement) {
      return {
        class: 'bg-success',
        texte: 'Payé',
        icon: 'lni lni-checkmark-circle'
      };
    }
    else if (this.anneeSelectionnee<anneeActuelle || (mois < moisActuel && this.anneeSelectionnee <= anneeActuelle)) {
      return {
        class: 'bg-danger',
        texte: 'En retard',
        icon: 'lni lni-warning'
      };
    } else if (mois === moisActuel && this.anneeSelectionnee === anneeActuelle) {
      return {
        class: 'bg-warning',
        texte: 'À payer',
        icon: 'lni lni-hourglass'
      };
    } else {
      return {
        class: 'bg-secondary',
        texte: 'À venir',
        icon: 'lni lni-calendar'
      };
    }
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

  anneesDisponibles(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  changerAnnee(annee: number) {
    this.anneeSelectionnee = annee;
    this.chargerPaiements();
  }

  getMoisNom(moisIndex: number): string {
    const mois = this.moisListe.find(m => m.index === moisIndex);
    return mois ? mois.nom : 'Mois inconnu';
  }

  getProchainMoisAPayer(): string {
    const aujourdhui = new Date();
    const moisActuel = aujourdhui.getMonth() + 1;
    
    for (let mois = 1; mois <= 12; mois++) {
      if (!this.getPaiementParMois(mois)) {
        return this.getMoisNom(mois);
      }
    }
    return 'Aucun';
  }
}