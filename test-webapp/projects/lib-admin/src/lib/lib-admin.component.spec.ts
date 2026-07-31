import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibAdminComponent } from './lib-admin.component';

describe('LibAdminComponent', () => {
  let component: LibAdminComponent;
  let fixture: ComponentFixture<LibAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
