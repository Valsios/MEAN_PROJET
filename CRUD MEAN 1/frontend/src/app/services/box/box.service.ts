import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Box {
  _id?: string;
  numero: number;
  etage: number;
  prixActuel: number;
  statut?: 'libre' | 'occupee';
  etat?: 'actif' | 'inactif';
}

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private apiUrl = `${environment.apiUrl}/boxes`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<Box[]> {
    return this.http.get<Box[]>(this.apiUrl, { params });
  }

  create(box: Box): Observable<Box> {
    return this.http.post<Box>(this.apiUrl, box);
  }

  update(id: string, box: Box): Observable<Box> {
    return this.http.put<Box>(`${this.apiUrl}/${id}`, box);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivate(id: string): Observable<Box> {
    return this.http.patch<Box>(`${this.apiUrl}/${id}/reactiver`, {});
  }

  getBoxesLibres() {
    return this.http.get<any[]>(`${this.apiUrl}?statut=libre&etat=actif`);
  }
}