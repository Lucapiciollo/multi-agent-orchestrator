import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProvidersService } from '../../core/services/providers.service';

@Component({ selector: 'app-header', standalone: false, templateUrl: './header.component.html', styleUrls: ['./header.component.scss'] })
export class HeaderComponent implements OnInit {
  @Input() isDark = false;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleDark = new EventEmitter<void>();

  title = 'Dashboard';
  copilotStatus = 'checking...';
  ollamaStatus = 'checking...';
  copilotClass = 'status-unknown';
  ollamaClass = 'status-unknown';

  constructor(private router: Router, private providers: ProvidersService) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.title = this.getTitle();
    });
    this.refreshProviders();
    setInterval(() => this.refreshProviders(), 30_000);
  }

  private getTitle(): string {
    const map: Record<string, string> = {
      dashboard: 'Dashboard', agents: 'Agenti', skills: 'Skill',
      workflows: 'Workflow', executions: 'Esecuzioni', providers: 'Provider', projects: 'Progetti'
    };
    const seg = this.router.url.split('/')[1] ?? 'dashboard';
    return map[seg] ?? seg;
  }

  private refreshProviders(): void {
    this.providers.getStatus().subscribe({
      next: statuses => {
        for (const s of statuses) {
          const css = s.health === 'healthy' ? 'status-ok' : s.health === 'degraded' ? 'status-warn' : 'status-err';
          if (s.id === 'copilot') { this.copilotStatus = s.health; this.copilotClass = css; }
          if (s.id === 'ollama')  { this.ollamaStatus  = s.health; this.ollamaClass  = css; }
        }
      },
      error: () => { this.copilotClass = 'status-unknown'; this.ollamaClass = 'status-unknown'; }
    });
  }
}
