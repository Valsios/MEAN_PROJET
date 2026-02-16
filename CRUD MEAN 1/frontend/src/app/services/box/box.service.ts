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
}

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private apiUrl = `${environment.apiUrl}/boxes`; // Assurez-vous d'avoir environment.apiUrl défini

  constructor(private http: HttpClient) {}

  getAll(): Observable<Box[]> {
    console.log (this.apiUrl);
    return this.http.get<Box[]>(this.apiUrl);
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

  getBoxesLibres() {
    return this.http.get<any[]>(`${this.apiUrl}?statut=libre`);
  }

}