import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeClientListeComponent } from './commande-client-liste.component';

describe('CommandeClientListeComponent', () => {
  let component: CommandeClientListeComponent;
  let fixture: ComponentFixture<CommandeClientListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeClientListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommandeClientListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
