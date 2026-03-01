import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup,Validators,FormBuilder,ReactiveFormsModule } from '@angular/forms';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
import { BoutiqueService } from '../../../services/boutique/boutique.service'
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule , BoutiqueHeaderComponent , BoutiqueFooterComponent , ReactiveFormsModule],
  templateUrl: './produit-form.component.html',
})
export class ProduitFormComponent {
  produitForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileBase64: string | null = null;
  constructor (
    private fb: FormBuilder,
    private boutiqueService: BoutiqueService,
    private router: Router,
    private authService: AuthService
  ){

    const storedProfile = localStorage.getItem('profile');
    const profile = storedProfile ? JSON.parse(storedProfile) : null;

    this.produitForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      type: ['produit', Validators.required],
      gestionStock: [false],
      stockActuel: [0],
      prixActuel: [0, Validators.required],
      boutiqueId: [profile ? profile._id : '', Validators.required],
      image: [null],
      status : true
    });
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        let base64String = reader.result as string;
        const commaIndex = base64String.indexOf(',');
        this.selectedFileBase64 = commaIndex >= 0 ? base64String.substring(commaIndex + 1) : base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.produitForm.invalid) return;

    const produitPayload = {
      ...this.produitForm.value,
      image: this.selectedFileBase64
    };

    console.log('Payload envoyé:', produitPayload);

    this.boutiqueService.createProduit(produitPayload).subscribe({
      next: (res) => {
        console.log('Produit ajouté:', res);
        this.router.navigate(['/boutique-produit']);
      },
      error: (err) => console.error(err)
    });
  }
}
