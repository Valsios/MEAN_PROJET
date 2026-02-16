import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BoutiqueService } from '../../../../services/boutique/boutique.service';
import { BoxService } from '../../../../services/box/box.service';
import { CategorieService } from '../../../../services/categorie/categorie.service';

@Component({
  selector: 'app-boutique-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-list.component.html'
})
export class BoutiqueListComponent implements OnInit {

  boutiques: any[] = [];
  boxesLibres: any[] = [];
  categories: any[] = [];

  isEditMode = false;
  selectedId: string | null = null;

  form: any = {
    nom: '',
    telephone: '',
    email: '',
    categorieId: '',
    boxActuelleId: null
  };

  constructor(
    private boutiqueService: BoutiqueService,
    private boxService: BoxService,
    private categorieService: CategorieService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.boutiqueService.getAll().subscribe(data => this.boutiques = data);
    this.boxService.getBoxesLibres().subscribe(data => this.boxesLibres = data);
    this.categorieService.getAll().subscribe(data => this.categories = data);
  }

  submit() {
    if (this.isEditMode) {
      this.boutiqueService.update(this.selectedId!, this.form)
        .subscribe(() => this.afterSave());
    } else {
      this.boutiqueService.create(this.form)
        .subscribe(() => this.afterSave());
    }
  }

  afterSave() {
    this.resetForm();
    this.loadData();
  }

  edit(b: any) {
    this.isEditMode = true;
    this.selectedId = b._id;
    this.form = {
      nom: b.nom,
      telephone: b.telephone,
      email: b.email,
      categorieId: b.categorieId?._id,
      boxActuelleId: b.boxActuelleId?._id || null
    };
  }

  liberer(b: any) {
    this.boutiqueService.libererBox(b._id)
      .subscribe(() => this.loadData());
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = {
      nom: '',
      telephone: '',
      email: '',
      categorieId: '',
      boxActuelleId: null
    };
  }
}
