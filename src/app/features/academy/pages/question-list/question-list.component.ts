import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { ExamService } from '../../services/exam.service';
import { Question } from '../../models/question.model';
import { Exam } from '../../models/exam.model';
import { QuestionStatus } from '../../../../core/models/enums';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

/**
 * Soru bankası ekranı (/sinavlar/:examId/sorular).
 * Bir sınava bağlı soruların listeleme/oluşturma/düzenleme/pasife alma
 * (soft delete) akışlarını karşılar (bkz. dokümanın 5. bölümü: "Sınav ve
 * soru bankası: ... akışlarını kapsar."). Doküman kuralı gereği
 * ("Yayındaki sınav sorusu silinemez; pasife alınabilir") aktif bir soru
 * asla silinmez, sadece QuestionService.deactivate() ile pasife alınır —
 * bu kritik/geri döndürülemez işlem ConfirmDialogComponent ile onay ister.
 */
@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    ConfirmDialogComponent,
    QuestionFormComponent,
    StatusLabelPipe,
  ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss',
})
export class QuestionListComponent implements OnInit {
  exam: Exam | null = null;
  questions: Question[] = [];
  errorMessage: string | null = null;

  dialogOpen = false;
  editingQuestion: Question | null = null;

  /** Pasife alma, geri döndürülemez kritik bir işlem olduğu için
   * ConfirmDialogComponent ile onay alınmadan uygulanmaz. */
  deactivateConfirmOpen = false;
  pendingDeactivateId: string | null = null;

  readonly loading = this.questionService.loading;
  readonly Status = QuestionStatus;

  readonly columns: TableColumn[] = [
    { key: 'text', label: 'Soru', sortable: false },
    { key: 'options', label: 'Seçenek Sayısı', sortable: false },
    { key: 'status', label: 'Durum', sortable: true },
    { key: 'actions', label: '' },
  ];

  examId!: string;

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId') ?? '';
    this.load();
  }

  load(): void {
    this.errorMessage = null;

    this.examService.getById(this.examId).subscribe({
      next: (exam) => (this.exam = exam ?? null),
    });

    this.questionService.getByExamId(this.examId).subscribe({
      next: (questions) => (this.questions = questions),
      error: (err) => (this.errorMessage = err?.message ?? 'Sorular yüklenirken bir hata oluştu.'),
    });
  }

  openCreateDialog(): void {
    this.editingQuestion = null;
    this.dialogOpen = true;
  }

  openEditDialog(question: Question): void {
    this.editingQuestion = question;
    this.dialogOpen = true;
  }

  onSaved(): void {
    this.dialogOpen = false;
    this.load();
  }

  onDialogClosed(): void {
    this.dialogOpen = false;
  }

  requestDeactivate(id: string): void {
    this.pendingDeactivateId = id;
    this.deactivateConfirmOpen = true;
  }

  confirmDeactivate(): void {
    if (!this.pendingDeactivateId) {
      return;
    }

    this.errorMessage = null;
    this.questionService.deactivate(this.pendingDeactivateId).subscribe({
      next: () => {
        this.deactivateConfirmOpen = false;
        this.pendingDeactivateId = null;
        this.load();
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Soru pasife alınırken bir hata oluştu.';
        this.deactivateConfirmOpen = false;
        this.pendingDeactivateId = null;
      },
    });
  }

  cancelDeactivate(): void {
    this.deactivateConfirmOpen = false;
    this.pendingDeactivateId = null;
  }
}