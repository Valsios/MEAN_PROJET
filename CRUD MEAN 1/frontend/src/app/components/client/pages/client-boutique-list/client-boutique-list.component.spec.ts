import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBoutiqueListComponent } from './client-boutique-list.component';

describe('ClientBoutiqueListComponent', () => {
  let component: ClientBoutiqueListComponent;
  let fixture: ComponentFixture<ClientBoutiqueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBoutiqueListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientBoutiqueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
