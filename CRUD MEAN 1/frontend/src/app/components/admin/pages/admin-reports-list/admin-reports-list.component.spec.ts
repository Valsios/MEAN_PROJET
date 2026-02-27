import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReportsListComponent } from './admin-reports-list.component';

describe('AdminReportsListComponent', () => {
  let component: AdminReportsListComponent;
  let fixture: ComponentFixture<AdminReportsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReportsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminReportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
