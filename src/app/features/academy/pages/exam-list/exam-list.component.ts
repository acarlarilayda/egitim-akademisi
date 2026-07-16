import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { CourseService } from '../../services/course.service';
import { Exam } from '../../models/exam.model';
import { Course } from '../../models/course.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ExamFormComponent } from '../exam-form/exam-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    ExamFormComponent,
    DebounceDirective,
  ],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  courses: Course[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();

  searchTerm = '';
  courseFilter = '';

  dialogOpen = false;
  editingExam: Exam | null = null;

  readonly loading = this.examService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Sınav Adı', sortable: true },
    { key: 'courseId', label: 'Kurs', sortable: false },
    { key: 'durationMinutes', label: 'Süre (dk)', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(
    private examService: ExamService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;

    this.courseService.getAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
      },
    });

    this.examService.getAll().subscribe({
      next: (exams) => (this.exams = exams),
      error: (err) => (this.errorMessage = err?.message ?? 'Sınavlar yüklenirken bir hata oluştu.'),
    });
  }

  courseTitle(courseId: string): string {
    return this.courseTitleById.get(courseId) ?? courseId;
  }

  get filteredExams(): Exam[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.exams.filter((exam) => {
      const matchesSearch = !term || exam.title.toLowerCase().includes(term);
      const matchesCourse = !this.courseFilter || exam.courseId === this.courseFilter;
      return matchesSearch && matchesCourse;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  openCreateDialog(): void {
    this.editingExam = null;
    this.dialogOpen = true;
  }

  openEditDialog(exam: Exam): void {
    this.editingExam = exam;
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