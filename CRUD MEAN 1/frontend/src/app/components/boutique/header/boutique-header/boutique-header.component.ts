import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-boutique-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './boutique-header.component.html',
})
export class BoutiqueHeaderComponent {
  user: any;
  profile: any;
  
    constructor(private authService: AuthService, private router: Router) {
      const storedUser = localStorage.getItem('user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
  
      const storedProfile = localStorage.getItem('profile');
      this.profile = storedProfile ? JSON.parse(storedProfile) : null;
  
      // Vérification du rôle
      if (!this.user || this.user.role !== 'boutique') {
        this.router.navigate(['/login-boutique']);
      }
    }
  
    logout() {
      this.authService.logout();
      this.router.navigate(['/login-boutique']);
    }
}
