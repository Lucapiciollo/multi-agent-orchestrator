import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workflows } from './workflows';

describe('Workflows', () => {
  let component: Workflows;
  let fixture: ComponentFixture<Workflows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Workflows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workflows);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
