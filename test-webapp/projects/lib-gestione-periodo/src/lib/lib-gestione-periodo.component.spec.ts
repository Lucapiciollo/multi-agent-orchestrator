import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibGestionePeriodoComponent } from './lib-gestione-periodo.component';

describe('LibGestionePeriodoComponent', () => {
  let component: LibGestionePeriodoComponent;
  let fixture: ComponentFixture<LibGestionePeriodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibGestionePeriodoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibGestionePeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
