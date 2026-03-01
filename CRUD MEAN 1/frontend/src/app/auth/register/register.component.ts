import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // Champs client
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  adresse = '';
  
  // Champs auth
  password = '';
  confirmPassword = '';
  
  // État
  error = '';
  success = '';
  submitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    // Réinitialiser les messages
    this.error = '';
    
    // Validation des champs obligatoires
    if (!this.nom || !this.prenom || !this.email || !this.telephone || !this.adresse || !this.password) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    // Validation email (simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Veuillez saisir un email valide';
      return;
    }

    // Validation téléphone (simple)
    /*const phoneRegex = /^[0-9+\-\s]{8,}$/;
    if (this.telephone) {
      this.error = 'Veuillez saisir un numéro de téléphone valide';
      return;
    }*/


    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.submitting = true;

    // Préparer les données d'inscription
    const registrationData = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      adresse: this.adresse,
      password: this.password
    };

    this.authService.registerClient(registrationData).subscribe({
      next: (response) => {
        this.success = 'Inscription réussie ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/client-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
        this.submitting = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login-client']);
  }
}