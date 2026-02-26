import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCatalogueProduitComponent } from './client-catalogue-produit.component';

describe('ClientCatalogueProduitComponent', () => {
  let component: ClientCatalogueProduitComponent;
  let fixture: ComponentFixture<ClientCatalogueProduitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCatalogueProduitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientCatalogueProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
