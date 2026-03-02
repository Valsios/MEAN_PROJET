import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoutiqueService, Boutique } from '../../../../services/boutique/boutique.service';
import { ReportService, CreateReportDTO } from '../../../../services/report/report.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-client-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-report.component.html'
})
export class ClientReportComponent implements OnInit {
  boutiqueId: string = '';
  boutique: Boutique | null = null;
  
  // Formulaire
  today = new Date().toISOString().split('T')[0];
  title = '';
  description = '';
  
  loading = true;
  submitting = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boutiqueService: BoutiqueService,
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.boutiqueId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.boutiqueId) {
      this.router.navigate(['/client-dashboard']);
      return;
    }
    this.loadBoutique();
  }

  loadBoutique() {
    this.boutiqueService.getBoutiqueById(this.boutiqueId).subscribe({
      next: (data) => {
        this.boutique = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la boutique';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (!this.title) {
      this.error = 'Veuillez saisir un titre pour le signalement';
      return;
    }

    this.submitting = true;
    this.error = '';
    
    // Récupérer l'ID du client connecté
    const user = this.authService.getCurrentUser();
    console.log(user);
    const clientId = user?.profilId || null;
    //console.log (clientId);

    

    // Utiliser CreateReportDTO
    const report: CreateReportDTO = {
      clientId: clientId,
      boutiqueId: this.boutiqueId,  // Maintenant c'est un string, ce qui est correct
      title: this.title,
      description: this.description,
      dateReport: new Date(),
      statut: 'en_attente'
    };

    this.reportService.createReport(report).subscribe({
      next: () => {
        this.success = 'Signalement envoyé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/client-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'envoi du signalement';
        this.submitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/client-dashboard']);
  }
}