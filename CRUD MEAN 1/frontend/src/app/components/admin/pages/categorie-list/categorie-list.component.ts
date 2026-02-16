import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategorieService } from '../../../../services/categorie/categorie.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie-list.component.html'
})
export class CategorieListComponent implements OnInit {

  categories: any[] = [];

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
    this.categorieService.getAll().subscribe(data => {
      this.categories = data;
    });
  }

  submit() {
    if (this.isEditMode) {
      this.categorieService.update(this.selectedId!, this.form)
        .subscribe(() => this.afterSave());
    } else {
      this.categorieService.create(this.form)
        .subscribe(() => this.afterSave());
    }
  }

  afterSave() {
    this.resetForm();
    this.loadCategories();
  }

  edit(cat: any) {
    this.isEditMode = true;
    this.selectedId = cat._id;
    this.form = {
      nom: cat.nom,
      description: cat.description
    };
  }

  delete(cat: any) {
    if (confirm(`Supprimer la catégorie "${cat.nom}" ?`)) {
      this.categorieService.delete(cat._id)
        .subscribe(() => this.loadCategories());
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = {
      nom: '',
      description: ''
    };
  }
}
