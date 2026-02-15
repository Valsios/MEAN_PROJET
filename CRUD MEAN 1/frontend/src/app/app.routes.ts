import { Routes } from '@angular/router';
import { LoginClientComponent } from './components/auth/login-client/login-client.component';
import { LoginBoutiqueComponent } from './components/auth/login-boutique/login-boutique.component';
import { LoginAdminComponent } from './components/auth/login-admin/login-admin.component';
import { ClientDashboardComponent } from './components/client/client-dashboard/client-dashboard.component';
import { BoutiqueDashboardComponent } from './components/boutique/boutique-dashboard/boutique-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-boutique', component: LoginBoutiqueComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'boutique-dashboard', component: BoutiqueDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: '', redirectTo: 'login-client', pathMatch: 'full' }
];