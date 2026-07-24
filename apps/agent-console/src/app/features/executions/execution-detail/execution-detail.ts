import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExecutionsService } from '../../../core/services/executions.service';
@Component({ selector: 'app-execution-detail', standalone: false, templateUrl: './execution-detail.html', styleUrl: './execution-detail.scss' })
export class ExecutionDetail implements OnInit {
  execution: any = null; loading = true;
  constructor(private svc: ExecutionsService, private route: ActivatedRoute) {}
  ngOnInit() { const id = this.route.snapshot.paramMap.get('id')!; this.svc.getById(id).subscribe({ next: d => { this.execution = d; this.loading = false; }, error: () => this.loading = false }); }
}
