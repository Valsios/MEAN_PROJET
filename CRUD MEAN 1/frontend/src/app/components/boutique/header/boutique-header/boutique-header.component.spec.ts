import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueHeaderComponent } from './boutique-header.component';

describe('BoutiqueHeaderComponent', () => {
  let component: BoutiqueHeaderComponent;
  let fixture: ComponentFixture<BoutiqueHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiqueHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
