import { TestBed } from '@angular/core/testing';

import { LibFeriePermessiService } from './lib-ferie-permessi.service';

describe('LibFeriePermessiService', () => {
  let service: LibFeriePermessiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibFeriePermessiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
