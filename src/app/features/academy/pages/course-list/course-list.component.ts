import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';

/**
 * Kurs listesi ekranı (/kurslar).
 * Veri erişimi ve iş kuralları CourseService'te; bu component sadece
 * servisin Observable'ına abone olup DataTableComponent'e aktarır.
 */
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DataTableComponent, DataTableCellDirective],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  errorMessage: string | null = null;

  readonly loading = this.courseService.loading;

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Kurs Adı', sortable: true },
    { key: 'status', label: 'Durum', sortable: true },
    { key: 'capacity', label: 'Kontenjan', sortable: true },
    { key: 'startDate', label: 'Başlangıç', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;
    this.courseService.getAll().subscribe({
      next: (courses) => (this.courses = courses),
      error: (err) => (this.errorMessage = err?.message ?? 'Kurslar yüklenirken bir hata oluştu.'),
    });
  }
}