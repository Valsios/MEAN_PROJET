import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
      private apiUrl = `${environment.apiUrl}/api/auth`;


  constructor(private http: HttpClient) {}

  loginClient(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.user.role !== 'client') throw new Error('Accès refusé pour client');
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        })
      );
  }

  loginBoutique(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.user.role !== 'boutique') throw new Error('Accès refusé pour boutique');
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        })
      );
  }

  loginAdmin(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.user.role !== 'admin') throw new Error('Accès refusé pour admin');
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        })
      );
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  }
}
