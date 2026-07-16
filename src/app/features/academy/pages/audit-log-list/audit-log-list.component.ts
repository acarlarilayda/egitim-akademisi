import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuditLogEntry } from '../../../../core/models/audit-log-entry.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, DataTableCellDirective, DebounceDirective],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss',
})
export class AuditLogListComponent implements OnInit {
  entries: AuditLogEntry[] = [];
  errorMessage: string | null = null;

  searchTerm = '';
  entityTypeFilter = '';

  readonly loading = this.auditLogService.loading;

  readonly columns: TableColumn[] = [
    { key: 'createdAt', label: 'Zaman', sortable: true },
    { key: 'entityType', label: 'Varlık', sortable: true },
    { key: 'action', label: 'İşlem', sortable: true },
    { key: 'performedByRole', label: 'Yapan Rol', sortable: true },
    { key: 'description', label: 'Açıklama', sortable: false },
  ];

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;
    this.auditLogService.getAll().subscribe({
      next: (entries) => (this.entries = entries),
      error: (err) => (this.errorMessage = err?.message ?? 'Audit log yüklenirken bir hata oluştu.'),
    });
  }

  get entityTypeOptions(): string[] {
    return [...new Set(this.entries.map((entry) => entry.entityType))];
  }

  get filteredEntries(): AuditLogEntry[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.entries.filter((entry) => {
      const matchesSearch =
        !term ||
        entry.description.toLowerCase().includes(term) ||
        entry.action.toLowerCase().includes(term);
      const matchesEntityType = !this.entityTypeFilter || entry.entityType === this.entityTypeFilter;
      return matchesSearch && matchesEntityType;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }
}