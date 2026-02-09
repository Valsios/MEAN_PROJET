import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-boutique.component.html'
})
export class LoginBoutiqueComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLoginBoutique() {
    this.authService.loginBoutique({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/boutique-dashboard']),
      error: err => this.error = err.message || 'Erreur login boutique'
    });
  }

  switchToClient() {
    this.router.navigate(['/login-client']);
  }
}
