// components/clienti-pagination/clienti-pagination.component.ts — lib-dashboard
// Presentazionale (bottoni nativi, NON mat-paginator — per esplicita
// decisione in architecture-report.md §COMPONENTS PROPOSED riga 9, motivata
// in §RISKS/AMBIGUITIES nota 4: il pattern sorgente "‹ 1 2 3 4 … 321 ›" non è
// riproducibile fedelmente col template di default di mat-paginator).
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type PageItem = number | '...';

@Component({
  standalone: false,
  selector: 'lib-dashboard-clienti-pagination',
  templateUrl: './clienti-pagination.component.html',
  styleUrls: ['./clienti-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientiPaginationComponent {
  @Input() totalCount = 0;
  @Input() page = 1;
  // Il sorgente (riga 38) mostra 4 righe per pagina ("Mostrati 1–4 di 1284").
  @Input() pageSize = 4;

  // T11 (nessun handler nel sorgente): paginazione prevista come setPage(n).
  @Output() readonly pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get rangeStart(): number {
    return this.totalCount === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  get pageItems(): PageItem[] {
    const total = this.totalPages;
    const current = this.page;

    if (total <= 6) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current, current + 1, '...', total];
  }

  goTo(target: PageItem): void {
    if (target === '...' || target === this.page) {
      return;
    }
    this.pageChange.emit(target);
  }

  prev(): void {
    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }
  }

  next(): void {
    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }
}
