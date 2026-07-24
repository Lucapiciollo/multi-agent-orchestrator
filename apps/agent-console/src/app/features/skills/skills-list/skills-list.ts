import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SkillsService } from '../../../core/services/skills.service';
@Component({ selector: 'app-skills-list', standalone: false, templateUrl: './skills-list.html', styleUrl: './skills-list.scss' })
export class SkillsList implements OnInit {
  items: any[] = []; loading = true; error = '';
  constructor(private svc: SkillsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}
  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
  }
}
