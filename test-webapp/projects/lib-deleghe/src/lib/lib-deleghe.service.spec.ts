import { TestBed } from '@angular/core/testing';

import { LibDelegheService } from './lib-deleghe.service';

describe('LibDelegheService', () => {
  let service: LibDelegheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibDelegheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
