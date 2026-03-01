import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: string;
  profilId?: string;
  status: string;
}

export interface ClientRegistrationData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  // Méthode d'inscription client
  registerClient(data: ClientRegistrationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-client`, data).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // Ancienne méthode register (optionnelle, à garder pour compatibilité)
  register(credentials: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  loginClient(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.user.role !== 'client') throw new Error('Accès refusé pour client');
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('profile', JSON.stringify(res.profile));
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
          localStorage.setItem('profile', JSON.stringify(res.profile));
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
          localStorage.setItem('profile', JSON.stringify(res.profile));
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
    return user ? JSON.parse(user).user?.role || JSON.parse(user).role : null;
  }

  // Récupérer l'utilisateur connecté
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user;
      } catch (e) {
        console.error('Erreur parsing user', e);
        return null;
      }
    }
    return null;
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string | string[]): boolean {
    const userRole = this.getRole();
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  // Récupérer l'ID du profil (client, boutique, admin)
  getProfilId(): string | null {
    const user = this.getCurrentUser();
    return user?.profilId || null;
  }

  // Vérifier si l'utilisateur est authentifié et a le bon rôle
  isAuthenticated(allowedRoles?: string[]): boolean {
    if (!this.isLoggedIn()) return false;
    
    if (allowedRoles && allowedRoles.length > 0) {
      return this.hasRole(allowedRoles);
    }
    
    return true;
  }

  // Rafraîchir les données utilisateur
  refreshUserData(): Observable<User | null> {
    return of(this.getCurrentUser());
  }

  // Méthode pour les headers HTTP avec token
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'x-auth-token': token } : {};
  }
}