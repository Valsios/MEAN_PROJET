import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html'
})
export class LoginAdminComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLoginAdmin() {
    this.authService.loginAdmin({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: err => this.error = err.message || 'Erreur login admin'
    });
  }
}
