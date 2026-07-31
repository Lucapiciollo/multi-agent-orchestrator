import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibFeriePermessiComponent } from './lib-ferie-permessi.component';

describe('LibFeriePermessiComponent', () => {
  let component: LibFeriePermessiComponent;
  let fixture: ComponentFixture<LibFeriePermessiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibFeriePermessiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibFeriePermessiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
