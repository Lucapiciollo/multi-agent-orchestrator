import { TestBed } from '@angular/core/testing';

import { LibHomepageService } from './lib-homepage.service';

describe('LibHomepageService', () => {
  let service: LibHomepageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibHomepageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
