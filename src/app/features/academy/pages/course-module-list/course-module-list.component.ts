import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseModuleService } from '../../services/course-module.service';
import { CourseService } from '../../services/course.service';
import { CourseModule } from '../../models/course-module.model';
import { Course } from '../../models/course.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CourseModuleFormComponent } from '../course-module-form/course-module-form.component';

/**
 * Modül listesi ekranı (/moduller).
 * Yeni modül oluşturma ve düzenleme, reusable Dialog + CourseModuleForm
 * bileşenleri ile modal içinde yapılır.
 */
@Component({
  selector: 'app-course-module-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    CourseModuleFormComponent,
  ],
  templateUrl: './course-module-list.component.html',
  styleUrl: './course-module-list.component.scss',
})
export class CourseModuleListComponent implements OnInit {
  modules: CourseModule[] = [];
  courses: Course[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();

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