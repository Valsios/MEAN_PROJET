import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }
  
  private apiUrlClient = `${environment.apiUrl}/api/client`;

  /**
   * Récupérer tous les paniers du client (commandes avec statut "panier")
   */
  getPaniers(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrlClient}/${clientId}/paniers`);
  }

  /**
   * Récupérer l'historique des commandes du client (toutes sauf "panier")
   */
  getCommandes(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrlClient}/${clientId}/commandes`);
  }

  /**
   * Récupérer une commande spécifique par son ID
   */
  getCommandeById(commandeId: string): Observable<any> {
    return this.http.get(`${this.apiUrlClient}/${commandeId}`);
  }

  /**
   * Mettre à jour la quantité d'un article dans le panier
   */
  mettreAJourQuantite(commandeId: string, produitId: string, quantite: number): Observable<any> {
    return this.http.put(
      `${this.apiUrlClient}/${commandeId}/article/${produitId}`, 
      { quantite }
    );
  }

  /**
   * Supprimer un article du panier
   */
  supprimerArticle(commandeId: string, produitId: string): Observable<any> {
    return this.http.delete(`${this.apiUrlClient}/${commandeId}/article/${produitId}`);
  }

  /**
   * Valider une commande (passer de "panier" à "en_attente")
   */
  validerCommande(commandeId: string): Observable<any> {
    return this.http.put(`${this.apiUrlClient}/${commandeId}/valider`, {});
  }

  /**
   * Valider tous les paniers d'un client
   */
  validerTousPaniers(clientId: string): Observable<any> {
    return this.http.put(`${this.apiUrlClient}/${clientId}/paniers/valider-tout`, {});
  }

  /**
   * Vider tous les paniers d'un client
   */
  viderPaniers(clientId: string): Observable<any> {
    return this.http.delete(`${this.apiUrlClient}/${clientId}/paniers/vider`);
  }

  /**
   * Ajouter un article au panier
   */
  ajouterAuPanier(clientId: string, data: { 
    boutiqueId: string, 
    produitId: string, 
    quantite?: number,
    clientEmail?: string,
    clientTelephone?: string 
  }): Observable<any> {
    return this.http.post(`${this.apiUrlClient}/${clientId}/panier/ajouter`, data);
  }

  /**
   * Obtenir le résumé du panier (nombre d'articles, total)
   */
  getResumePanier(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrlClient}/${clientId}/panier/resume`);
  }

  /**
   * Vérifier si un produit est déjà dans le panier
   */
  estDansPanier(clientId: string, produitId: string): Observable<any> {
    return this.http.get(`${this.apiUrlClient}/${clientId}/panier/verifier/${produitId}`);
  }
}