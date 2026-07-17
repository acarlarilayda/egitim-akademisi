import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseModuleService } from '../../services/course-module.service';
import { CourseService } from '../../services/course.service';
import { CourseModule } from '../../models/course-module.model';
import { Course } from '../../models/course.model';
import { UserRole } from '../../../../core/models/enums';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CourseModuleFormComponent } from '../course-module-form/course-module-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';

/**
 * Modül oluşturma/düzenleme yalnızca Eğitim Yöneticisi'ne açıktır.
 */
@Component({
  selector: 'app-course-module-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    CourseModuleFormComponent,
    DebounceDirective,
    PermissionDirective,
  ],
  templateUrl: './course-module-list.component.html',
  styleUrl: './course-module-list.component.scss',
})
export class CourseModuleListComponent implements OnInit {
  protected readonly manageRoles = [UserRole.EgitimYoneticisi];

  modules: CourseModule[] = [];
  courses: Course[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();

  searchTerm = '';
  courseFilter = '';

  dialogOpen = false;
  editingModule: CourseModule | null = null;

  readonly loading = this.courseModuleService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Modül Adı', sortable: true },
    { key: 'courseId', label: 'Kurs', sortable: false },
    { key: 'order', label: 'Sıra', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(
    private courseModuleService: CourseModuleService,
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

    this.courseModuleService.getAll().subscribe({
      next: (modules) => (this.modules = modules),
      error: (err) => (this.errorMessage = err?.message ?? 'Modüller yüklenirken bir hata oluştu.'),
    });
  }

  courseTitle(courseId: string): string {
    return this.courseTitleById.get(courseId) ?? courseId;
  }

  get filteredModules(): CourseModule[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.modules.filter((module) => {
      const matchesSearch = !term || module.title.toLowerCase().includes(term);
      const matchesCourse = !this.courseFilter || module.courseId === this.courseFilter;
      return matchesSearch && matchesCourse;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  openCreateDialog(): void {
    this.editingModule = null;
    this.dialogOpen = true;
  }

  openEditDialog(module: CourseModule): void {
    this.editingModule = module;
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