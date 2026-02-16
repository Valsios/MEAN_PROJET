import { Routes } from '@angular/router';
import { LoginClientComponent } from './auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './auth/login-admin/login-admin.component';
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { BoutiqueDashboardComponent } from './components/boutique/boutique-dashboard/boutique-dashboard.component';
import { AdminDashboardComponent } from './components/admin/pages/admin-dashboard/admin-dashboard.component';
import { BoxListComponent } from './components/admin/pages/box-list/box-list.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';

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
    { path: 'boxes', component: BoxListComponent }
  ]
},
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];