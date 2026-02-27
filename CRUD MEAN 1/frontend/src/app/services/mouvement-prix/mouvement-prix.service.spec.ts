import { TestBed } from '@angular/core/testing';

import { MouvementPrixService } from './mouvement-prix.service';

describe('MouvementPrixService', () => {
  let service: MouvementPrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouvementPrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
