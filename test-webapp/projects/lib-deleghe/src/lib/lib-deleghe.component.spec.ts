import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibDelegheComponent } from './lib-deleghe.component';

describe('LibDelegheComponent', () => {
  let component: LibDelegheComponent;
  let fixture: ComponentFixture<LibDelegheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibDelegheComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibDelegheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
