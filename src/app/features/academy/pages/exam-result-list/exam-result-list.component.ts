import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamResultService } from '../../services/exam-result.service';
import { ExamService } from '../../services/exam.service';
import { ParticipantService } from '../../services/participant.service';
import { ExamResult } from '../../models/exam-result.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Sınav sonuçları listesi ekranı (/sonuclar).
 * Doğru/yanlış/net ve başarı durumu ExamResultService tarafından zaten
 * hesaplanmış olarak gelir; bu ekran sadece görüntüler.
 */
@Component({
  selector: 'app-exam-result-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableCellDirective],
  templateUrl: './exam-result-list.component.html',
  styleUrl: './exam-result-list.component.scss',
})
export class ExamResultListComponent implements OnInit {
  results: ExamResult[] = [];
  errorMessage: string | null = null;
  examTitleById = new Map<string, string>();
  participantNameById = new Map<string, string>();

  readonly loading = this.examResultService.loading;

  readonly columns: TableColumn[] = [
    { key: 'participantId', label: 'Katılımcı', sortable: false },
    { key: 'examId', label: 'Sınav', sortable: false },
    { key: 'correctCount', label: 'Doğru', sortable: true },
    { key: 'wrongCount', label: 'Yanlış', sortable: true },
    { key: 'score', label: 'Puan', sortable: true },
    { key: 'isPassed', label: 'Sonuç', sortable: true },
  ];

  constructor(
    private examResultService: ExamResultService,
    private examService: ExamService,
    private participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;

    this.examService.getAll().subscribe({
      next: (exams) => {
        this.examTitleById = new Map(exams.map((e) => [e.id, e.title]));
      },
    });

    this.participantService.getAll().subscribe({
      next: (participants) => {
        this.participantNameById = new Map(participants.map((p) => [p.id, p.fullName]));
      },
    });

    this.examResultService.getAll().subscribe({
      next: (results) => (this.results = results),
      error: (err) => (this.errorMessage = err?.message ?? 'Sonuçlar yüklenirken bir hata oluştu.'),
    });
  }

  examTitle(examId: string): string {
    return this.examTitleById.get(examId) ?? examId;
  }

  participantName(participantId: string): string {
    return this.participantNameById.get(participantId) ?? participantId;
  }
}