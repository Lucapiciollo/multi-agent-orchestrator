import { Component, OnInit } from '@angular/core';
import { SkillsService } from '../../../core/services/skills.service';
@Component({ selector: 'app-skills-list', standalone: false, templateUrl: './skills-list.html', styleUrl: './skills-list.scss' })
export class SkillsList implements OnInit {
  skills: any[] = []; loading = true;
  constructor(private svc: SkillsService) {}
  ngOnInit() { this.svc.getAll().subscribe({ next: d => { this.skills = d; this.loading = false; }, error: () => this.loading = false }); }
}
