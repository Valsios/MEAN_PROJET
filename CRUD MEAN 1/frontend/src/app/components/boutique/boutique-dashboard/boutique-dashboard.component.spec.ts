import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueDashboardComponent } from './boutique-dashboard.component';

describe('BoutiqueDashboardComponent', () => {
  let component: BoutiqueDashboardComponent;
  let fixture: ComponentFixture<BoutiqueDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiqueDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
