import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReportService, Report } from '../../../../services/report/report.service';

@Component({
  selector: 'app-admin-report-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-report-details.component.html',
  styleUrls: ['./admin-report-details.component.css']
})
export class AdminReportDetailsComponent implements OnInit {
  reportId: string = '';
  report: Report | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.reportId) {
      this.router.navigate(['/admin/reports']);
      return;
    }
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.error = '';
    
    this.reportService.getReportById(this.reportId).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du signalement';
        this.loading = false;
        console.error('Erreur détaillée:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/reports']);
  }

  // Méthodes utilitaires
  getClientInfo() {
    if (this.report?.clientId && typeof this.report.clientId === 'object') {
      return this.report.clientId;
    }
    return null;
  }

  getBoutiqueInfo() {
    if (this.report?.boutiqueId && typeof this.report.boutiqueId === 'object') {
      return this.report.boutiqueId;
    }
    return null;
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

  canRespond(): boolean {
    return this.report?.statut === 'en_attente';
  }

  respondToReport() {
    if (this.report) {
      this.router.navigate(['/admin/reports/respond', this.report._id]);
    }
  }
}