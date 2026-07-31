import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { interval, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AgentsService }    from "../../../core/services/agents.service";
import { SkillsService }    from "../../../core/services/skills.service";
import { WorkflowsService } from "../../../core/services/workflows.service";
import { ExecutionsService } from "../../../core/services/executions.service";

@Component({ selector: "app-dashboard", standalone: false, templateUrl: "./dashboard.html", styleUrl: "./dashboard.scss" })
export class Dashboard implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats      = { agents: 0, skills: 0, workflows: 0, executions: 0, running: 0, failed: 0 };
  loading    = true;
  workflows: any[] = [];
  agents:    any[] = [];
  skills:    any[] = [];
  executions: any[] = [];
  launching: Record<string, boolean> = {};

  statusColor(s: string) {
    return ({ running:"amber", queued:"amber", completed:"green", failed:"red", cancelled:"red", pending:"gray", blocked:"orange" } as any)[s] ?? "gray";
  }
  statusIcon(s: string) {
    return ({ running:"radio_button_checked", queued:"pending", completed:"check_circle", failed:"cancel", cancelled:"block", pending:"circle", blocked:"warning" } as any)[s] ?? "circle";
  }
  progressPct(ex: any): number {
    if (!ex.totalTasks) return 0;
    return Math.round(((ex.completedTasks ?? 0) / ex.totalTasks) * 100);
  }
  elapsedLabel(ex: any): string {
    if (!ex.startedAt) return "";
    const s = Math.floor((Date.now() - new Date(ex.startedAt).getTime()) / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  }
  runningExecs() { return this.executions.filter((e: any) => e.status === "running" || e.status === "queued"); }
  recentExecs()  { return this.executions.slice(0, 8); }

  constructor(
    private agentsSvc:    AgentsService,
    private skillsSvc:    SkillsService,
    private workflowsSvc: WorkflowsService,
    private execSvc:      ExecutionsService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAll();
    interval(3000).pipe(takeUntil(this.destroy$)).subscribe(() => this.loadExecutions());
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadAll() {
    this.agentsSvc.getAll().subscribe({ next: d => this.zone.run(() => { this.agents = d; this.stats.agents = d.length; this.cdr.detectChanges(); }) });
    this.skillsSvc.getAll().subscribe({ next: d => this.zone.run(() => { this.skills = d; this.stats.skills = d.length; this.cdr.detectChanges(); }) });
    this.workflowsSvc.getAll().subscribe({ next: d => this.zone.run(() => { this.workflows = d; this.stats.workflows = d.length; this.loading = false; this.cdr.detectChanges(); }) });
    this.loadExecutions();
  }

  loadExecutions() {
    this.execSvc.getAll().subscribe({ next: d => this.zone.run(() => {
      this.executions = d;
      this.stats.executions = d.length;
      this.stats.running = d.filter((e: any) => e.status === "running").length;
      this.stats.failed  = d.filter((e: any) => e.status === "failed").length;
      this.cdr.detectChanges();
    })});
  }

  launch(workflowId: string) {
    if (this.launching[workflowId]) return;
    this.launching[workflowId] = true;
    this.execSvc.start({ workflowId }).subscribe({
      next: (exec: any) => this.zone.run(() => { this.launching[workflowId] = false; this.router.navigate(["/executions", exec.id]); }),
      error: () => this.zone.run(() => { this.launching[workflowId] = false; this.cdr.detectChanges(); })
    });
  }

  viewExec(id: string)   { this.router.navigate(["/executions", id]); }
  cancelExec(id: string) { this.execSvc.cancel(id).subscribe({ next: () => this.zone.run(() => this.loadExecutions()) }); }
}