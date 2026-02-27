import { Routes } from '@angular/router';
import { LoginClientComponent } from './auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './auth/login-admin/login-admin.component';
import { ClientDashboardComponent } from './components/client/pages/client-dashboard/client-dashboard.component';
import { BoutiqueDashboardComponent } from './components/boutique/boutique-dashboard/boutique-dashboard.component';
import { AdminDashboardComponent } from './components/admin/pages/admin-dashboard/admin-dashboard.component';
import { BoxListComponent } from './components/admin/pages/box-list/box-list.component';
import { BoutiqueListComponent } from './components/admin/pages/boutique-list/boutique-list.component';

import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { CategorieListComponent } from './components/admin/pages/categorie-list/categorie-list.component';
import { BoutiqueStatsComponent } from './components/admin/pages/boutique-stats/boutique-stats.component';
import { BoutiquePaiementComponent } from './components/admin/pages/boutique-paiement/boutique-paiement.component';
import { BoxHistoriquePrixComponent } from './components/admin/pages/box-historique-prix/box-historique-prix.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminReportsListComponent } from './components/admin/pages/admin-reports-list/admin-reports-list.component';
import { AdminReportRespondComponent } from './components/admin/pages/admin-report-respond/admin-report-respond.component';
import { AdminReportDetailsComponent } from './components/admin/pages/admin-report-details/admin-report-details.component';

import { ClientLayoutComponent } from './components/client/layout/client-layout.component';
import { ClientBoutiquesComponent } from './components/client/pages/client-boutique-list/client-boutique-list.component';
import { ClientReportComponent } from './components/client/pages/client-report/client-report.component';
import { ClientReportsComponent } from './components/client/pages/client-reports/client-reports.component';





export const routes: Routes = [
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-boutique', component: LoginBoutiqueComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'boutique-dashboard', component: BoutiqueDashboardComponent },
  { path: 'register', component: RegisterComponent },
  // ADMIN
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'boxes', component: BoxListComponent },
      { path: 'boutiques', component: BoutiqueListComponent },
      { path: 'categories', component: CategorieListComponent },
      { path: 'boutique/:id/stats', component: BoutiqueStatsComponent },
      { path: 'boutique/:id/paiement', component: BoutiquePaiementComponent },
      { path: 'boxes/:id/historique-prix', component: BoxHistoriquePrixComponent },
      { path: 'reports', component: AdminReportsListComponent },
      { path: 'reports/respond/:id', component: AdminReportRespondComponent },
      { path: 'reports/details/:id', component: AdminReportDetailsComponent },
    ],
  }, 

  {
    path: 'client',
    component: ClientLayoutComponent,
    children: [
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'boutiques', component: ClientBoutiquesComponent },
      { path: 'report/:id', component: ClientReportComponent },
      { path: 'reports', component: ClientReportsComponent },
    ]

  },
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];