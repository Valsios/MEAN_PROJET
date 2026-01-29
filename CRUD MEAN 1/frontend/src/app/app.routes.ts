import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
export const routes: Routes = [
    { path: 'articles', component: ArticleListComponent }, // Route pourarticle-list
    { path: '', redirectTo: 'articles', pathMatch: 'full' }
];