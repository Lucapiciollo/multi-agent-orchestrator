import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowsService } from '../../../core/services/workflows.service';
import { ExecutionsService } from '../../../core/services/executions.service';
import { ProvidersService } from '../../../core/services/providers.service';
import { WorkspaceService, InputFile, RoutingRule } from '../../../core/services/workspace.service';

export type RunMode = 'single' | 'parallel' | 'sequential';

interface SeqState { step: number; total: number; execId: string; done: boolean; error?: string; }

@Component({ selector: 'app-workflows-list', standalone: false, templateUrl: './workflows-list.html', styleUrl: './workflows-list.scss' })
export class WorkflowsList implements OnInit, OnDestroy {
  items: any[] = []; loading = true; error = '';
  running: Record<string, boolean> = {};
  inputFiles: InputFile[] = [];
  uploading = false;
  uploadError = '';
  routingRules: RoutingRule[] = [];

  // Smart drop state — la drop zone esegue SOLO l'upload, mai il run automatico.
  isDragOver = false;
  smartUploading = false;
  smartUploadedName: string | null = null;
  smartError = '';
  fileRunning: Record<string, boolean> = {};
  // Workflow scelto manualmente per ciascun file caricato (chiave = nome file).
  // Se vuoto ('') l'orchestratore decide da solo in base a workspace/routing.json
  // (rilevamento automatico da estensione) al momento in cui si preme "Esegui".
  fileWorkflowSelection: Record<string, string> = {};

  @ViewChild('smartFileInput') smartFileInputRef!: ElementRef<HTMLInputElement>;

  // ── Run config ─────────────────────────────────────────────────────────
  providers: any[] = [];
  selectedProvider = 'copilot';
  runMode: RunMode = 'single';
  runCount = 3;

