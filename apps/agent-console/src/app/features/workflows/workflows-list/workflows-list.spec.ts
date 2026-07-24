import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsList } from './workflows-list';

describe('WorkflowsList', () => {
  let component: WorkflowsList;
  let fixture: ComponentFixture<WorkflowsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
