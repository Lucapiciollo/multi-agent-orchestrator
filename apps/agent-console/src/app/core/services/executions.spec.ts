import { TestBed } from '@angular/core/testing';

import { Executions } from './executions';

describe('Executions', () => {
  let service: Executions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Executions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
