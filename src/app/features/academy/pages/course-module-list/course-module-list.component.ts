import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseModuleService } from '../../services/course-module.service';
import { CourseService } from '../../services/course.service';
import { CourseModule } from '../../models/course-module.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Modül listesi ekranı (/moduller).
 * Her modülün bağlı olduğu kurs adını göstermek için kurs listesini de
 * asenkron olarak çekip id -> title eşlemesi çıkarır.
 */
@Component({
  selector: 'app-course-module-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableCellDirective],
  templateUrl: './course-module-list.component.html',
  styleUrl: './course-module-list.component.scss',
})
export class CourseModuleListComponent implements OnInit {
  modules: CourseModule[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();

  readonly loading = this.courseModuleService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Modül Adı', sortable: true },
    { key: 'courseId', label: 'Kurs', sortable: false },
    { key: 'order', label: 'Sıra', sortable: true },
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
}