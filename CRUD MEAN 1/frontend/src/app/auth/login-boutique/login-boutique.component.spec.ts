import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginBoutiqueComponent } from './login-boutique.component';

describe('LoginBoutiqueComponent', () => {
  let component: LoginBoutiqueComponent;
  let fixture: ComponentFixture<LoginBoutiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginBoutiqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginBoutiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
