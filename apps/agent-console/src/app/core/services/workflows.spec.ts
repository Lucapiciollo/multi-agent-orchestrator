import { TestBed } from '@angular/core/testing';

import { Workflows } from './workflows';

describe('Workflows', () => {
  let service: Workflows;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Workflows);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
