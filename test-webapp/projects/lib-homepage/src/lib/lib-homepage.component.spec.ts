import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibHomepageComponent } from './lib-homepage.component';

describe('LibHomepageComponent', () => {
  let component: LibHomepageComponent;
  let fixture: ComponentFixture<LibHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibHomepageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
