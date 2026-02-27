import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategorieService } from '../../../../services/categorie/categorie.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie-list.component.html',
  styleUrls: ['./categorie-list.component.css']
})
export class CategorieListComponent implements OnInit {
  // Exposer Math pour le template
  Math = Math;

  // Données
  categories: any[] = [];
  filteredCategories: any[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Filtres et recherche
  searchTerm: string = '';
  sortBy: string = 'nom';
  showEmptyCategories: boolean = false;
  submitted: boolean = false;

  // État du formulaire
  isEditMode = false;
  selectedId: string | null = null;

  form: any = {
    nom: '',
    description: ''
  };

  constructor(private categorieService: CategorieService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des catégories');
      }
    });
  }

  applyFilters() {
    let filtered = [...this.categories];

    // Filtre par recherche de nom
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.nom.toLowerCase().includes(term)
      );
    }

    // Filtre catégories vides (à adapter selon votre logique métier)
    if (!this.showEmptyCategories) {
      // Si vous avez un champ "nombre de boutiques" dans votre catégorie
      // filtered = filtered.filter(cat => cat.nbBoutiques > 0);
    }

    // Tri
    filtered.sort((a, b) => {
      switch(this.sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'nomDesc':
          return b.nom.localeCompare(a.nom);
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'dateDesc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    this.filteredCategories = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Pagination
  get paginatedCategories(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCategories.slice(start, end);
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
      // Scroll en haut de la liste
      document.querySelector('.table-responsive')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  onPageSizeChange() {
    this.updatePagination();
    this.currentPage = 1;
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  submit() {
    this.submitted = true;

    if (!this.form.nom || !this.form.description) {
      this.showError('Veuillez remplir tous les champs requis');
      return;
    }

    if (this.isEditMode && this.selectedId) {
      this.categorieService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.showSuccess('Catégorie modifiée avec succès');
          this.afterSave();
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
    } else {
      this.categorieService.create(this.form).subscribe({
        next: () => {
          this.showSuccess('Catégorie créée avec succès');
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
    this.loadCategories();
    this.submitted = false;
  }

  edit(cat: any) {
    this.isEditMode = true;
    this.selectedId = cat._id;
    this.form = {
      nom: cat.nom,
      description: cat.description
    };
    this.submitted = false;
    
    // Scroll vers le formulaire
    document.querySelector('form')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  delete(cat: any) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${cat.nom}" ?`)) {
      this.categorieService.delete(cat._id).subscribe({
        next: () => {
          this.showSuccess('Catégorie supprimée avec succès');
          this.loadCategories();
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = {
      nom: '',
      description: ''
    };
    this.submitted = false;
  }

  // Gestion des messages
  private showSuccess(message: string) {
    // Idéalement, utilisez un service de toast
    alert('✓ ' + message);
  }

  private showError(message: string) {
    alert('✗ ' + message);
  }

  private getErrorMessage(error: any): string {
    return error.error?.message || 'Une erreur est survenue';
  }
}