import { Routes } from '@angular/router';
import { LoginClientComponent } from './auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './auth/login-admin/login-admin.component';
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { BoutiqueDashboardComponent } from './components/boutique/boutique-dashboard/boutique-dashboard.component';
import { AdminDashboardComponent } from './components/admin/pages/admin-dashboard/admin-dashboard.component';
import { BoxListComponent } from './components/admin/pages/box-list/box-list.component';
import { BoutiqueListComponent } from './components/admin/pages/boutique-list/boutique-list.component';

import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { CategorieListComponent } from './components/admin/pages/categorie-list/categorie-list.component';


export const routes: Routes = [
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-boutique', component: LoginBoutiqueComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'boutique-dashboard', component: BoutiqueDashboardComponent },
  // ADMIN
  {
  path: 'admin',
  component: AdminLayoutComponent,
  children: [
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'boxes', component: BoxListComponent },
    { path: 'boutiques', component: BoutiqueListComponent },
    { path: 'categories', component: CategorieListComponent },
  ]
},
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];