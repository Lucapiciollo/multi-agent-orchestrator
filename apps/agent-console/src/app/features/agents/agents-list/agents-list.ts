import { Component, OnInit } from '@angular/core';
import { AgentsService } from '../../../core/services/agents.service';
@Component({ selector: 'app-agents-list', standalone: false, templateUrl: './agents-list.html', styleUrl: './agents-list.scss' })
export class AgentsList implements OnInit {
  agents: any[] = []; loading = true; error = '';
  constructor(private svc: AgentsService) {}
  ngOnInit() { this.svc.getAll().subscribe({ next: d => { this.agents = d; this.loading = false; }, error: e => { this.error = e.message; this.loading = false; } }); }
}
