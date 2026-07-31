import { TestBed } from '@angular/core/testing';

import { LibAdminService } from './lib-admin.service';

describe('LibAdminService', () => {
  let service: LibAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
