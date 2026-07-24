import { Component, OnInit } from '@angular/core';
import { WorkflowsService } from '../../../core/services/workflows.service';
import { ExecutionsService } from '../../../core/services/executions.service';
@Component({ selector: 'app-workflows-list', standalone: false, templateUrl: './workflows-list.html', styleUrl: './workflows-list.scss' })
export class WorkflowsList implements OnInit {
  workflows: any[] = []; loading = true;
  constructor(private svc: WorkflowsService, private exec: ExecutionsService) {}
  ngOnInit() { this.svc.getAll().subscribe({ next: d => { this.workflows = d; this.loading = false; }, error: () => this.loading = false }); }
  start(w: any) { this.exec.start({ workflowId: w.id }).subscribe({ next: e => alert('Avviato: ' + e.id), error: e => alert('Errore: ' + e.message) }); }
}
