import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsList } from './skills-list';

describe('SkillsList', () => {
  let component: SkillsList;
  let fixture: ComponentFixture<SkillsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkillsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
