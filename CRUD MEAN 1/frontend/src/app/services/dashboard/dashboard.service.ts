import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  // KPIs généraux
  totalBoutiques: number;
  totalBoxes: {
    libres: number;
    occupees: number;
    total: number;
  };
  revenusMois: number;
  reportsEnAttente: number;
  
  // Finances
  paiementsParMois: {
    mois: string;
    montant: number;
    annee: number;
    moisNum: number;
  }[];
  tauxRecouvrement: number;
  
  // Occupation
  occupationParEtage: {
    etage: number;
    libres: number;
    occupees: number;
    total: number;
  }[];
  mouvementsParMois: {
    entrees: {
      _id: {
        annee: number;
        mois: number;
      };
      count: number;
    }[];
    sorties: {
      _id: {
        annee: number;
        mois: number;
      };
      count: number;
    }[];
  };
  
  // Reports
  reportsParStatut: {
    en_attente: number;
    valide: number;
    refuse: number;
  };
  reportsParCategorie: {
    categorie: string;
    count: number;
  }[];
  evolutionReports: {
    mois: string;
    count: number;
    annee: number;
    moisNum: number;
  }[];
  
  // Utilisateurs
  nouveauxUtilisateurs: {
    mois: string;
    admin: number;
    boutique: number;
    client: number;
    total: number;
    annee: number;
    moisNum: number;
  }[];
  
  // Prix Box
  evolutionPrixBox: {
    boxId: string;
    boxNumero: string;
    etage: number;
    historique: {
      date: Date;
      ancienPrix: number;
      nouveauPrix: number;
      motif?: string;
    }[];
    prixActuel: number;
  }[];
  
  // Alertes
  boutiquesEnRetard: {
    _id: string;
    nom: string;
    email: string;
    telephone: string;
    boxActuelleId: {
      numero: string;
      etage: number;
      prixActuel: number;
    };
    moisEnRetard: number;
  }[];
  
  // Activité récente
  derniersPaiements: {
    _id: string;
    boutiqueNom: string;
    boxNumero: string;
    montant: number;
    mois: number;
    annee: number;
    datePaiement: Date;
  }[];
  derniersReports: {
    _id: string;
    title: string;
    boutiqueNom: string;
    statut: string;
    dateReport: Date;
  }[];
  derniersMouvements: {
    _id: string;
    boutiqueNom: string;
    boxNumero: string;
    type: 'entree' | 'sortie';
    date: Date;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getDashboardStats(mois?: number, annee?: number): Observable<DashboardStats> {
    let url = `${this.apiUrl}/dashboard/stats`;
    const params: any = {};
    if (mois) params.mois = mois;
    if (annee) params.annee = annee;
    
    return this.http.get<DashboardStats>(url, { params });
  }
}