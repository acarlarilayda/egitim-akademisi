import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { InstructorService } from '../../services/instructor.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { Course } from '../../models/course.model';
import { Instructor } from '../../models/instructor.model';
import { CourseStatus, UserRole } from '../../../../core/models/enums';
import { SessionService } from '../../../../core/services/session.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CourseFormComponent } from '../course-form/course-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';

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

  /** Katılımcı rolünde, aktif kullanıcının kayıtlı olduğu kurs id'leri. */
  private enrolledCourseIds: Set<string> | null = null;

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
    private instructorService: InstructorService,
    private enrollmentService: EnrollmentService,
    private sessionService: SessionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Katılımcı ise önce kendi kayıtlarını çekip hangi kursları
    // görebileceğini belirliyoruz; kurs listesi ona göre filtrelenecek.
    if (this.sessionService.currentRole() === UserRole.Katilimci) {
      const participantId = this.sessionService.currentParticipantId();
      this.enrollmentService.getAll().subscribe({
        next: (enrollments) => {
          this.enrolledCourseIds = new Set(
            enrollments.filter((e) => e.participantId === participantId).map((e) => e.courseId)
          );
          this.load();
        },
      });
    } else {
      this.load();
    }

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
      const matchesEnrollment = !this.enrolledCourseIds || this.enrolledCourseIds.has(course.id);
      return matchesSearch && matchesStatus && matchesEnrollment;
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
    const message = this.editingCourse ? 'Kurs güncellendi.' : 'Kurs oluşturuldu.';
    this.dialogOpen = false;
    this.load();
    this.notificationService.success(message);
  }

  onDialogClosed(): void {
    this.dialogOpen = false;
  }
}