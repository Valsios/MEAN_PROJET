import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap,Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}/api/boutique`;
  private apiUrlCommande = `${environment.apiUrl}/api/commande`;
  private apiUrlClient = `${environment.apiUrl}/api/client`;
  constructor(private http : HttpClient) {
    
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


  validerCommande(commandeId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrlCommande}/validerCommande/${commandeId}`);
  }

  annulerCommande(commandeId : any) : Observable<any>
  {
      return this.http.get(`${this.apiUrlCommande}/annulerCommande/${commandeId}`);
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


}
