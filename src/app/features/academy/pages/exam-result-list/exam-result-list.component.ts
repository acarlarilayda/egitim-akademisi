import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamResultService } from '../../services/exam-result.service';
import { ExamService } from '../../services/exam.service';
import { ParticipantService } from '../../services/participant.service';
import { CourseService } from '../../services/course.service';
import { ExamResult } from '../../models/exam-result.model';
import { Exam } from '../../models/exam.model';
import { Participant } from '../../models/participant.model';
import { Course } from '../../models/course.model';
import { SessionService } from '../../../../core/services/session.service';
import { UserRole } from '../../../../core/models/enums';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ExamResultFormComponent } from '../exam-result-form/exam-result-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';

@Component({
  selector: 'app-exam-result-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    ExamResultFormComponent,
    DebounceDirective,
    PermissionDirective,
  ],
  templateUrl: './exam-result-list.component.html',
  styleUrl: './exam-result-list.component.scss',
})
export class ExamResultListComponent implements OnInit {
  /** Sonuç kaydetme yalnızca Eğitim Yöneticisi ve Eğitmen'e açıktır. */
  protected readonly manageRoles = [UserRole.EgitimYoneticisi, UserRole.Egitmen];

  results: ExamResult[] = [];
  exams: Exam[] = [];
  participants: Participant[] = [];
  courses: Course[] = [];
  errorMessage: string | null = null;
  examTitleById = new Map<string, string>();
  participantNameById = new Map<string, string>();

  searchTerm = '';
  resultFilter = '';

  dialogOpen = false;

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
    private participantService: ParticipantService,
    private courseService: CourseService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;

    this.examService.getAll().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.examTitleById = new Map(exams.map((e) => [e.id, e.title]));
      },
    });

    this.participantService.getAll().subscribe({
      next: (participants) => {
        this.participants = participants;
        this.participantNameById = new Map(participants.map((p) => [p.id, p.fullName]));
      },
    });

    this.courseService.getAll().subscribe({
      next: (courses) => (this.courses = courses),
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

  get filteredResults(): ExamResult[] {
    const term = this.searchTerm.trim().toLowerCase();
    const isKatilimci = this.sessionService.currentRole() === UserRole.Katilimci;
    const ownParticipantId = this.sessionService.currentParticipantId();

    return this.results.filter((result) => {
      const matchesOwnership = !isKatilimci || result.participantId === ownParticipantId;
      const name = this.participantName(result.participantId).toLowerCase();
      const matchesSearch = !term || name.includes(term);
      const matchesResult =
        !this.resultFilter ||
        (this.resultFilter === 'gecti' && result.isPassed) ||
        (this.resultFilter === 'kaldi' && !result.isPassed);
      return matchesOwnership && matchesSearch && matchesResult;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  openCreateDialog(): void {
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