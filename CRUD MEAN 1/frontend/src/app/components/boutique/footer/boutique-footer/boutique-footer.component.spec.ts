import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueFooterComponent } from './boutique-footer.component';

describe('BoutiqueFooterComponent', () => {
  let component: BoutiqueFooterComponent;
  let fixture: ComponentFixture<BoutiqueFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoutiqueFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
