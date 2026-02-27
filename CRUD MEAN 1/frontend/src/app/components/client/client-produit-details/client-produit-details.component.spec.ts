import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProduitDetailsComponent } from './client-produit-details.component';

describe('ClientProduitDetailsComponent', () => {
  let component: ClientProduitDetailsComponent;
  let fixture: ComponentFixture<ClientProduitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProduitDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientProduitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
