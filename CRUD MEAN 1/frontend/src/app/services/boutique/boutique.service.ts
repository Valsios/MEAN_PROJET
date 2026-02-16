import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class BoutiqueService {

  private apiUrl = `${environment.apiUrl}/boutiques`; // Assurez-vous d'avoir environment.apiUrl défini

  constructor(private http: HttpClient) {}

  getAll() {
    console.log (this.apiUrl);
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
}
