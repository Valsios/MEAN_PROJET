import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaiementLoyerService {

  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  getInfo(boutiqueId: string) {
    return this.http.get<any>(`${this.apiUrl}/info/${boutiqueId}`);
  }

  payer(data: any) {
    return this.http.post(`${this.apiUrl}/payer`, data);
  }
}
