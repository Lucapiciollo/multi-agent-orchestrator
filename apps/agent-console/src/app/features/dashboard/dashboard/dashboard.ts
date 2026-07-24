import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AgentsService } from '../../../core/services/agents.service';
import { SkillsService } from '../../../core/services/skills.service';
import { WorkflowsService } from '../../../core/services/workflows.service';
import { ExecutionsService } from '../../../core/services/executions.service';
@Component({ selector: 'app-dashboard', standalone: false, templateUrl: './dashboard.html', styleUrl: './dashboard.scss' })
export class Dashboard implements OnInit {
  stats = { agents: 0, skills: 0, workflows: 0, executions: 0 };
  loading = true;
  constructor(private agents: AgentsService, private skills: SkillsService, private workflows: WorkflowsService, private executions: ExecutionsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}
  ngOnInit() {
    let rem = 4; const done = () => { if(--rem===0) this.zone.run(()=>{ this.loading=false; this.cdr.detectChanges(); }); };
    this.agents.getAll().subscribe({ next: d => this.zone.run(()=>{ this.stats.agents=d.length; done(); }), error: ()=>done() });
    this.skills.getAll().subscribe({ next: d => this.zone.run(()=>{ this.stats.skills=d.length; done(); }), error: ()=>done() });
    this.workflows.getAll().subscribe({ next: d => this.zone.run(()=>{ this.stats.workflows=d.length; done(); }), error: ()=>done() });
    this.executions.getAll().subscribe({ next: d => this.zone.run(()=>{ this.stats.executions=d.length; done(); }), error: ()=>done() });
  }
}
