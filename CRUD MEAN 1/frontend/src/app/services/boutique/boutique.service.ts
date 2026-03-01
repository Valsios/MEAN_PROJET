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

  private myApiUrl = `${environment.apiUrl}/boutiques`;

  private apiUrl = `${environment.apiUrl}/api/boutique`;
  private apiUrlCommande = `${environment.apiUrl}/api/commande`;
  private apiUrlClient = `${environment.apiUrl}/api/client`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.myApiUrl);
  }

  create(data: any) {
    return this.http.post(this.myApiUrl, data);
  }

  update(id: string, data: any) {
    return this.http.put(`${this.myApiUrl}/${id}`, data);
  }

  libererBox(id: string) {
    return this.http.post(`${this.myApiUrl}/${id}/liberer-box`, {});
  }

  getBoutiqueById(id: string) {
    return this.http.get<Boutique>(`${this.myApiUrl}/${id}`);
  }

  // NOUVELLE MÉTHODE : Vérifier le paiement du loyer
  verifierPaiementLoyer(id: string) {
    return this.http.get<{ estPaye: boolean; message: string }>(`${this.myApiUrl}/${id}/verifier-paiement-loyer`);
  }





  // --------------- VALS -----------------


  getBoutiqueByIdVals(boutiqueId : any) : Observable<any>
  {
    return this.http.get(`${this.apiUrl}/${boutiqueId}`);
  }
  getAllBoutique() : Observable<any>
  {
    
    return this.http.get(`${this.apiUrl}/`);
  }
  getAllCategorie() : Observable<any>
  {
    
    return this.http.get(`${this.apiUrl}/allCategories`);
  }

  //get review
  getAvisClient(boutiqueId : string) : Observable<any>
  {
    
    return this.http.get(`${this.apiUrl}/${boutiqueId}/reviews`);
  }
//get Info client

getClient(clientId : string) : Observable<any>
  {
    
    return this.http.get(`${this.apiUrlClient}/${clientId}`);
  }
//get Info box
  getBox(boutiqueId : string) : Observable<any>
  {
    return this.http.get(`${this.apiUrl}/${boutiqueId}/box`);
  }

  getPayementLoyers(data : any) : Observable<any>
  {
    return this.http.post(`${this.apiUrl}/payementLoyers`,data);
  }

  getAllPayementLoyers(boutiqueId : any) : Observable<any>
  {
    return this.http.get(`${this.apiUrl}/${boutiqueId}/payementLoyers`);
  }


  validerCommande(commandeId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrlCommande}/validerCommande/${commandeId}`);
  }

  annulerCommande(commandeId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrlCommande}/annulerCommande/${commandeId}`);
  }

  //get commande non validé
  getCommandesValidee(boutiqueId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrl}/${boutiqueId}/commandes-validee`);
  }
  //get commande non validé
  getCommandes(boutiqueId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrl}/${boutiqueId}/commandes`);
  }
  
  //histoire commande amzay
  createCommande(commande : any) : Observable<any>
  {
      return this.http.post(`${this.apiUrlCommande}/createCommande`, commande);
  }
  // Récupérer lees produits d'une boutique
  getBoutiqueWithProduits(boutiqueId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${boutiqueId}/produits`);
  }

  createProduit(produit : any) : Observable<any>
  {
    return this.http.post(`${this.apiUrl}/createProduit`, produit);
  }
  deleteProduit(produitId : any) : Observable<any>
  {
    return this.http.delete(`${this.apiUrl}/deleteProduit/${produitId}`);
  }
    // Dans client.service.ts
  noterBoutique(data: {
    boutiqueId: string,
    clientId: string,
    clientEmail: string,
    note: number,
    commentaire?: string | null
  }): Observable<any> {
    return this.http.post(`${this.apiUrlClient}/noter-boutique`, data);
  }




}