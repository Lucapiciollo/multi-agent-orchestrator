import { TestBed } from '@angular/core/testing';

import { LibGestionePeriodoService } from './lib-gestione-periodo.service';

describe('LibGestionePeriodoService', () => {
  let service: LibGestionePeriodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibGestionePeriodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
