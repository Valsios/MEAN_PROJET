import { Component, OnInit } from '@angular/core';
import { BoxService, Box } from '../../../../services/box/box.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MouvementPrixService } from '../../../../services/mouvement-prix/mouvement-prix.service';

@Component({
  selector: 'app-box-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './box-list.component.html',
  styleUrls: ['./box-list.component.css']
})
export class BoxListComponent implements OnInit {
  // Exposer Math pour le template
  Math = Math;

  // Données
  boxes: Box[] = [];
  filteredBoxes: Box[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Filtres
  filters = {
    etage: '',
    statut: '',
    showInactives: false
  };
  
  availableEtages: number[] = [];

  // Formulaire
  ancienPrix: number = 0;
  motif: string = '';
  prixModifie = false;
  submitted: boolean = false;

  boxForm: Box = {
    numero: 0,
    etage: 0,
    prixActuel: 0,
    etat: 'actif'
  };

  isEditMode = false;
  selectedBoxId: string | null = null;

  constructor(
    private boxService: BoxService,
    private mouvementPrixService: MouvementPrixService
  ) { }

  ngOnInit(): void {
    this.loadBoxes();
  }

  loadBoxes() {
    const params: any = {};
    if (!this.filters.showInactives) {
      params.etat = 'actif';
    } else {
      params.includeInactives = true;
    }

    this.boxService.getAll(params).subscribe({
      next: (data) => {
        this.boxes = data;
        this.extractUniqueEtages();
        this.applyFilters();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des box');
      }
    });
  }

  extractUniqueEtages() {
    this.availableEtages = [...new Set(this.boxes.map(b => b.etage))].sort((a, b) => a - b);
  }

  applyFilters() {
    this.filteredBoxes = this.boxes.filter(box => {
      // Filtre par étage
      if (this.filters.etage && box.etage !== +this.filters.etage) {
        return false;
      }
      
      // Filtre par statut (uniquement pour les box actives)
      if (this.filters.statut && box.etat === 'actif' && box.statut !== this.filters.statut) {
        return false;
      }
      
      return true;
    });
    
    this.totalPages = Math.ceil(this.filteredBoxes.length / this.pageSize);
    this.currentPage = 1;
  }

  // Pagination
  get paginatedBoxes(): Box[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredBoxes.slice(start, end);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      document.querySelector('.table-responsive')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  onPageSizeChange() {
    this.totalPages = Math.ceil(this.filteredBoxes.length / this.pageSize);
    this.currentPage = 1;
  }

  // Gestion des filtres
  hasActiveFilters(): boolean {
    return !!(this.filters.etage || this.filters.statut || this.filters.showInactives);
  }

  resetFilters() {
    this.filters = {
      etage: '',
      statut: '',
      showInactives: false
    };
    this.loadBoxes();
  }

  // CRUD Operations
  submitForm() {
    this.submitted = true;

    // Validation
    if (!this.boxForm.numero || !this.boxForm.etage || !this.boxForm.prixActuel) {
      this.showError('Veuillez remplir tous les champs requis');
      return;
    }

    if (this.isEditMode && this.prixModifie && !this.motif) {
      this.showError('Veuillez saisir le motif du changement de prix');
      return;
    }

    if (this.isEditMode && this.selectedBoxId) {
      if (this.boxForm.prixActuel !== this.ancienPrix) {
        this.mouvementPrixService.changerPrix({
          boxId: this.selectedBoxId,
          nouveauPrix: this.boxForm.prixActuel,
          motif: this.motif
        }).subscribe({
          next: () => {
            this.showSuccess('Prix modifié avec succès');
            this.afterSave();
          },
          error: (error) => {
            this.showError(this.getErrorMessage(error));
          }
        });
      } else {
        this.boxService.update(this.selectedBoxId, this.boxForm).subscribe({
          next: () => {
            this.showSuccess('Box modifiée avec succès');
            this.afterSave();
          },
          error: (error) => {
            this.showError(this.getErrorMessage(error));
          }
        });
      }
    } else {
      this.boxService.create(this.boxForm).subscribe({
        next: () => {
          this.showSuccess('Box créée avec succès');
          this.afterSave();
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
    }
  }

  afterSave() {
    this.resetForm();
    this.loadBoxes();
    this.submitted = false;
  }

  editBox(box: Box) {
    this.isEditMode = true;
    this.selectedBoxId = box._id!;
    this.boxForm = { ...box };
    this.ancienPrix = box.prixActuel;
    this.prixModifie = false;
    this.motif = '';
    this.submitted = false;
    
    // Scroll vers le formulaire
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onPrixChange() {
    this.prixModifie = this.boxForm.prixActuel !== this.ancienPrix;
  }

  deleteBox(id: string) {
    const box = this.boxes.find(b => b._id === id);
    
    if (box?.statut === 'occupee') {
      this.showError('Impossible de supprimer une box occupée');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette box ?')) {
      this.boxService.delete(id).subscribe({
        next: () => {
          this.showSuccess('Box supprimée avec succès');
          this.loadBoxes();
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
    }
  }

  reactivateBox(id: string) {
    if (confirm('Voulez-vous réactiver cette box ?')) {
      this.boxService.reactivate(id).subscribe({
        next: () => {
          this.showSuccess('Box réactivée avec succès');
          this.loadBoxes();
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedBoxId = null;
    this.boxForm = {
      numero: 0,
      etage: 0,
      prixActuel: 0,
      etat: 'actif'
    };
    this.prixModifie = false;
    this.motif = '';
    this.submitted = false;
  }

  // Gestion des messages
  private showSuccess(message: string) {
    alert('✓ ' + message);
  }

  private showError(message: string) {
    alert('✗ ' + message);
  }

  private getErrorMessage(error: any): string {
    return error.error?.message || 'Une erreur est survenue';
  }
}