import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef, NgZone, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ExecutionsService } from '../../../core/services/executions.service';

@Component({ selector: 'app-execution-detail', standalone: false, templateUrl: './execution-detail.html', styleUrl: './execution-detail.scss' })
export class ExecutionDetail implements OnInit, AfterViewChecked, OnDestroy {
  execution: any = null;
  loading = true;
  logs: any[] = [];
  expandedTasks = new Set<string>();
  retryingTaskId: string | null = null;
  retryErrors = new Map<string, string>();
  elapsedStr = '';
  taskLogMap = new Map<string, any[]>();
  workspaceFiles: any[] = [];
  workspaceLoading = false;

  // ── Gate: attesa scelta utente (es. sezione di menu da angularizzare) ──
  gateInfo: { gateLabel: string; options: { index: number; label: string }[] } | null = null;
  gateLoading = false;
  gateSelectedOption: string | null = null;
  gateCustomSection = '';
  gateSubmitting = false;
  gateError: string | null = null;

  private startTime: number | null = null;
  private pendingScroll = false;
  private forceScroll = false;
  private isFirstLoad = true;
  @ViewChildren(CdkVirtualScrollViewport) logViewports!: QueryList<CdkVirtualScrollViewport>;
  private destroy$ = new Subject<void>();
  private pollTimer: any;
  private elapsedTimer: any;

  // ── helpers ────────────────────────────────────────────────────────────
  trackLog(_: number, l: any): string { return l.timestamp + l.taskId + l.type; }

  private rebuildTaskLogMap(): void {
    // Create NEW arrays each rebuild — CDK virtual scroll detects new references
    const next = new Map<string, any[]>();
    for (const log of this.logs) {
      if (!log.taskId) continue;
      if (!next.has(log.taskId)) next.set(log.taskId, []);
      next.get(log.taskId)!.push(log);
    }
    // Keep the previous array reference for tasks whose log count hasn't changed
    // (e.g. completed tasks on a poll refresh) so cdkVirtualFor doesn't re-render
    // viewports that have no new content — only actively growing (running) tasks refresh.
    for (const [taskId, arr] of next) {
      const prev = this.taskLogMap.get(taskId);
      if (prev && prev.length === arr.length) {
        next.set(taskId, prev);
      }
    }
    this.taskLogMap = next;
  }

  taskLogs(taskId: string): any[] {
    return this.taskLogMap.get(taskId) ?? [];
  }

  toggleExpand(taskId: string) {
    if (this.expandedTasks.has(taskId)) this.expandedTasks.delete(taskId);
    else { this.expandedTasks.add(taskId); this.scrollLogsToBottom(true); }
    this.cdr.detectChanges();
  }

  private scrollLogsToBottom(force = false): void {
    this.pendingScroll = true;
    if (force) this.forceScroll = true;
  }

  private isNearBottom(vp: CdkVirtualScrollViewport): boolean {
    return vp.measureScrollOffset('bottom') < 150;
  }

  ngAfterViewChecked(): void {
    if (this.pendingScroll) {
      this.pendingScroll = false;
      const force = this.forceScroll;
      this.forceScroll = false;
      setTimeout(() => {
        this.logViewports?.forEach(vp => {
          if (force || this.isNearBottom(vp)) vp.scrollToIndex(99999, 'instant');
        });
      }, 50);
    }
  }

  completedCount(): number {
    return (this.execution?.tasks ?? []).filter((t: any) => t.status === 'completed').length;
  }

  progressPct(): number {
    const tasks = this.execution?.tasks ?? [];
    if (!tasks.length) return 0;
    return (this.completedCount() / tasks.length) * 100;
  }

  elapsedMs(): number | null {
    if (!this.startTime) return null;
    const end = this.execution?.completedAt ? new Date(this.execution.completedAt).getTime() : Date.now();
    return end - this.startTime;
  }

  private updateElapsed() {
    const ms = this.elapsedMs();
    this.elapsedStr = ms != null ? this.formatMs(ms) : '';
  }

  formatMs(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }

  taskDuration(task: any): string | null {
    if (!task.startedAt || !task.completedAt) return null;
    const ms = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
    return this.formatMs(ms);
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
    this.svc.streamEvents(id, this.destroy$).subscribe({
      next: event => this.zone.run(() => {
        this.logs.push(event);
        this.rebuildTaskLogMap();
        this.scrollLogsToBottom(true);
        if (this.execution?.tasks) {
          const t = this.execution.tasks.find((x: any) => x.id === event.taskId);
          if (t) {
            if (event.type === 'task.started')   { t.status = 'running'; t.startedAt = event.timestamp; this.expandedTasks.add(t.id); }
            if (event.type === 'task.completed') { t.status = 'completed'; t.completedAt = event.timestamp; }
            if (event.type === 'task.failed')    { t.status = 'failed'; t.completedAt = event.timestamp; }
          }
        }
        if (event.type === 'execution.completed' && this.execution) { this.execution.status = 'completed'; this.execution.completedAt = event.timestamp; }
        if (event.type === 'execution.failed'    && this.execution) { this.execution.status = 'failed'; this.execution.completedAt = event.timestamp; }
        if (event.type === 'execution.awaiting-input' && this.execution) {
          this.execution.status = 'awaiting_input';
          if (!this.gateInfo && !this.gateLoading) this.loadGateInfo(this.execution.id);
        }
        if (event.type === 'execution.resumed' && this.execution) { this.execution.status = 'running'; this.gateInfo = null; }
        this.cdr.detectChanges();
      })
    });
  }

