import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProvidersService } from '../../core/services/providers.service';

@Component({ selector: 'app-header', standalone: false, templateUrl: './header.html', styleUrl: './header.scss' })
export class Header implements OnInit {
  @Input() isDark = false;
  @Output() toggleDark = new EventEmitter<void>();
  title = 'Dashboard';
  copilotOk = false; ollamaOk = false;

  constructor(private router: Router, private providers: ProvidersService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const seg = this.router.url.split('/')[1] ?? 'dashboard';
      const m: Record<string,string> = {dashboard:'Dashboard',agents:'Agenti',skills:'Skill',workflows:'Workflow',executions:'Esecuzioni',providers:'Provider',projects:'Progetti'};
      this.zone.run(() => { this.title = m[seg] ?? seg; this.cdr.detectChanges(); });
    });
    setTimeout(() => this.checkProviders(), 0);
    setInterval(() => this.checkProviders(), 30_000);
  }

  checkProviders() {
    this.providers.getStatus().subscribe({
      next: s => this.zone.run(() => {
        this.copilotOk = s.some(p => p.id==='copilot' && p.health==='healthy');
        this.ollamaOk = s.some(p => p.id==='ollama' && p.health==='healthy');
        this.cdr.detectChanges();
      }),
      error: () => {}
    });
  }
}
