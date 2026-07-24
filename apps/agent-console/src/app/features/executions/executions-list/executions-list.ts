import { Component, OnInit } from '@angular/core';
import { ExecutionsService } from '../../../core/services/executions.service';
@Component({ selector: 'app-executions-list', standalone: false, templateUrl: './executions-list.html', styleUrl: './executions-list.scss' })
export class ExecutionsList implements OnInit {
  executions: any[] = []; loading = true;
  constructor(private svc: ExecutionsService) {}
  ngOnInit() { this.svc.getAll().subscribe({ next: d => { this.executions = d; this.loading = false; }, error: () => this.loading = false }); }
}
