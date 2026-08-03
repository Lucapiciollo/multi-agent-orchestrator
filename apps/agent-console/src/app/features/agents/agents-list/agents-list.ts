import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AgentsService } from '../../../core/services/agents.service';
import { SkillsService } from '../../../core/services/skills.service';

@Component({ selector: 'app-agents-list', standalone: false, templateUrl: './agents-list.html', styleUrl: './agents-list.scss' })
export class AgentsList implements OnInit {
  items: any[] = [];
  allSkills: any[] = [];
  loading = true;
  error = '';
  expandedAgent: string | null = null;
  agentSkillState: Record<string, any[]> = {};   // agentId → [{id,name,active}]
  savingAgent: string | null = null;

  constructor(
    private svc: AgentsService,
    private skillsSvc: SkillsService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
    this.skillsSvc.getAll().subscribe({
      next: skills => this.zone.run(() => { this.allSkills = skills; this.cdr.detectChanges(); }),
      error: () => {}
    });
  }

  toggleExpand(agentId: string) {
    if (this.expandedAgent === agentId) { this.expandedAgent = null; return; }
    this.expandedAgent = agentId;
    if (!this.agentSkillState[agentId]) { this.loadSkillsForAgent(agentId); }
  }

  loadSkillsForAgent(agentId: string) {
    this.svc.getAgentSkills(agentId).subscribe({
      next: (r: any) => this.zone.run(() => {
        this.agentSkillState[agentId] = r.data;
        this.cdr.detectChanges();
      }),
      error: () => {}
    });
  }

  toggleSkill(agentId: string, skillId: string) {
    const skills = this.agentSkillState[agentId] ?? [];
    const idx = skills.findIndex((s: any) => s.id === skillId);
    if (idx >= 0) { skills[idx] = { ...skills[idx], active: !skills[idx].active }; }
    this.agentSkillState[agentId] = [...skills];
    this.cdr.detectChanges();
  }

  saveSkills(agentId: string) {
    const active = (this.agentSkillState[agentId] ?? [])
      .filter((s: any) => s.active).map((s: any) => s.id);
    this.savingAgent = agentId;
    this.svc.setAgentSkills(agentId, active).subscribe({
      next: () => this.zone.run(() => {
        this.savingAgent = null;
        // Aggiorna la lista agente con le nuove skills
        const ag = this.items.find(i => i.id === agentId);
        if (ag) ag.skills = active;
        this.cdr.detectChanges();
      }),
      error: () => this.zone.run(() => { this.savingAgent = null; this.cdr.detectChanges(); })
    });
  }

  resetSkills(agentId: string) {
    this.svc.resetAgentSkills(agentId).subscribe({
      next: () => this.zone.run(() => {
        delete this.agentSkillState[agentId];
        this.loadSkillsForAgent(agentId);
        this.cdr.detectChanges();
      }),
      error: () => {}
    });
  }
}
