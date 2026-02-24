import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoutiqueHeaderComponent } from '../header/boutique-header/boutique-header.component';
import { BoutiqueFooterComponent } from '../footer/boutique-footer/boutique-footer.component';
@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule,BoutiqueHeaderComponent,BoutiqueFooterComponent],
  templateUrl: './boutique-dashboard.component.html'
})
export class BoutiqueDashboardComponent {
}
