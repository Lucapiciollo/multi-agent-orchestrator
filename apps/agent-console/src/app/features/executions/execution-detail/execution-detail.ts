import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ExecutionsService } from '../../../core/services/executions.service';

@Component({ selector: 'app-execution-detail', standalone: false, templateUrl: './execution-detail.html', styleUrl: './execution-detail.scss' })
export class ExecutionDetail implements OnInit, OnDestroy {
  execution: any = null;
  loading = true;
  logs: any[] = [];
  taskInputFiles: Record<string, string[]> = {};
  selectedTaskId: string | null = null;
  selectedTask: any = null;
  selectedTaskIndex = -1;
  private destroy$ = new Subject<void>();
  private pollTimer: any;

  selectTask(id: string): void {
    this.selectedTaskId = this.selectedTaskId === id ? null : id;
    this.updateSelectedTask();
  }

  stageLabel(title: string): string {
    const part = (title.split('—')[0] ?? title).trim();
    return part.length > 18 ? part.slice(0, 16) + '…' : part;
  }

  private updateSelectedTask(): void {
    const tasks: any[] = this.execution?.tasks ?? [];
    this.selectedTaskIndex = tasks.findIndex((t: any) => t.id === this.selectedTaskId);
    this.selectedTask = this.selectedTaskIndex >= 0 ? tasks[this.selectedTaskIndex] : null;
  }

  constructor(
    private svc: ExecutionsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadExecution(id);
    // Try SSE for live logs
    this.svc.streamEvents(id, this.destroy$).subscribe({
      next: event => this.zone.run(() => {
        this.logs.push(event);
        if (this.execution?.tasks) {
          const t = this.execution.tasks.find((x: any) => x.id === event.taskId);
          if (t) {
            if (event.type === 'task.started')   t.status = 'running';
            if (event.type === 'task.completed') t.status = 'completed';
            if (event.type === 'task.failed')    t.status = 'failed';
          }
        }
        if (event.type === 'execution.completed' && this.execution) this.execution.status = 'completed';
        if (event.type === 'execution.failed'    && this.execution) this.execution.status = 'failed';
        this.cdr.detectChanges();
      })
    });
  }

  loadExecution(id: string) {
    this.svc.getById(id).subscribe({
      next: d => this.zone.run(() => {
        this.execution = d;
        this.loading = false;
        // Populate input files from workflow task definitions
        if (d.tasks) {
          for (const t of d.tasks) {
            if (t.inputPaths?.length && !this.taskInputFiles[t.id]) {
              this.taskInputFiles[t.id] = t.inputPaths;
            }
          }
          // Auto-select running task, or first task if none selected
          if (!this.selectedTaskId) {
            const running = d.tasks.find((t: any) => t.status === 'running');
            this.selectedTaskId = running?.id ?? d.tasks[0]?.id ?? null;
          }
          this.updateSelectedTask();
        }
        this.cdr.detectChanges();
        clearInterval(this.pollTimer);
        if (d.status === 'running' || d.status === 'pending') {
          this.pollTimer = setInterval(() => this.loadExecution(id), 4000);
        }
      }),
      error: () => this.zone.run(() => { this.loading = false; this.cdr.detectChanges(); })
    });
  }

  cancel() {
    if (!this.execution?.id) return;
    this.svc.cancel(this.execution.id).subscribe({
      next: () => this.zone.run(() => {
        if (this.execution) this.execution.status = 'cancelled';
        clearInterval(this.pollTimer);
        this.cdr.detectChanges();
      })
    });
  }

  back() { this.router.navigate(['/executions']); }

  ngOnDestroy() {
    this.destroy$.next(); this.destroy$.complete();
    clearInterval(this.pollTimer);
  }

  taskIcon(status: string) {
    return { completed: 'check_circle', failed: 'cancel', running: 'pending', pending: 'radio_button_unchecked', cancelled: 'block' }[status] ?? 'radio_button_unchecked';
  }
}
