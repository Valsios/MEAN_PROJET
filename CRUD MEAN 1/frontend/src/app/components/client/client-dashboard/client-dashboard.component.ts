import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html'
})
export class ClientDashboardComponent {
  user: any;

  constructor(private authService: AuthService, private router: Router) {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;

    // Si pas connecté, rediriger vers login-client
    if (!this.user || this.user.role !== 'client') {
      this.router.navigate(['/login-client']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-client']);
  }
}
