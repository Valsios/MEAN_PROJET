import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueStatComponent } from './boutique-stats.component';

describe('BoutiqueStatComponent', () => {
  let component: BoutiqueStatComponent;
  let fixture: ComponentFixture<BoutiqueStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueStatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiqueStatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
