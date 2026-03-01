import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPanierComponent } from './client-panier.component';

describe('ClientPanierComponent', () => {
  let component: ClientPanierComponent;
  let fixture: ComponentFixture<ClientPanierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPanierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientPanierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
