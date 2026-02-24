import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueLoyersComponent } from './boutique-loyers.component';

describe('BoutiqueLoyersComponent', () => {
  let component: BoutiqueLoyersComponent;
  let fixture: ComponentFixture<BoutiqueLoyersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueLoyersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiqueLoyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
