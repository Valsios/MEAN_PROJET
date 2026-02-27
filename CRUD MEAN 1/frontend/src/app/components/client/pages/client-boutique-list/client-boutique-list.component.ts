import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BoutiqueService, Boutique } from '../../../../services/boutique/boutique.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-client-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-boutique-list.component.html'
})
export class ClientBoutiquesComponent implements OnInit {
  boutiques: Boutique[] = [];
  loading = true;
  error = '';

  constructor(
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.boutiqueService.getAll().subscribe({
      next: (data) => {
        this.boutiques = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des boutiques';
        this.loading = false;
        console.error(err);
      }
    });
  }

  reportBoutique(boutiqueId: string) {
    this.router.navigate(['/client/report', boutiqueId]);
  }

  getCategorieName(boutique: Boutique): string {
    return boutique.categorieId?.nom || 'Non catégorisé';
  }

  getBoxInfo(boutique: Boutique): string {
    if (boutique.boxActuelleId) {
      return `Box ${boutique.boxActuelleId.numero} - Étage ${boutique.boxActuelleId.etage}`;
    }
    return 'Box non assigné';
  }
}