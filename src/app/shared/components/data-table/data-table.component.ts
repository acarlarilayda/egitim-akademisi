import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableCellDirective } from './data-table-cell.directive';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  /** Satır nesnesindeki alan adı (örn. 'title', 'status'). */
  key: string;
  /** Başlıkta gösterilecek etiket. */
  label: string;
  /** Sıralanabilir mi? (varsayılan: false) */
  sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

/**
 * Yeniden kullanılabilir, generic liste/tablo bileşeni.
 * Loading, empty state, error state, sıralama ve pagination'ı kendi içinde
 * yönetir; component'ler sadece columns + rows + loading/errorMessage
 * input'larını verir.
 * Arama/filtreleme, veriyi bu bileşene ulaşmadan önce (component seviyesinde)
 * `rows` input'unu daraltarak yapılır; sıralama ve sayfalama burada, tek
 * bir yerde uygulanır.
 *
 * Hücre içeriği varsayılan olarak `row[column.key]` gösterir; özel bir
 * gösterim gerekiyorsa `dtCell` şablonu ile override edilebilir:
 *
 * <app-data-table [columns]="columns" [rows]="rows" [loading]="loading" [errorMessage]="error">
 *   <ng-template dtCell="status" let-value>
 *     <span class="badge">{{ value }}</span>
 *   </ng-template>
 * </app-data-table>
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, DataTableCellDirective, EmptyStateComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> implements AfterContentInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Input() emptyMessage = 'Kayıt bulunamadı.';
  @Input() trackByKey = 'id';
  /** Sayfa başına gösterilecek satır sayısı. */
  @Input() pageSize = 10;

  /** Kullanıcı "Tekrar dene" butonuna bastığında tetiklenir. */
  @Output() retry = new EventEmitter<void>();

  @ContentChildren(DataTableCellDirective) private cellTemplates!: QueryList<DataTableCellDirective>;

  sortKey: string | null = null;
  sortDirection: SortDirection = null;
  currentPage = 1;

  private cellTemplateMap = new Map<string, DataTableCellDirective>();

  ngAfterContentInit(): void {
    this.cellTemplates.forEach((tpl) => this.cellTemplateMap.set(tpl.columnKey, tpl));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // rows dışarıdan (arama/filtre sonucu) her değiştiğinde 1. sayfaya dön.
    if (changes['rows']) {
      this.currentPage = 1;
    }
  }

  getCellTemplate(columnKey: string): DataTableCellDirective | undefined {
    return this.cellTemplateMap.get(columnKey);
  }

  /** Template'te strict tip kontrolünü aşmak için güvenli bracket erişimi. */
  cellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  get sortedRows(): T[] {
    if (!this.sortKey || !this.sortDirection) {
      return this.rows;
    }

    const key = this.sortKey;
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    return [...this.rows].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[key];
      const bVal = (b as Record<string, unknown>)[key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedRows.length / this.pageSize));
  }

  get pagedRows(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedRows.slice(start, start + this.pageSize);
  }

  get showPagination(): boolean {
    return this.sortedRows.length > this.pageSize;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortKey !== column.key) {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortKey = null;
      this.sortDirection = null;
    }

    this.currentPage = 1;
  }

  trackByFn = (_index: number, row: T): unknown => (row as Record<string, unknown>)[this.trackByKey];
}