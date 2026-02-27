import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiquePaiementComponent } from './boutique-paiement.component';

describe('BoutiquePaiementComponent', () => {
  let component: BoutiquePaiementComponent;
  let fixture: ComponentFixture<BoutiquePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiquePaiementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiquePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
