import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibDownloadComponent } from './lib-download.component';

describe('LibDownloadComponent', () => {
  let component: LibDownloadComponent;
  let fixture: ComponentFixture<LibDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibDownloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
