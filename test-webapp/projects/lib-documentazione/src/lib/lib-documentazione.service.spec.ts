import { TestBed } from '@angular/core/testing';

import { LibDocumentazioneService } from './lib-documentazione.service';

describe('LibDocumentazioneService', () => {
  let service: LibDocumentazioneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibDocumentazioneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
