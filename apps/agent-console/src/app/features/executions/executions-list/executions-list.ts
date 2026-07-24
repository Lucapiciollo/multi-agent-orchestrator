import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ExecutionsService } from '../../../core/services/executions.service';

@Component({ selector: 'app-executions-list', standalone: false, templateUrl: './executions-list.html', styleUrl: './executions-list.scss' })
export class ExecutionsList implements OnInit, OnDestroy {
  items: any[] = []; loading = true; error = '';
  private timer: any;

  constructor(private svc: ExecutionsService, private router: Router, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() { this.load(); }
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

  open(id: string) { this.router.navigate(['/executions', id]); }
}
