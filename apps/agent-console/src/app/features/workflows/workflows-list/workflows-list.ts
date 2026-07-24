import { Component, OnInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowsService } from '../../../core/services/workflows.service';
import { ExecutionsService } from '../../../core/services/executions.service';
import { WorkspaceService, InputFile } from '../../../core/services/workspace.service';

@Component({ selector: 'app-workflows-list', standalone: false, templateUrl: './workflows-list.html', styleUrl: './workflows-list.scss' })
export class WorkflowsList implements OnInit {
  items: any[] = []; loading = true; error = '';
  running: Record<string, boolean> = {};
  inputFiles: InputFile[] = [];
  uploading = false;
  uploadError = '';
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private svc: WorkflowsService,
    private executions: ExecutionsService,
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
  }

  loadInputFiles() {
    this.workspace.listInputFiles().subscribe({
      next: files => this.zone.run(() => { this.inputFiles = files; this.cdr.detectChanges(); }),
      error: () => {}
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

  run(workflowId: string) {
    this.zone.run(() => { this.running[workflowId] = true; this.cdr.detectChanges(); });
    this.executions.start({ workflowId }).subscribe({
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

  taskTooltip(item: any): string {
    if (!item.tasks?.length) return 'Nessun task';
    return item.tasks.map((t: any, i: number) => `${i + 1}. ${t.title || t.id}`).join('\n');
  }
}
