import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReportRespondComponent } from './admin-report-respond.component';

describe('AdminReportRespondComponent', () => {
  let component: AdminReportRespondComponent;
  let fixture: ComponentFixture<AdminReportRespondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReportRespondComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminReportRespondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
