import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReportService, Report, ReportResponse } from '../../../../services/report/report.service';

@Component({
  selector: 'app-admin-report-respond',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-report-respond.component.html',
  styleUrls: ['./admin-report-respond.component.css']
})
export class AdminReportRespondComponent implements OnInit {
  reportId: string = '';
  report: Report | null = null;
  
  // Formulaire
  today = new Date().toISOString().split('T')[0];
  commentaire = '';
  statut: 'valide' | 'refuse' = 'valide';
  
  // États
  loading = true;
  submitting = false;
  error = '';
  success = '';
  submitted = false;

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
    this.reportService.getReportById(this.reportId).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du signalement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (!this.commentaire) {
      this.error = 'Veuillez saisir un commentaire';
      return;
    }

    this.submitting = true;
    this.error = '';

    const response: ReportResponse = {
      statut: this.statut,
      commentaire: this.commentaire
    };

    this.reportService.respondToReport(this.reportId, response).subscribe({
      next: () => {
        this.success = 'Réponse envoyée avec succès !';
        setTimeout(() => {
          this.router.navigate(['/admin/reports']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'envoi de la réponse';
        this.submitting = false;
      }
    });
  }

  cancel() {
    if (this.commentaire) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications non enregistrées seront perdues.')) {
        this.router.navigate(['/admin/reports']);
      }
    } else {
      this.router.navigate(['/admin/reports']);
    }
  }

  // Méthodes utilitaires
  getClientName(): string {
    if (this.report?.clientId && typeof this.report.clientId === 'object') {
      return `${this.report.clientId.prenom || ''} ${this.report.clientId.nom || ''}`.trim() || 'Client inconnu';
    }
    return 'Client inconnu';
  }

  getClientEmail(): string {
    if (this.report?.clientId && typeof this.report.clientId === 'object') {
      return this.report.clientId.email || 'Email non disponible';
    }
    return 'Email non disponible';
  }

  getClientTelephone(): string {
    if (this.report?.clientId && typeof this.report.clientId === 'object') {
      return this.report.clientId.telephone || 'Téléphone non disponible';
    }
    return 'Téléphone non disponible';
  }

  getBoutiqueName(): string {
    if (this.report?.boutiqueId && typeof this.report.boutiqueId === 'object') {
      return this.report.boutiqueId.nom || 'Boutique inconnue';
    }
    return 'Boutique inconnue';
  }

  getBoutiqueEmail(): string {
    if (this.report?.boutiqueId && typeof this.report.boutiqueId === 'object') {
      return this.report.boutiqueId.email || 'Email non disponible';
    }
    return 'Email non disponible';
  }

  getBoutiqueTelephone(): string {
    if (this.report?.boutiqueId && typeof this.report.boutiqueId === 'object') {
      return this.report.boutiqueId.telephone || 'Téléphone non disponible';
    }
    return 'Téléphone non disponible';
  }

  getBoutiqueCategorie(): string {
    if (this.report?.boutiqueId && 
        typeof this.report.boutiqueId === 'object' && 
        this.report.boutiqueId.categorieId &&
        typeof this.report.boutiqueId.categorieId === 'object') {
      return this.report.boutiqueId.categorieId.nom || 'Non catégorisé';
    }
    return 'Non catégorisé';
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