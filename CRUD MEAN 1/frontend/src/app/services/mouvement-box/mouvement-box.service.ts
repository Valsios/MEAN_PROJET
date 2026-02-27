import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MouvementService {

  private apiUrl = `${environment.apiUrl}/mouvements`; // On va appeler /:id/mouvements

  constructor(private http: HttpClient) { }

  getMouvementsByBoutique(boutiqueId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${boutiqueId}/mouvements`);
  }


  createMouvement(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateMouvement(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getMouvementActif(boutiqueId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boutique/${boutiqueId}/actif`);
  }





}
