import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibConfigurazioniComponent } from './lib-configurazioni.component';

describe('LibConfigurazioniComponent', () => {
  let component: LibConfigurazioniComponent;
  let fixture: ComponentFixture<LibConfigurazioniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibConfigurazioniComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibConfigurazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
