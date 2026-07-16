import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
}