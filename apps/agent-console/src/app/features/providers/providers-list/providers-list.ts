import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../../../core/services/providers.service';
@Component({ selector: 'app-providers-list', standalone: false, templateUrl: './providers-list.html', styleUrl: './providers-list.scss' })
export class ProvidersList implements OnInit {
  providers: any[] = []; loading = true;
  constructor(private svc: ProvidersService) {}
  ngOnInit() { this.refresh(); setInterval(() => this.refresh(), 30000); }
  refresh() { this.svc.getStatus().subscribe({ next: d => { this.providers = d; this.loading = false; }, error: () => this.loading = false }); }
}
