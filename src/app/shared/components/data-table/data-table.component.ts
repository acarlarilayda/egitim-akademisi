import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableCellDirective } from './data-table-cell.directive';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

/**
 * Yeniden kullanılabilir, generic liste/tablo bileşeni.
 * Loading, empty state ve error state'i kendi içinde yönetir; component'ler
 * sadece columns + rows + loading/errorMessage input'larını verir.
 * Hücre içeriği varsayılan olarak `row[column.key]` gösterir; özel bir
 * gösterim gerekiyorsa `dtCell` şablonu ile override edilebilir.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, DataTableCellDirective],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> implements AfterContentInit {
  @Input() columns: TableColumn[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Input() emptyMessage = 'Kayıt bulunamadı.';
  @Input() trackByKey = 'id';

  @Output() retry = new EventEmitter<void>();

  @ContentChildren(DataTableCellDirective) private cellTemplates!: QueryList<DataTableCellDirective>;

  sortKey: string | null = null;
  sortDirection: SortDirection = null;

  private cellTemplateMap = new Map<string, DataTableCellDirective>();

  ngAfterContentInit(): void {
    this.cellTemplates.forEach((tpl) => this.cellTemplateMap.set(tpl.columnKey, tpl));
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
  }

  trackByFn = (_index: number, row: T): unknown => (row as Record<string, unknown>)[this.trackByKey];
}