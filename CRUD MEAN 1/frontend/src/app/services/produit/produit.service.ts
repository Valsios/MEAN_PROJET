import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = `${environment.apiUrl}/api/produit`;
  
  constructor(private http: HttpClient) { }
  

  ajouterReview(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-review`,data);
  }
  // Récupérer un produit par son ID
  getProduitById(produitId: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${produitId}`);
  }

  // Récupérer la promotion active d'un produit
  getPromotionActive(produitId: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${produitId}/promotion-active`);
  }

  // Récupérer les reviews d'un produit
  getReviews(produitId: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${produitId}/reviews`);
  }

  // Mettre à jour le prix d'un produit
  updatePrice(produitId: string, newPrice: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${produitId}/price`, { newPrice: newPrice });
  }

  // Mettre à jour les informations du produit (nom, description, image)
  updateProduct(produitId: string, formData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${produitId}/update`, formData);
  }

  // Ravitailler le stock d'un produit
  restockProduct(produitId: string, quantite: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${produitId}/restock`, { quantite: quantite });
  }

  // Désactiver une promotion (soft delete)
  desactiverPromotion(promotionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/promotion/${promotionId}`);
  }

  // Ajouter une nouvelle promotion
  ajouterPromotion(promoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter-promotion`, promoData);
  }

  // Remplacer une promotion existante par une nouvelle
  remplacerPromotion(promotionId: string, promoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/promotion/${promotionId}/remplacer-promotion`, promoData);
  }



}

