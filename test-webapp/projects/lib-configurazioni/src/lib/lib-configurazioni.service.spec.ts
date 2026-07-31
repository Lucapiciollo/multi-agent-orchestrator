import { TestBed } from '@angular/core/testing';

import { LibConfigurazioniService } from './lib-configurazioni.service';

describe('LibConfigurazioniService', () => {
  let service: LibConfigurazioniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibConfigurazioniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
