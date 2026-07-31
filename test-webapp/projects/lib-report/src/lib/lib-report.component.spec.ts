import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibReportComponent } from './lib-report.component';

describe('LibReportComponent', () => {
  let component: LibReportComponent;
  let fixture: ComponentFixture<LibReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LibReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
