import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxHistoriquePrixComponent } from './box-historique-prix.component';

describe('BoxHistoriquePrixComponent', () => {
  let component: BoxHistoriquePrixComponent;
  let fixture: ComponentFixture<BoxHistoriquePrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxHistoriquePrixComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxHistoriquePrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
