import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ProvidersService } from '../../../core/services/providers.service';
@Component({ selector: 'app-providers-list', standalone: false, templateUrl: './providers-list.html', styleUrl: './providers-list.scss' })
export class ProvidersList implements OnInit {
  items: any[] = []; loading = true; error = '';
  constructor(private svc: ProvidersService, private cdr: ChangeDetectorRef, private zone: NgZone) {}
  ngOnInit() {
    this.svc.getStatus().subscribe({
      next: d => this.zone.run(() => { this.items = d; this.loading = false; this.cdr.detectChanges(); }),
      error: e => this.zone.run(() => { this.error = e.message; this.loading = false; this.cdr.detectChanges(); })
    });
  }
}
