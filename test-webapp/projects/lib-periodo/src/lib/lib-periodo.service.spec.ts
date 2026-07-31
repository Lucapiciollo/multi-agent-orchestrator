import { TestBed } from '@angular/core/testing';

import { LibPeriodoService } from './lib-periodo.service';

describe('LibPeriodoService', () => {
  let service: LibPeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibPeriodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
