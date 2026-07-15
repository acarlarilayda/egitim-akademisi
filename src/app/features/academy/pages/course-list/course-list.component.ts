import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { InstructorService } from '../../services/instructor.service';
import { Course } from '../../models/course.model';
import { Instructor } from '../../models/instructor.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CourseFormComponent } from '../course-form/course-form.component';

/**
 * Kurs listesi ekranı (/kurslar).
 * Yeni kurs oluşturma ve düzenleme, ayrı bir route yerine reusable
 * Dialog + CourseForm bileşenleri ile modal içinde yapılır.
 */
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    CourseFormComponent,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  instructors: Instructor[] = [];
  errorMessage: string | null = null;

  dialogOpen = false;
  editingCourse: Course | null = null;

  readonly loading = this.courseService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Kurs Adı', sortable: true },
    { key: 'status', label: 'Durum', sortable: true },
    { key: 'capacity', label: 'Kontenjan', sortable: true },
    { key: 'startDate', label: 'Başlangıç', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(
    private courseService: CourseService,
    private instructorService: InstructorService
  ) {}

  ngOnInit(): void {
    this.load();
    this.instructorService.getAll().subscribe({
      next: (instructors) => (this.instructors = instructors),
    });
  }

  load(): void {
    this.errorMessage = null;
    this.courseService.getAll().subscribe({
      next: (courses) => (this.courses = courses),
      error: (err) => (this.errorMessage = err?.message ?? 'Kurslar yüklenirken bir hata oluştu.'),
    });
  }

  openCreateDialog(): void {
    this.editingCourse = null;
    this.dialogOpen = true;
  }

  openEditDialog(course: Course): void {
    this.editingCourse = course;
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