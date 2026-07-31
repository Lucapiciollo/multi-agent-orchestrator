import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibPeriodoComponent } from './lib-periodo.component';

describe('LibPeriodoComponent', () => {
  let component: LibPeriodoComponent;
  let fixture: ComponentFixture<LibPeriodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibPeriodoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibPeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
