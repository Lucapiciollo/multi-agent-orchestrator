import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionDetail } from './execution-detail';

describe('ExecutionDetail', () => {
  let component: ExecutionDetail;
  let fixture: ComponentFixture<ExecutionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecutionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
