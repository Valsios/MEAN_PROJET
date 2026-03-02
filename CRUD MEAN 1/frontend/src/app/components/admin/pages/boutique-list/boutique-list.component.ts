import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BoutiqueService, BoutiqueCreate } from '../../../../services/boutique/boutique.service';
import { BoxService } from '../../../../services/box/box.service';
import { CategorieService } from '../../../../services/categorie/categorie.service';
import { MouvementService } from '../../../../services/mouvement-box/mouvement-box.service';

@Component({
  selector: 'app-boutique-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './boutique-list.component.html',
  styleUrls: ['./boutique-list.component.css']
})
export class BoutiqueListComponent implements OnInit {
  // Exposer Math pour le template
  Math = Math;

  // Données
  boutiques: any[] = [];
  filteredBoutiques: any[] = [];
  boxesLibres: any[] = [];
  categories: any[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Filtres et recherche
  searchTerm: string = '';
  sortBy: string = 'nom';
  submitted: boolean = false;

  filters = {
    categorie: '',
    boxStatut: 'all' // 'all', 'withBox', 'withoutBox'
  };

  // État du formulaire
  isEditMode = false;
  selectedId: string | null = null;

  // Image preview
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  form: any = {
    nom: '',
    telephone: '',
    email: '',
    password: '',
    categorieId: '',
    boxActuelleId: null,
    image: null
  };

   // Ajoutez cette propriété
  dataLoaded: boolean = false;
  
  // Compteur pour suivre le nombre de requêtes terminées
  private loadedRequests: number = 0;
  private totalRequests: number = 3; // boutiques + boxes + categories

  constructor(
    private boutiqueService: BoutiqueService,
    private boxService: BoxService,
    private categorieService: CategorieService,
    private mouvementService: MouvementService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Réinitialiser l'état de chargement
    this.dataLoaded = false;
    this.loadedRequests = 0;

    // Charger les boutiques
    this.boutiqueService.getAll().subscribe({
      next: (data) => {
        this.boutiques = data;
        this.checkAllDataLoaded();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des boutiques');
        this.checkAllDataLoaded(); // Compter même en erreur pour ne pas bloquer
      }
    });

    // Charger les boxes libres
    this.boxService.getBoxesLibres().subscribe({
      next: (data) => {
        this.boxesLibres = data;
        this.checkAllDataLoaded();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des boxes libres');
        this.checkAllDataLoaded();
      }
    });

    // Charger les catégories
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.checkAllDataLoaded();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des catégories');
        this.checkAllDataLoaded();
      }
    });
  }

  private checkAllDataLoaded() {
    this.loadedRequests++;
    if (this.loadedRequests === this.totalRequests) {
      // Toutes les requêtes sont terminées (succès ou échec)
      this.dataLoaded = true;
      this.applyFilters(); // Appliquer les filtres une fois les données chargées
    }
  }


  applyFilters() {
    let filtered = [...this.boutiques];

    // Recherche multicritères (nom et email)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(b => 
        b.nom.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        (b.telephone && b.telephone.includes(term))
      );
    }

    // Filtre par catégorie
    if (this.filters.categorie) {
      filtered = filtered.filter(b => 
        b.categorieId?._id === this.filters.categorie
      );
    }

    // Filtre par statut box
    if (this.filters.boxStatut === 'withBox') {
      filtered = filtered.filter(b => b.boxActuelleId);
    } else if (this.filters.boxStatut === 'withoutBox') {
      filtered = filtered.filter(b => !b.boxActuelleId);
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

    this.filteredBoutiques = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredBoutiques.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Pagination
  get paginatedBoutiques(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredBoutiques.slice(start, end);
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
    this.updatePagination();
    this.currentPage = 1;
  }

  // Gestion des filtres
  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filters.categorie || this.filters.boxStatut !== 'all');
  }

  resetFilters() {
    this.searchTerm = '';
    this.filters = {
      categorie: '',
      boxStatut: 'all'
    };
    this.sortBy = 'nom';
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  getCategorieName(categorieId: string): string {
    const cat = this.categories.find(c => c._id === categorieId);
    return cat ? cat.nom : 'Catégorie inconnue';
  }

  // Gestion de l'image
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.form.image = e.target.result; // Base64
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.form.image = null;
  }

  // NOUVELLE MÉTHODE : Vérifier le paiement avant action
  verifierPaiementAvantAction(boutique: any, action: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Si la boutique n'a pas de box, pas de vérification nécessaire
      if (!boutique.boxActuelleId) {
        resolve(true);
        return;
      }


      this.boutiqueService.verifierPaiementLoyer(boutique._id).subscribe({
        next: (resultat) => {
          console.log(resultat);
          if (resultat.estPaye) {
            resolve(true);
          } else {
            this.showError(`Action impossible : ${resultat.message}. Veuillez payer le loyer du mois en cours avant de ${action}.`);
            resolve(false);
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la vérification du paiement');
          resolve(false);
        }
      });
    });
  }

  // CRUD Operations
  async submit() {
    this.submitted = true;

    // Validation
    if (!this.form.nom || !this.form.telephone || !this.form.email || !this.form.categorieId) {
      this.showError('Veuillez remplir tous les champs requis');
      return;
    }

    // Validation du mot de passe uniquement en création
    if (!this.isEditMode && !this.form.password) {
      this.showError('Le mot de passe est requis pour la création');
      return;
    }

    if (this.isEditMode && this.selectedId) {
      await this.updateBoutique();
    } else {
      this.createBoutique();
    }
  }

  private async updateBoutique() {
    const ancienneBoutique = this.boutiques.find(b => b._id === this.selectedId);
    const ancienneBoxId = ancienneBoutique?.boxActuelleId?._id || null;
    const nouvelleBoxId = this.form.boxActuelleId;

    // Vérification si on essaie de changer de box
    if (ancienneBoxId !== nouvelleBoxId && nouvelleBoxId) {
      const peutChanger = await this.verifierPaiementAvantAction(ancienneBoutique, 'changer de box');
      if (!peutChanger) {
        return;
      }
    }

    // Préparer les données sans le mot de passe
    const updateData = {
      nom: this.form.nom,
      telephone: this.form.telephone,
      email: this.form.email,
      categorieId: this.form.categorieId,
      boxActuelleId: this.form.boxActuelleId,
      image: this.form.image
    };

    this.boutiqueService.update(this.selectedId!, updateData)
      .subscribe({
        next: () => {
          // Gestion du changement de box
          if (ancienneBoxId !== nouvelleBoxId) {
            this.handleBoxChange(this.selectedId!, ancienneBoxId, nouvelleBoxId);
          } else {
            this.afterSave();
            this.showSuccess('Boutique modifiée avec succès');
          }
        },
        error: (error) => {
          if (error.error?.code === 'LOYER_IMPAYE') {
            this.showError(error.error.message);
          } else {
            this.showError(this.getErrorMessage(error));
          }
        }
      });
  }

  private createBoutique() {
    // Préparer les données avec le mot de passe
    const createData: any = {
      nom: this.form.nom,
      telephone: this.form.telephone,
      email: this.form.email,
      password: this.form.password,
      categorieId: this.form.categorieId,
      boxActuelleId: this.form.boxActuelleId,
      image: this.form.image
    };

    this.boutiqueService.create(createData)
      .subscribe({
        next: (newBoutique: any) => {
          if (this.form.boxActuelleId) {
            this.createMouvement(newBoutique.boutique._id, this.form.boxActuelleId);
          } else {
            this.afterSave();
            this.showSuccess('Boutique créée avec succès');
          }
        },
        error: (error) => {
          this.showError(this.getErrorMessage(error));
        }
      });
  }

  private handleBoxChange(boutiqueId: string, ancienneBoxId: string | null, nouvelleBoxId: string | null) {
    // Clôturer l'ancien mouvement si existant
    if (ancienneBoxId) {
      this.mouvementService.getMouvementActif(boutiqueId)
        .subscribe({
          next: (res) => {
            const actif = res.mouvements?.find((m: any) => !m.dateFin);
            if (actif) {
              this.mouvementService.updateMouvement(actif._id, {
                dateFin: new Date()
              }).subscribe();
            }
          }
        });
    }

    // Créer un nouveau mouvement si nouvelle box sélectionnée
    if (nouvelleBoxId) {
      this.createMouvement(boutiqueId, nouvelleBoxId);
    }

    this.afterSave();
    this.showSuccess('Boutique modifiée avec succès');
  }

  private createMouvement(boutiqueId: string, boxId: string) {
    this.mouvementService.createMouvement({
      boutiqueId: boutiqueId,
      boxId: boxId,
      dateDebut: new Date(),
      dateFin: null,
      statut: 'en_cours'
    }).subscribe();
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
      password: '', // Vide en édition
      categorieId: b.categorieId?._id,
      boxActuelleId: b.boxActuelleId?._id || null,
      image: b.image || null
    };
    this.imagePreview = b.image || null;
    this.submitted = false;
    
    document.querySelector('form')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  async liberer(b: any) {
    // Vérification du paiement avant de libérer
    const peutLiberer = await this.verifierPaiementAvantAction(b, 'libérer la box');
    console.log(peutLiberer)
    if (!peutLiberer) {
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir libérer la box de la boutique "${b.nom}" ?`)) {
      this.boutiqueService.libererBox(b._id)
        .subscribe({
          next: () => {
            this.showSuccess('Box libérée avec succès');
            this.loadData();
          },
          error: (error) => {
            if (error.error?.code === 'LOYER_IMPAYE') {
              this.showError(error.error.message);
            } else {
              this.showError(this.getErrorMessage(error));
            }
          }
        });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedId = null;
    this.form = {
      nom: '',
      telephone: '',
      email: '',
      password: '',
      categorieId: '',
      boxActuelleId: null,
      image: null
    };
    this.imagePreview = null;
    this.selectedFile = null;
    this.submitted = false;
  }

  // Gestion des messages
  private showSuccess(message: string) {
    alert('✓ ' + message);
    window.location.reload();
  }

  private showError(message: string) {
    alert('✗ ' + message);
  }

  private getErrorMessage(error: any): string {
    return error.error?.message || 'Une erreur est survenue';
  }
}