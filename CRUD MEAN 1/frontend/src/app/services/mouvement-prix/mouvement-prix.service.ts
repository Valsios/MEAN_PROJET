import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MouvementPrixService {

  private apiUrl = `${environment.apiUrl}/mouvements-prix`;

  constructor(private http: HttpClient) {}

  changerPrix(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getHistorique(boxId: string) {
    return this.http.get<any>(`${this.apiUrl}/box/${boxId}`);
  }
}
