import { Routes } from '@angular/router';
import { LoginClientComponent } from './auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './auth/login-admin/login-admin.component';
import { ClientDashboardComponent } from './client/client-dashboard/client-dashboard.component';
import { BoutiqueDashboardComponent } from './boutique/boutique-dashboard/boutique-dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-boutique', component: LoginBoutiqueComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'boutique-dashboard', component: BoutiqueDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];