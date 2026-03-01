import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Boutique {
  _id: string;
  nom: string;
  telephone: string;
  email: string;
  boxActuelleId: {
    _id: string;
    numero: string;
    etage: number;
  } | null;
  categorieId: {
    _id: string;
    nom: string;
  };
}

export interface Report {
  clientId: string | null;
  boutiqueId: string;
  title: string;
  description?: string;
  commentaire?: string;
  dateReport: Date;
  statut: 'en_attente' | 'valide' | 'refuse';
}

@Injectable({ providedIn: 'root' })
export class BoutiqueService {

  private apiUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  update(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  libererBox(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/liberer-box`, {});
  }

  getBoutiqueById(id: string) {
    return this.http.get<Boutique>(`${this.apiUrl}/${id}`);
  }

  // NOUVELLE MÉTHODE : Vérifier le paiement du loyer
  verifierPaiementLoyer(id: string) {
    return this.http.get<{ estPaye: boolean; message: string }>(`${this.apiUrl}/${id}/verifier-paiement-loyer`);
  }
}