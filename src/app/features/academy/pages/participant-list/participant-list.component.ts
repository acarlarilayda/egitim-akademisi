import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../../services/participant.service';
import { Participant } from '../../models/participant.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ParticipantFormComponent } from '../participant-form/participant-form.component';

/**
 * Katılımcı listesi ekranı (/katilimcilar).
 * Yeni katılımcı oluşturma ve düzenleme, reusable Dialog + ParticipantForm
 * bileşenleri ile modal içinde yapılır (bkz. CourseListComponent ile aynı desen).
 */
@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    ParticipantFormComponent,
  ],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss',
})
export class ParticipantListComponent implements OnInit {
  participants: Participant[] = [];
  errorMessage: string | null = null;

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