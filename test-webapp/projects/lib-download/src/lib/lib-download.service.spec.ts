import { TestBed } from '@angular/core/testing';

import { LibDownloadService } from './lib-download.service';

describe('LibDownloadService', () => {
  let service: LibDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
