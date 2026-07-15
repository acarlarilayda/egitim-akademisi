import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { CourseService } from '../../services/course.service';
import { Exam } from '../../models/exam.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Sınav listesi ekranı (/sinavlar).
 */
@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableCellDirective],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();

  readonly loading = this.examService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Sınav Adı', sortable: true },
    { key: 'courseId', label: 'Kurs', sortable: false },
    { key: 'durationMinutes', label: 'Süre (dk)', sortable: true },
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
}