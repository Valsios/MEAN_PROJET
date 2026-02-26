import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';``
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-client-footer',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './client-footer.component.html',
})
export class ClientFooterComponent {
  user: any;
    profile: any;
    
      constructor(private authService: AuthService, private router: Router) {
        const storedUser = localStorage.getItem('user');
        this.user = storedUser ? JSON.parse(storedUser) : null;
    
        const storedProfile = localStorage.getItem('profile');
        this.profile = storedProfile ? JSON.parse(storedProfile) : null;
    
        // Vérification du rôle
        if (!this.user || this.user.role !== 'client') {
          this.router.navigate(['/login-client']);
        }
      }
    
      logout() {
        this.authService.logout();
        this.router.navigate(['/login-client']);
      }

}
