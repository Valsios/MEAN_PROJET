import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiquePanierComponent } from './boutique-panier.component';

describe('BoutiquePanierComponent', () => {
  let component: BoutiquePanierComponent;
  let fixture: ComponentFixture<BoutiquePanierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiquePanierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiquePanierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
