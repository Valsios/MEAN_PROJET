import { Component, OnInit } from '@angular/core';
import { BoxService, Box } from '../../../../services/box/box.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-box-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './box-list.component.html',
  styleUrls: ['./box-list.component.css']
})

export class BoxListComponent implements OnInit {

  boxes: Box[] = [];

  boxForm: Box = {
    numero: 0,
    etage: 0,
    prixActuel: 0
  };

  isEditMode = false;
  selectedBoxId: string | null = null;

  constructor(private boxService: BoxService) {}

  ngOnInit(): void {
    this.loadBoxes();
  }

  loadBoxes() {
    this.boxService.getAll().subscribe(data => {
      this.boxes = data;
    });
  }

  submitForm() {
    if (this.isEditMode && this.selectedBoxId) {
      this.boxService.update(this.selectedBoxId, this.boxForm)
        .subscribe(() => {
          this.resetForm();
          this.loadBoxes();
        });
    } else {
      this.boxService.create(this.boxForm)
        .subscribe(() => {
          this.resetForm();
          this.loadBoxes();
        });
    }
  }

  editBox(box: Box) {
    this.isEditMode = true;
    this.selectedBoxId = box._id!;
    this.boxForm = { ...box };
  }

  deleteBox(id: string) {
    if (confirm('Supprimer cette box ?')) {
      this.boxService.delete(id).subscribe(() => {
        this.loadBoxes();
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedBoxId = null;
    this.boxForm = {
      numero: 0,
      etage: 0,
      prixActuel: 0
    };
  }
}