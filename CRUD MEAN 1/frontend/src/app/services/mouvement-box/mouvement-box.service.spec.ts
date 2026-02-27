import { TestBed } from '@angular/core/testing';

import { MouvementBoxService } from './mouvement-box.service';

describe('MouvementBoxService', () => {
  let service: MouvementBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouvementBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
