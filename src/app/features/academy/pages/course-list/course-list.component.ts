import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { InstructorService } from '../../services/instructor.service';
import { Course } from '../../models/course.model';
import { Instructor } from '../../models/instructor.model';
import { CourseStatus, UserRole } from '../../../../core/models/enums';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CourseFormComponent } from '../course-form/course-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

/**
 * Kurs listesi ekranı (/kurslar).
 * Yeni kurs oluşturma ve düzenleme, reusable Dialog + CourseForm bileşenleri
 * ile modal içinde yapılır. Arama (debounce'lu) ve durum filtresi,
 * DataTableComponent'e ulaşmadan önce `filteredCourses` getter'ında
 * uygulanır; sıralama ve pagination DataTableComponent içinde yönetilir.
 */
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    CourseFormComponent,
    DebounceDirective,
    PermissionDirective,
    StatusLabelPipe,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  /** Kurs oluşturma/düzenleme yalnızca Eğitim Yöneticisi'ne açıktır. */
  protected readonly manageRoles = [UserRole.EgitimYoneticisi];

  courses: Course[] = [];
  instructors: Instructor[] = [];
  errorMessage: string | null = null;

  searchTerm = '';
  statusFilter = '';
  readonly statusOptions = Object.values(CourseStatus);

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

  /** Arama (kurs adında) ve durum filtresi uygulanmış kurs listesi. */
  get filteredCourses(): Course[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.courses.filter((course) => {
      const matchesSearch = !term || course.title.toLowerCase().includes(term);
      const matchesStatus = !this.statusFilter || course.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
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