import { TestBed } from '@angular/core/testing';

import { LibCommesseService } from './lib-commesse.service';

describe('LibCommesseService', () => {
  let service: LibCommesseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibCommesseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