  loadExecution(id: string) {
    this.svc.getById(id).subscribe({
      next: d => this.zone.run(() => {
        this.execution = d;
        this.loading = false;
        // Replace log list from authoritative API response (includes all persisted events)
        if (d.logs?.length) {
          const grew = d.logs.length !== this.logs.length;
          this.logs = d.logs;
          this.rebuildTaskLogMap();
          // Always snap to the end of the log when new content arrives (first load
          // or growth). Tasks whose log count hasn't changed keep the same array
          // reference (see rebuildTaskLogMap) so their viewport isn't touched at all.
          if (this.isFirstLoad || grew) this.scrollLogsToBottom(true);
        }
        this.isFirstLoad = false;
        if (d.startedAt) {
          this.startTime = new Date(d.startedAt).getTime();
          clearInterval(this.elapsedTimer);
          if (d.status === 'running' || d.status === 'pending') {
            this.elapsedTimer = setInterval(() => { this.updateElapsed(); this.cdr.detectChanges(); }, 1000);
          }
          this.updateElapsed();
        }
        if (d.tasks) {
          for (const t of d.tasks) {
            // Auto-expand running and failed tasks
            if (t.status === 'running' || t.status === 'failed') this.expandedTasks.add(t.id);
          }
          // Also expand first task if everything is pending (just started)
          if (this.expandedTasks.size === 0 && d.tasks.length > 0) this.expandedTasks.add(d.tasks[0].id);
        }
        if (d.status === 'awaiting_input' && !this.gateInfo && !this.gateLoading) {
          this.loadGateInfo(id);
        }
        this.cdr.detectChanges();
        clearInterval(this.pollTimer);
        if (d.status === 'running' || d.status === 'pending' || d.status === 'awaiting_input') {
          this.pollTimer = setInterval(() => this.loadExecution(id), 4000);
        }
      }),
      error: () => this.zone.run(() => { this.loading = false; this.cdr.detectChanges(); })
    });
  }

  loadGateInfo(execId: string) {
    this.gateLoading = true;
    this.gateError = null;
    this.svc.getGate(execId).subscribe({
      next: g => this.zone.run(() => {
        this.gateInfo = g;
        this.gateLoading = false;
        this.cdr.detectChanges();
      }),
      error: () => this.zone.run(() => { this.gateLoading = false; this.cdr.detectChanges(); })
    });
  }

  submitSection() {
    const section = (this.gateSelectedOption === '__custom__' ? this.gateCustomSection : this.gateSelectedOption)?.trim();
    if (!this.execution?.id || !section || this.gateSubmitting) return;
    this.gateSubmitting = true;
    this.gateError = null;
    this.svc.selectSection(this.execution.id, section).subscribe({
      next: () => this.zone.run(() => {
        this.gateSubmitting = false;
        this.gateInfo = null;
        this.execution.status = 'running';
        if (!this.pollTimer) this.pollTimer = setInterval(() => this.loadExecution(this.execution.id), 4000);
        this.cdr.detectChanges();
      }),
      error: (err) => this.zone.run(() => {
        this.gateSubmitting = false;
        this.gateError = err?.message || 'Impossibile confermare la scelta';
        this.cdr.detectChanges();
      })
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

  retryTask(task: any) {
    if (!this.execution?.id || this.retryingTaskId === task.id) return;
    this.retryingTaskId = task.id;
    this.retryErrors.delete(task.id);
    this.cdr.detectChanges();
    this.svc.retryTask(this.execution.id, task.id).subscribe({
      next: () => this.zone.run(() => {
        task.status = 'pending';
        if (this.execution) this.execution.status = 'running';
        // Restart poll if stopped
        if (!this.pollTimer) {
          this.pollTimer = setInterval(() => this.loadExecution(this.execution.id), 4000);
        }
        this.retryingTaskId = null;
        this.cdr.detectChanges();
      }),
      error: (err) => this.zone.run(() => {
        this.retryingTaskId = null;
        this.retryErrors.set(task.id, err?.message || 'Impossibile riprovare il task');
        this.cdr.detectChanges();
      })
    });
  }

  loadWorkspaceFiles() {
    if (this.workspaceLoading || this.workspaceFiles.length) return;
    this.workspaceLoading = true;
    const runSlug = this.execution?.runSlug;
    this.svc.getWorkspaceOutput(runSlug).subscribe({
      next: files => this.zone.run(() => {
        this.workspaceFiles = files;
        this.workspaceLoading = false;
        this.cdr.detectChanges();
      }),
      error: () => this.zone.run(() => { this.workspaceLoading = false; this.cdr.detectChanges(); })
    });
  }

  back() { this.router.navigate(['/executions']); }

  ngOnDestroy() {
    this.destroy$.next(); this.destroy$.complete();
    clearInterval(this.pollTimer);
    clearInterval(this.elapsedTimer);
  }
}

