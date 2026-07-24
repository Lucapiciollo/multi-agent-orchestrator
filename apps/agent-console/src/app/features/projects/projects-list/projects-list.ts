import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ProjectsService } from '../../../core/services/projects.service';
@Component({ selector: 'app-projects-list', standalone: false, templateUrl: './projects-list.html', styleUrl: './projects-list.scss' })
export class ProjectsList implements OnInit {
  items: any[] = []; loading = true; error = '';
  constructor(private svc: ProjectsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}
  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
  }
}
