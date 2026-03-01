import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-client.component.html'
})
export class LoginClientComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLoginClient() {
    this.authService.loginClient({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/client-dashboard']),
      error: err => this.error = err.message || 'Erreur login client'
    });
  }

  switchToBoutique() {
    this.router.navigate(['/login-boutique']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}