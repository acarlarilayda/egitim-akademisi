import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuditLogEntry } from '../../../../core/models/audit-log-entry.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Audit Log listesi ekranı (/audit-log).
 * İşlem tipi, zamanı, yapan rol ve açıklamayı gösterir (bkz. dokümanın
 * 5. bölümü: "Log kaydında işlem tipi, işlem zamanı, işlem yapan rol,
 * açıklama ve varsa eski/yeni değer bulunmalıdır").
 */
@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableCellDirective],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss',
})
export class AuditLogListComponent implements OnInit {
  entries: AuditLogEntry[] = [];
  errorMessage: string | null = null;

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
}