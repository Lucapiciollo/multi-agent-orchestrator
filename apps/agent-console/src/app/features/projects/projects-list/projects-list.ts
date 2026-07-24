import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../../../core/services/projects.service';
@Component({ selector: 'app-projects-list', standalone: false, templateUrl: './projects-list.html', styleUrl: './projects-list.scss' })
export class ProjectsList implements OnInit {
  projects: any[] = []; loading = true;
  constructor(private svc: ProjectsService) {}
  ngOnInit() { this.svc.getAll().subscribe({ next: d => { this.projects = d; this.loading = false; }, error: () => this.loading = false }); }
}
