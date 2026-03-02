import { Routes } from '@angular/router';
import { LoginClientComponent } from './auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './auth/login-admin/login-admin.component';
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
import { CommandeClientListeComponent } from './components/boutique/commande-client-liste/commande-client-liste.component';
import { BoutiqueLoyersComponent } from './components/boutique/boutique-loyers/boutique-loyers.component';
import { BoutiqueProduitsComponent } from './components/boutique/boutique-produits/boutique-produits.component';
import { ProduitFormComponent } from './components/boutique/produit-form/produit-form.component';
import { BoutiquePanierComponent } from './components/boutique/boutique-panier/boutique-panier.component';
import { ClientPanierComponent } from './components/client/client-panier/client-panier.component';
import { ClientCommandeComponent } from './components/client/client-commande/client-commande.component';
import { ClientCatalogueProduitComponent } from './components/client/client-catalogue-produit/client-catalogue-produit.component';
import { ProduitDetailsComponent } from './components/boutique/produit-details/produit-details.component';
import { ClientProduitDetailsComponent } from './components/client/client-produit-details/client-produit-details.component';
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { BoutiqueProfilComponent } from './components/boutique/boutique-profil/boutique-profil.component';





export const routes: Routes = [
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-boutique', component: LoginBoutiqueComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'commande-client-liste', component: CommandeClientListeComponent },
  { path: 'boutique-loyers', component: BoutiqueLoyersComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'boutique-dashboard', component: BoutiqueDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'boutique-produit', component: BoutiqueProduitsComponent },
  { path: 'produit-form', component: ProduitFormComponent },
  { path: 'panier-boutique', component: BoutiquePanierComponent },
  { path: 'client-panier', component: ClientPanierComponent },
  { path: 'client-commande', component: ClientCommandeComponent },
  { path: 'client-catalogue-produit/:id', component: ClientCatalogueProduitComponent },
  { path: 'produit-details/:id', component: ProduitDetailsComponent },
  { path: 'client-produit-details/:id', component: ClientProduitDetailsComponent },
  { path: 'boutique-profil', component: BoutiqueProfilComponent},
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
      { path: 'boutiques', component: ClientBoutiquesComponent },
      { path: 'report/:id', component: ClientReportComponent },
      { path: 'reports', component: ClientReportsComponent },
    ]

  },
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];