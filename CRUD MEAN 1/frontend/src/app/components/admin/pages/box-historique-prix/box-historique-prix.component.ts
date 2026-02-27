import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MouvementPrixService } from '../../../../services/mouvement-prix/mouvement-prix.service';

@Component({
  selector: 'app-box-historique-prix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './box-historique-prix.component.html'
})
export class BoxHistoriquePrixComponent implements OnInit {

  mouvements: any[] = [];
  boxId!: string;

  constructor(
    private route: ActivatedRoute,
    private mouvementPrixService: MouvementPrixService
  ) {}

  ngOnInit(): void {
    this.boxId = this.route.snapshot.paramMap.get('id')!;
    this.loadHistorique();
  }

  loadHistorique() {
    this.mouvementPrixService.getHistorique(this.boxId)
      .subscribe(data => {
        this.mouvements = data;
      });
  }
}
