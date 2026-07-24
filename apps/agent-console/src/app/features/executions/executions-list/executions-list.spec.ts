import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionsList } from './executions-list';

describe('ExecutionsList', () => {
  let component: ExecutionsList;
  let fixture: ComponentFixture<ExecutionsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecutionsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutionsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
