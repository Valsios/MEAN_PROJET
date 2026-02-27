import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService, Report } from '../../../../services/report/report.service';

@Component({
  selector: 'app-admin-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-reports-list.component.html',
  styleUrls: ['./admin-reports-list.component.css']
})
export class AdminReportsListComponent implements OnInit {
  // Exposer Math pour le template
  Math = Math;

  reports: Report[] = [];
  filteredReports: Report[] = [];
  
  // États
  loading = true;
  error = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Filtres
  searchTerm: string = '';
  filters = {
    client: '',
    boutique: '',
    statut: 'tous'
  };

  // Données pour les filtres
  uniqueClients: { id: string; name: string; }[] = [];
  uniqueBoutiques: { id: string; name: string; }[] = [];

  constructor(
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getAllReports().subscribe({
      next: (data) => {
        console.log('Reports chargés:', data);
        this.reports = data;
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des signalements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  extractUniqueValues() {
    // Extraire les clients uniques
    const clientsMap = new Map();
    this.reports.forEach(report => {
      const client = report.clientId;
      if (client && typeof client === 'object' && client._id) {
        const clientName = `${client.prenom || ''} ${client.nom || ''}`.trim();
        if (clientName && !clientsMap.has(client._id)) {
          clientsMap.set(client._id, clientName);
        }
      }
    });
    
    this.uniqueClients = Array.from(clientsMap.entries()).map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Extraire les boutiques uniques
    const boutiquesMap = new Map();
    this.reports.forEach(report => {
      const boutique = report.boutiqueId;
      if (boutique && typeof boutique === 'object' && boutique._id) {
        const boutiqueName = boutique.nom || '';
        if (boutiqueName && !boutiquesMap.has(boutique._id)) {
          boutiquesMap.set(boutique._id, boutiqueName);
        }
      }
    });
    
    this.uniqueBoutiques = Array.from(boutiquesMap.entries()).map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  applyFilters() {
    let filtered = [...this.reports];

    // Filtre par recherche globale
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(term) ||
        this.getClientName(report).toLowerCase().includes(term) ||
        this.getBoutiqueName(report).toLowerCase().includes(term) ||
        (report.description && report.description.toLowerCase().includes(term))
      );
    }

    // Filtre par client
    if (this.filters.client) {
      filtered = filtered.filter(report => 
        report.clientId && 
        typeof report.clientId === 'object' && 
        report.clientId._id === this.filters.client
      );
    }

    // Filtre par boutique
    if (this.filters.boutique) {
      filtered = filtered.filter(report => 
        report.boutiqueId && 
        typeof report.boutiqueId === 'object' && 
        report.boutiqueId._id === this.filters.boutique
      );
    }

    // Filtre par statut
    if (this.filters.statut !== 'tous') {
      filtered = filtered.filter(report => report.statut === this.filters.statut);
    }

    // Tri par date (plus récent d'abord)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateReport || 0).getTime();
      const dateB = new Date(b.dateReport || 0).getTime();
      return dateB - dateA;
    });

    this.filteredReports = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReports.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Pagination
  get paginatedReports(): Report[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredReports.slice(start, end);
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
    return !!(this.searchTerm || 
              this.filters.client || 
              this.filters.boutique || 
              this.filters.statut !== 'tous');
  }

  resetFilters() {
    this.searchTerm = '';
    this.filters = {
      client: '',
      boutique: '',
      statut: 'tous'
    };
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  getClientNameById(clientId: string): string {
    const client = this.uniqueClients.find(c => c.id === clientId);
    return client ? client.name : 'Client inconnu';
  }

  getBoutiqueNameById(boutiqueId: string): string {
    const boutique = this.uniqueBoutiques.find(b => b.id === boutiqueId);
    return boutique ? boutique.name : 'Boutique inconnue';
  }

  getCountByStatus(statut: string): number {
    return this.filteredReports.filter(r => r.statut === statut).length;
  }

  // Méthodes pour accéder aux propriétés en toute sécurité
  getClientName(report: Report): string {
    if (report.clientId && typeof report.clientId === 'object') {
      return `${report.clientId.prenom || ''} ${report.clientId.nom || ''}`.trim() || 'Client inconnu';
    }
    return 'Client inconnu';
  }

  getClientEmail(report: Report): string {
    if (report.clientId && typeof report.clientId === 'object') {
      return report.clientId.email || 'Email non disponible';
    }
    return 'Email non disponible';
  }

  getBoutiqueName(report: Report): string {
    if (report.boutiqueId && typeof report.boutiqueId === 'object') {
      return report.boutiqueId.nom || 'Boutique inconnue';
    }
    return 'Boutique inconnue';
  }

  getBoutiqueCategorie(report: Report): string {
    if (report.boutiqueId && 
        typeof report.boutiqueId === 'object' && 
        report.boutiqueId.categorieId &&
        typeof report.boutiqueId.categorieId === 'object') {
      return report.boutiqueId.categorieId.nom || 'Non catégorisé';
    }
    return 'Non catégorisé';
  }

  getStatusBadgeClass(statut: string): string {
    switch(statut) {
      case 'en_attente':
        return 'bg-warning text-dark';
      case 'valide':
        return 'bg-success';
      case 'refuse':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(statut: string): string {
    switch(statut) {
      case 'en_attente':
        return 'En attente';
      case 'valide':
        return 'Validé';
      case 'refuse':
        return 'Refusé';
      default:
        return statut;
    }
  }

  getStatusIcon(statut: string): string {
    switch(statut) {
      case 'en_attente':
        return 'bi-hourglass-split';
      case 'valide':
        return 'bi-check-circle';
      case 'refuse':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  formatDate(date: Date | string | undefined): Date {
    return date ? new Date(date) : new Date();
  }

  canRespond(statut: string): boolean {
    return statut === 'en_attente';
  }

  respondToReport(reportId: string) {
    this.router.navigate(['/admin/reports/respond', reportId]);
  }

  viewDetails(reportId: string) {
    this.router.navigate(['/admin/reports/details', reportId]);
  }

  refresh() {
    this.loading = true;
    this.error = '';
    this.loadReports();
  }
}