  // ── Sequential tracking ─────────────────────────────────────────────────
  seqState: Record<string, SeqState | null> = {};
  private pollTimers: Record<string, any> = {};

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private svc: WorkflowsService,
    private executions: ExecutionsService,
    private providersSvc: ProvidersService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private workspace: WorkspaceService
  ) {}

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
    this.loadInputFiles();
    this.loadRoutingRules();
    this.providersSvc.getStatus().subscribe({
      next: p => this.zone.run(() => { this.providers = p; this.cdr.detectChanges(); }),
      error: () => {}
    });
  }

  ngOnDestroy() {
    Object.values(this.pollTimers).forEach(t => clearInterval(t));
  }

  // ── Run dispatcher ──────────────────────────────────────────────────────
  run(workflowId: string) {
    if (this.runMode === 'single')     this.runSingle(workflowId);
    else if (this.runMode === 'parallel')  this.runParallel(workflowId);
    else if (this.runMode === 'sequential') this.runSequential(workflowId);
  }

  private runSingle(workflowId: string) {
    this.zone.run(() => { this.running[workflowId] = true; this.cdr.detectChanges(); });
    this.executions.start({ workflowId, providerOverride: this.selectedProvider }).subscribe({
      next: exec => this.zone.run(() => {
        this.running[workflowId] = false;
        this.cdr.detectChanges();
        this.router.navigate(['/executions', exec.id]);
      }),
      error: e => this.zone.run(() => {
        this.running[workflowId] = false;
        this.error = `Avvio fallito: ${e.message}`;
        this.cdr.detectChanges();
      })
    });
  }

  private runParallel(workflowId: string) {
    this.zone.run(() => { this.running[workflowId] = true; this.cdr.detectChanges(); });
    let started = 0;
    for (let i = 0; i < this.runCount; i++) {
      this.executions.start({ workflowId, providerOverride: this.selectedProvider }).subscribe({
        next: () => {
          started++;
          if (started === this.runCount) {
            this.zone.run(() => {
              this.running[workflowId] = false;
              this.cdr.detectChanges();
              this.router.navigate(['/executions']);
            });
          }
        },
        error: e => this.zone.run(() => {
          this.running[workflowId] = false;
          this.error = `Avvio parallelo fallito: ${e.message}`;
          this.cdr.detectChanges();
        })
      });
    }
  }

  private runSequential(workflowId: string) {
    this.zone.run(() => {
      this.seqState[workflowId] = { step: 0, total: this.runCount, execId: '', done: false };
      this.running[workflowId] = true;
      this.cdr.detectChanges();
    });
    this.startNextSeq(workflowId, this.runCount);
  }

  private startNextSeq(workflowId: string, remaining: number) {
    if (remaining === 0) {
      this.zone.run(() => {
        if (this.seqState[workflowId]) this.seqState[workflowId]!.done = true;
        this.running[workflowId] = false;
        this.cdr.detectChanges();
        this.router.navigate(['/executions']);
      });
      return;
    }
    this.executions.start({ workflowId, providerOverride: this.selectedProvider }).subscribe({
      next: exec => {
        this.zone.run(() => {
          const st = this.seqState[workflowId];
          if (st) { st.step = this.runCount - remaining + 1; st.execId = exec.id; }
          this.cdr.detectChanges();
        });
        this.pollUntilDone(exec.id, () => this.startNextSeq(workflowId, remaining - 1));
      },
      error: e => this.zone.run(() => {
        const st = this.seqState[workflowId];
        if (st) { st.error = e.message; st.done = true; }
        this.running[workflowId] = false;
        this.cdr.detectChanges();
      })
    });
  }

  private pollUntilDone(execId: string, onDone: () => void) {
    const key = execId;
    this.pollTimers[key] = setInterval(() => {
      this.executions.getById(execId).subscribe({
        next: exec => {
          if (['completed', 'failed', 'cancelled'].includes(exec.status)) {
            clearInterval(this.pollTimers[key]);
            delete this.pollTimers[key];
            onDone();
          }
        },
        error: () => { clearInterval(this.pollTimers[key]); onDone(); }
      });
    }, 4000);
  }

  runLabel(workflowId: string): string {
    const st = this.seqState[workflowId];
    if (st && !st.done) return `${st.step}/${st.total}`;
    if (this.running[workflowId]) return 'Avvio...';
    if (this.runMode === 'parallel')    return `Run ×${this.runCount}`;
    if (this.runMode === 'sequential')  return `Run ×${this.runCount} →`;
    return 'Run';
  }

  isRunning(workflowId: string): boolean {
    return this.running[workflowId] || (!!this.seqState[workflowId] && !this.seqState[workflowId]!.done);
  }

  // ── Input files ──────────────────────────────────────────────────────────
  loadInputFiles() {
    this.workspace.listInputFiles().subscribe({
      next: files => this.zone.run(() => { this.inputFiles = files; this.cdr.detectChanges(); }),
      error: () => {}
    });
  }

  loadRoutingRules() {
    this.workspace.getRoutingRules().subscribe({
      next: r => this.zone.run(() => { this.routingRules = r.rules; this.cdr.detectChanges(); }),
      error: () => {}
    });
  }

  // ── Smart Drop ───────────────────────────────────────────────────────────
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver = true; }
  onDragLeave() { this.isDragOver = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files?.length) this.uploadViaSmartZone(files[0]);
  }

  onSmartFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.uploadViaSmartZone(input.files[0]); input.value = ''; }
  }

  openSmartPicker() { this.smartFileInputRef.nativeElement.click(); }

  detectRule(file: { name: string; type?: string }): RoutingRule | null {
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    return this.routingRules.find(r =>
      r.match.extensions.includes(ext) || (file.type && r.match.mimeTypes.includes(file.type))
    ) ?? null;
  }

  // Il workflow effettivo per un file caricato: quello scelto manualmente nel
  // selettore per riga, oppure — se lasciato su "Automatico" — quello rilevato
  // da workspace/routing.json in base all'estensione.
  resolvedWorkflowId(file: InputFile): string | null {
    return this.fileWorkflowSelection[file.name] || this.detectRule(file)?.workflowId || null;
  }

  canRunFile(file: InputFile): boolean {
    return !!this.resolvedWorkflowId(file);
  }

  // Avvio rapido: imposta il workflow e avvia subito
  quickRun(file: InputFile, workflowId: string) {
    this.fileWorkflowSelection[file.name] = workflowId;
    this.cdr.detectChanges();
    this.runInputFile(file);
  }

  runInputFile(file: InputFile) {
    const workflowId = this.resolvedWorkflowId(file);
    if (!workflowId) return;
    this.fileRunning[file.name] = true;
    this.cdr.detectChanges();
    // Passa inputFile in modo che il server usi ESATTAMENTE questo file
    // e non auto-rilevi il più recente nella directory.
    this.executions.start({ workflowId, inputFile: file.name }).subscribe({
      next: exec => this.zone.run(() => {
        this.fileRunning[file.name] = false;
        this.cdr.detectChanges();
        this.router.navigate(['/executions', exec.id]);
      }),
      error: (e: any) => this.zone.run(() => {
        this.fileRunning[file.name] = false;
        this.error = `Avvio fallito: ${e.message}`;
        this.cdr.detectChanges();
      })
    });
  }

  // Carica il file nella cartella workspace/input SENZA avviare alcuna esecuzione.
  // La scelta del workflow e l'avvio avvengono dopo, dall'elenco "File di input".
  private uploadViaSmartZone(file: File) {
    this.smartUploadedName = null;
    this.smartError = '';
    this.smartUploading = true;
    this.cdr.detectChanges();
    this.workspace.uploadFile(file).subscribe({
      next: result => this.zone.run(() => {
        this.smartUploading = false;
        this.smartUploadedName = result.name;
        this.loadInputFiles();
        this.cdr.detectChanges();
      }),
      error: (e: any) => this.zone.run(() => {
        this.smartUploading = false;
        this.smartError = e.error?.message ?? e.message ?? 'Errore upload';
        this.cdr.detectChanges();
      })
    });
  }

  openFilePicker() { this.fileInputRef.nativeElement.click(); }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    this.uploading = true; this.uploadError = '';
    let pending = files.length;
    files.forEach(f => {
      this.workspace.uploadFile(f).subscribe({
        next: () => { pending--; if (pending === 0) { this.uploading = false; this.loadInputFiles(); this.cdr.detectChanges(); } },
        error: (e) => { pending--; this.uploadError = e.message; this.uploading = false; this.cdr.detectChanges(); }
      });
    });
  }

  deleteInputFile(name: string) {
    this.workspace.deleteFile(name).subscribe({
      next: () => this.zone.run(() => { this.loadInputFiles(); }),
      error: () => {}
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  isProviderHealthy(id: string): boolean {
    return this.providers.find((p: any) => p.id === id)?.health === 'healthy';
  }

  taskTooltip(item: any): string {
    if (!item.tasks?.length) return 'Nessun task';
    return item.tasks.map((t: any, i: number) => `${i + 1}. ${t.title || t.id}`).join('\n');
  }

  // ── Step expand/run ────────────────────────────────────────────────────
  expandedWorkflows = new Set<string>();

  toggleExpand(workflowId: string) {
    if (this.expandedWorkflows.has(workflowId)) this.expandedWorkflows.delete(workflowId);
    else this.expandedWorkflows.add(workflowId);
    this.cdr.detectChanges();
  }

  stepRunning: Record<string, boolean> = {};

  runStep(workflowId: string, taskId: string) {
    const key = `${workflowId}::${taskId}`;
    if (this.stepRunning[key]) return;
    this.stepRunning[key] = true;
    this.cdr.detectChanges();
    this.executions.start({ workflowId, taskId }).subscribe({
      next: exec => this.zone.run(() => {
        this.stepRunning[key] = false;
        this.router.navigate(['/executions', exec.id]);
      }),
      error: () => this.zone.run(() => { this.stepRunning[key] = false; this.cdr.detectChanges(); })
    });
  }

  depLabel(deps: string[]): string {
    if (!deps?.length) return '—';
    return deps.join(', ');
  }

  // ── Step description (spiega cosa fa lo step) ───────────────────────────
  expandedTaskDesc = new Set<string>();

  toggleTaskDesc(workflowId: string, taskId: string) {
    const key = `${workflowId}::${taskId}`;
    if (this.expandedTaskDesc.has(key)) this.expandedTaskDesc.delete(key);
    else this.expandedTaskDesc.add(key);
    this.cdr.detectChanges();
  }

  isTaskDescExpanded(workflowId: string, taskId: string): boolean {
    return this.expandedTaskDesc.has(`${workflowId}::${taskId}`);
  }

  taskDescTooltip(task: any): string {
    return task?.description || 'Nessuna descrizione disponibile';
  }
}
