import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  user: any;

  constructor(private authService: AuthService, private router: Router) {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;

    // Vérification du rôle
    if (!this.user || this.user.role !== 'admin') {
      this.router.navigate(['/login-admin']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-admin']);
  }
}
