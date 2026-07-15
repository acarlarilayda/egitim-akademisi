import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../../services/participant.service';
import { Participant } from '../../models/participant.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Katılımcı listesi ekranı (/katilimcilar).
 */
@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableCellDirective],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss',
})
export class ParticipantListComponent implements OnInit {
  participants: Participant[] = [];
  errorMessage: string | null = null;

  readonly loading = this.participantService.loading;

  readonly columns: TableColumn[] = [
    { key: 'fullName', label: 'Ad Soyad', sortable: true },
    { key: 'email', label: 'E-posta', sortable: true },
    { key: 'phone', label: 'Telefon', sortable: false },
    { key: 'isActive', label: 'Durum', sortable: true },
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
}