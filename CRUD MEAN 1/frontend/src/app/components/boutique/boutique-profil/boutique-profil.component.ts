import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service';

@Component({
  selector: 'app-boutique-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, BoutiqueHeaderComponent, BoutiqueFooterComponent],
  templateUrl: './boutique-profil.component.html',
})
export class BoutiqueProfilComponent implements OnInit {
  boutique: any = null;
  loading = true;
  error: string | null = null;

  // Pour la modification des infos
  editMode = false;
  editNom = '';
  editTelephone = '';
  editImageFile: File | null = null;
  editImagePreview: string | null = null;

  // Pour le changement de mot de passe
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError: string | null = null;
  passwordSuccess: string | null = null;
  showPasswordForm = false;

  // Messages
  updateSuccess: string | null = null;
  updateError: string | null = null;

  constructor(
    private boutiqueService: BoutiqueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedProfile = localStorage.getItem('profile');
    const profile = storedProfile ? JSON.parse(storedProfile) : null;
    if (profile?._id) {
      this.chargerBoutique(profile._id);
    } else {
      this.error = 'Aucune boutique trouvée';
      this.loading = false;
    }
  }

  chargerBoutique(id: string): void {
    this.boutiqueService.getBoutiqueById(id).subscribe({
      next: (data) => {
        this.boutique = data;
        this.editNom = data.nom;
        this.editTelephone = data.telephone;
        this.editImagePreview = data.image ? data.image : null;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Gestion de l'image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Annuler les modifications
  cancelEdit(): void {
    this.editMode = false;
    this.editNom = this.boutique.nom;
    this.editTelephone = this.boutique.telephone;
    this.editImagePreview = this.boutique.image ? this.boutique.image : null;
    this.editImageFile = null;
    this.updateSuccess = null;
    this.updateError = null;
  }

  // Sauvegarder les modifications des infos personnelles
  saveInfos(): void {
    if (!this.editNom || !this.editTelephone) {
      this.updateError = 'Veuillez remplir tous les champs';
      return;
    }

    const updatedData: any = {
      nom: this.editNom,
      telephone: this.editTelephone
    };

    // Si une nouvelle image a été sélectionnée, la convertir en base64
    if (this.editImageFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result; // enlever le préfixe data:image/...
        updatedData.image = base64;
        this.envoyerMiseAJour(updatedData);
      };
      reader.readAsDataURL(this.editImageFile);
    } else {
      this.envoyerMiseAJour(updatedData);
    }
  }

  private envoyerMiseAJour(data: any): void {
    this.boutiqueService.update(this.boutique._id, data).subscribe({
      next: (updated) => {
        this.boutique = { ...this.boutique, ...data };
        if (data.image) {
          this.boutique.image = data.image;
          this.editImagePreview = data.image;
        }
        this.updateSuccess = 'Informations mises à jour avec succès';
        this.updateError = null;
        this.editMode = false;
        // Mettre à jour le nom dans le header si nécessaire
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        profile.nom = this.boutique.nom;
        localStorage.setItem('profile', JSON.stringify(profile));
      },
      error: (err) => {
        this.updateError = err.error?.message || 'Erreur lors de la mise à jour';
        console.error(err);
      }
    });
  }

  // Changer le mot de passe
  changePassword(): void {
    this.passwordError = null;
    this.passwordSuccess = null;

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Tous les champs sont requis';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }
    

    this.boutiqueService.changePassword(this.boutique._id, {
      ancienMotDePasse: this.oldPassword,
      nouveauMotDePasse: this.newPassword
    }).subscribe({
      next: (res) => {
        this.passwordSuccess = res.message;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showPasswordForm = false;
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Erreur lors du changement de mot de passe';
      }
    });
  }
}