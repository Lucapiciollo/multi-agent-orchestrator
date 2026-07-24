import { TestBed } from '@angular/core/testing';

import { Providers } from './providers';

describe('Providers', () => {
  let service: Providers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Providers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
