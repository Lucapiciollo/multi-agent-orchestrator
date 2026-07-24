import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AgentsService } from '../../../core/services/agents.service';
@Component({ selector: 'app-agents-list', standalone: false, templateUrl: './agents-list.html', styleUrl: './agents-list.scss' })
export class AgentsList implements OnInit {
  items: any[] = []; loading = true; error = '';
  constructor(private svc: AgentsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}
  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
  }
}
