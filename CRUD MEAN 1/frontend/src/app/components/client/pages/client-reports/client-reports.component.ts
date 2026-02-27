import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService, Report, BoutiqueInfo } from '../../../../services/report/report.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-client-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-reports.component.html'
})
export class ClientReportsComponent implements OnInit {
  reports: Report[] = [];
  selectedReport: Report | null = null;
  loading = true;
  error = '';
  showModal = false;

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    const clientId = this.authService.getProfilId();
    if (!clientId) {
      this.error = 'Client non identifié';
      this.loading = false;
      return;
    }

    this.reportService.getClientReports(clientId).subscribe({
      next: (data) => {
        console.log('Reports reçus:', data); // Pour déboguer
        this.reports = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des signalements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  viewDetails(report: Report) {
    this.selectedReport = report;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedReport = null;
  }

  // Méthodes pour accéder aux propriétés de la boutique en toute sécurité
  getBoutiqueName(report: Report): string {
    if (report.boutiqueId && typeof report.boutiqueId === 'object') {
      return (report.boutiqueId as BoutiqueInfo).nom || 'Boutique';
    }
    return 'Boutique';
  }

  getBoutiqueEmail(report: Report): string | null {
    if (report.boutiqueId && typeof report.boutiqueId === 'object') {
      return (report.boutiqueId as BoutiqueInfo).email || null;
    }
    return null;
  }

  getBoutiqueTelephone(report: Report): string | null {
    if (report.boutiqueId && typeof report.boutiqueId === 'object') {
      return (report.boutiqueId as BoutiqueInfo).telephone || null;
    }
    return null;
  }

  getStatusBadgeClass(statut: string = 'en_attente'): string {
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

  getStatusLabel(statut: string = 'en_attente'): string {
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}