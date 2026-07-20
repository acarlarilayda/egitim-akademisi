import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ParticipantService } from '../../services/participant.service';
import { Participant } from '../../models/participant.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ParticipantFormComponent } from '../participant-form/participant-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    ParticipantFormComponent,
    DebounceDirective,
  ],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss',
})
export class ParticipantListComponent implements OnInit {
  participants: Participant[] = [];
  errorMessage: string | null = null;
  /** İçe aktarma sonucunda gösterilecek özet mesajı (kaç kayıt eklendi/atlandı). */
  importMessage: string | null = null;
  importErrorMessage: string | null = null;
  importing = false;

  searchTerm = '';
  statusFilter = '';

  dialogOpen = false;
  editingParticipant: Participant | null = null;

  readonly loading = this.participantService.loading;

  readonly columns: TableColumn[] = [
    { key: 'fullName', label: 'Ad Soyad', sortable: true },
    { key: 'email', label: 'E-posta', sortable: true },
    { key: 'phone', label: 'Telefon', sortable: false },
    { key: 'isActive', label: 'Durum', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(private participantService: ParticipantService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;
    this.participantService.getAll().subscribe({
      next: (participants) => (this.participants = participants),
      error: (err) => (this.errorMessage = err?.message ?? 'Katılımcılar yüklenirken bir hata oluştu.'),
    });
  }

  get filteredParticipants(): Participant[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.participants.filter((participant) => {
      const matchesSearch =
        !term ||
        participant.fullName.toLowerCase().includes(term) ||
        participant.email.toLowerCase().includes(term);
      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'aktif' && participant.isActive) ||
        (this.statusFilter === 'pasif' && !participant.isActive);
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  openCreateDialog(): void {
    this.editingParticipant = null;
    this.dialogOpen = true;
  }

  openEditDialog(participant: Participant): void {
    this.editingParticipant = participant;
    this.dialogOpen = true;
  }

  onSaved(): void {
    this.dialogOpen = false;
    this.load();
  }

  onDialogClosed(): void {
    this.dialogOpen = false;
  }

  /**
   * Katılımcı listesi import/export simülasyonu (bkz. proje kabul kriterleri).
   * Gerçek bir backend/dosya sistemi olmadığından JSON tabanlı, tamamen
   * tarayıcı içinde çalışan bir dışa/içe aktarma akışı uygulanır.
   */
  exportParticipants(): void {
    const exportData = this.filteredParticipants.map(({ fullName, email, phone, isActive }) => ({
      fullName,
      email,
      phone,
      isActive,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `katilimcilar-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Gizli dosya input'unu tetikler (görünür "İçe Aktar" butonundan çağrılır). */
  triggerImport(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    fileInput.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.importMessage = null;
    this.importErrorMessage = null;

    const reader = new FileReader();
    reader.onload = () => this.processImportFile(reader.result as string);
    reader.onerror = () => (this.importErrorMessage = 'Dosya okunamadı.');
    reader.readAsText(file);
  }

  private processImportFile(content: string): void {
    let rows: unknown[];
    try {
      const parsed = JSON.parse(content);
      rows = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.importErrorMessage = 'Dosya geçerli bir JSON formatında değil.';
      return;
    }

    const validRows = rows.filter(
      (row): row is { fullName: string; email: string; phone?: string } =>
        !!row &&
        typeof row === 'object' &&
        typeof (row as { fullName?: unknown }).fullName === 'string' &&
        (row as { fullName: string }).fullName.trim().length > 0 &&
        typeof (row as { email?: unknown }).email === 'string' &&
        (row as { email: string }).email.trim().length > 0
    );
    const skippedCount = rows.length - validRows.length;

    if (validRows.length === 0) {
      this.importErrorMessage = 'İçe aktarılabilecek geçerli bir katılımcı kaydı bulunamadı.';
      return;
    }

    this.importing = true;
    const creations = validRows.map((row) =>
      this.participantService.create({
        fullName: row.fullName,
        email: row.email,
        phone: row.phone ?? '',
      })
    );

    forkJoin(creations).subscribe({
      next: (created) => {
        this.importing = false;
        this.importMessage =
          `${created.length} katılımcı içe aktarıldı` +
          (skippedCount > 0 ? `, ${skippedCount} satır geçersiz olduğu için atlandı.` : '.');
        this.load();
      },
      error: (err) => {
        this.importing = false;
        this.importErrorMessage = err?.message ?? 'İçe aktarma sırasında bir hata oluştu.';
      },
    });
  }
}