import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-boutique-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-header.component.html',
})
export class BoutiqueHeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  profile: any = null;
  private checkInterval: any;

  constructor(private authService: AuthService, private router: Router) {
    this.loadUserData();
  }

  ngOnInit() {
    // Vérifier toutes les 10 secondes si le token est toujours valide
    this.checkInterval = setInterval(() => {
      this.checkTokenValidity();
    }, 10000);

    // Ajouter un écouteur pour détecter quand la page reçoit le focus
    window.addEventListener('focus', this.checkTokenValidity.bind(this));
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    window.removeEventListener('focus', this.checkTokenValidity.bind(this));
  }

  loadUserData() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
    const storedProfile = localStorage.getItem('profile');
    this.profile = storedProfile ? JSON.parse(storedProfile) : null;
  }

  checkTokenValidity() {
    const token = localStorage.getItem('token');
    
    if (!token || this.user.role !== 'boutique') {
      this.handleNoToken();
      return;
    }

    try {
      // Décoder le token JWT
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // Vérifier l'expiration
      const expirationTime = payload.exp * 1000; // convertir en millisecondes
      const now = Date.now();
      
      if (now >= expirationTime) {
        console.log('Token expiré');
        this.handleTokenExpired();
      }
    } catch (e) {
      console.error('Erreur de décodage du token', e);
      this.handleTokenExpired();
    }
  }

  handleNoToken() {

      this.authService.logout();
      this.user = null;
      this.profile = null;
      this.router.navigate(['/login-boutique']);
    
  }

  handleTokenExpired() {
    this.authService.logout();
    this.user = null;
    this.profile = null;
    this.router.navigate(['/login-boutique']);
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.profile = null;
    this.router.navigate(['/login-boutique']);
  }

  // Méthode appelée quand l'utilisateur clique sur un lien
  onNavigate() {
    this.checkTokenValidity(); // Vérifier avant toute navigation
  }
}