import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionsService } from '../../../core/services/executions.service';

@Component({ selector: 'app-executions-list', standalone: false, templateUrl: './executions-list.html', styleUrl: './executions-list.scss' })
export class ExecutionsList implements OnInit, OnDestroy {
  items: any[] = []; loading = true; error = '';
  wsFiles: any[] = []; wsLoading = false; wsExpanded = false;
  private timer: any;

  constructor(private svc: ExecutionsService, private router: Router, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() { this.load(); this.loadWs(); }
  ngOnDestroy() { clearInterval(this.timer); }

  load() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => {
        this.items = d; this.loading = false; this.cdr.detectChanges();
        // Auto-refresh se ci sono esecuzioni in corso
        clearInterval(this.timer);
        if (d.some((x: any) => x.status === 'running')) {
          this.timer = setInterval(() => this.load(), 3000);
        }
      }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
  }

  loadWs() {
    this.wsLoading = true;
    this.svc.getWorkspaceOutput().subscribe({
      next: files => this.zone.run(() => { this.wsFiles = files; this.wsLoading = false; this.cdr.detectChanges(); }),
      error: () => this.zone.run(() => { this.wsLoading = false; this.cdr.detectChanges(); })
    });
  }

  open(id: string) { this.router.navigate(['/executions', id]); }
}
