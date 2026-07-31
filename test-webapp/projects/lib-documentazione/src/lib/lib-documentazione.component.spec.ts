import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibDocumentazioneComponent } from './lib-documentazione.component';

describe('LibDocumentazioneComponent', () => {
  let component: LibDocumentazioneComponent;
  let fixture: ComponentFixture<LibDocumentazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibDocumentazioneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibDocumentazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
