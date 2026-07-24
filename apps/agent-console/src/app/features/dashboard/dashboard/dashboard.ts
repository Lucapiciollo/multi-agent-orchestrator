import { Component, OnInit } from '@angular/core';
import { AgentsService } from '../../../core/services/agents.service';
import { SkillsService } from '../../../core/services/skills.service';
import { WorkflowsService } from '../../../core/services/workflows.service';
import { ExecutionsService } from '../../../core/services/executions.service';
@Component({ selector: 'app-dashboard', standalone: false, templateUrl: './dashboard.html', styleUrl: './dashboard.scss' })
export class Dashboard implements OnInit {
  stats = { agents: 0, skills: 0, workflows: 0, executions: 0 };
  constructor(private agents: AgentsService, private skills: SkillsService, private workflows: WorkflowsService, private executions: ExecutionsService) {}
  ngOnInit() {
    this.agents.getAll().subscribe(d => this.stats.agents = d.length);
    this.skills.getAll().subscribe(d => this.stats.skills = d.length);
    this.workflows.getAll().subscribe(d => this.stats.workflows = d.length);
    this.executions.getAll().subscribe(d => this.stats.executions = d.length);
  }
}
