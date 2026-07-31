import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibCommesseComponent } from './lib-commesse.component';

describe('LibCommesseComponent', () => {
  let component: LibCommesseComponent;
  let fixture: ComponentFixture<LibCommesseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibCommesseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibCommesseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
