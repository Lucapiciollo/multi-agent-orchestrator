import { TestBed } from '@angular/core/testing';

import { LibReportService } from './lib-report.service';

describe('LibReportService', () => {
  let service: LibReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
