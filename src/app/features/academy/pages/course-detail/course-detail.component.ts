import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { CourseModuleService, LessonService } from '../../services/course-module.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { ParticipantService } from '../../services/participant.service';
import { ExamService } from '../../services/exam.service';
import { ExamResultService } from '../../services/exam-result.service';
import { Course } from '../../models/course.model';
import { CourseModule, Lesson } from '../../models/course-module.model';
import { Enrollment } from '../../models/enrollment.model';
import { ExamResult } from '../../models/exam-result.model';
import { CourseStatus, EnrollmentStatus, UserRole } from '../../../../core/models/enums';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AttendanceMarkFormComponent } from '../attendance-mark-form/attendance-mark-form.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { PermissionDirective } from '../../../../shared/directives/permission.directive';
import { SessionService } from '../../../../core/services/session.service';

type DetailTab = 'modules' | 'participants' | 'results';

interface EnrollmentRow extends Enrollment {
  participantName: string;
}

interface ExamResultRow extends ExamResult {
  participantName: string;
  examTitle: string;
}

/** Kurs durumu için sıradaki geçiş — bir sonraki adım yoksa null (Archived, son durumdur). */
const NEXT_COURSE_STATUS: Record<CourseStatus, CourseStatus | null> = {
  [CourseStatus.Draft]: CourseStatus.Published,
  [CourseStatus.Published]: CourseStatus.Completed,
  [CourseStatus.Completed]: CourseStatus.Archived,
  [CourseStatus.Archived]: null,
};

const COURSE_STATUS_ACTION_LABELS: Record<CourseStatus, string> = {
  [CourseStatus.Draft]: 'Yayına Al',
  [CourseStatus.Published]: 'Tamamlandı Olarak İşaretle',
  [CourseStatus.Completed]: 'Arşivle',
  [CourseStatus.Archived]: '',
};

/** Bir katılım kaydı için o an kullanıcıya sunulacak durum geçişi aksiyonları. */
interface EnrollmentAction {
  label: string;
  newStatus: EnrollmentStatus;
  danger: boolean;
}

const ENROLLMENT_ACTIONS: Record<EnrollmentStatus, EnrollmentAction[]> = {
  [EnrollmentStatus.Pending]: [
    { label: 'Onayla', newStatus: EnrollmentStatus.Approved, danger: false },
    { label: 'İptal Et', newStatus: EnrollmentStatus.Cancelled, danger: true },
  ],
  [EnrollmentStatus.Approved]: [
    { label: 'Aktifleştir', newStatus: EnrollmentStatus.Active, danger: false },
    { label: 'İptal Et', newStatus: EnrollmentStatus.Cancelled, danger: true },
  ],
  [EnrollmentStatus.Active]: [
    { label: 'Tamamla', newStatus: EnrollmentStatus.Completed, danger: false },
    { label: 'İptal Et', newStatus: EnrollmentStatus.Cancelled, danger: true },
  ],
  [EnrollmentStatus.Completed]: [],
  [EnrollmentStatus.Cancelled]: [],
};

/**
 * Kurs detay ekranı (/kurslar/:id).
 * Modüller, katılımcılar (enrollment) ve sonuçlar (exam results) sekmeli
 * yapıda gösterilir (bkz. dokümanın 11. bölümü, kabul kriterleri).
 * Katılımcılar sekmesinde her satır için "Katılım İşle" aksiyonu, dokümanın
 * 5. bölümündeki "Katılım takibi" oluşturma akışını karşılar.
 *
 * Kurs durum geçişi (Taslak->Yayında->Tamamlandı->Arşivlendi) ve katılım
 * durum geçişleri (Onayla/Aktifleştir/Tamamla/İptal Et), CourseService ve
 * EnrollmentService'te zaten tanımlı olan iş kurallarını (changeStatus)
 * kullanıcıya sunar. Her ikisi de geri döndürülemez/kritik olduğu için
 * ConfirmDialogComponent ile onay alınmadan uygulanmaz.
 */
@Component({
  selector: 'app-course-detail',
  standalone: true,
imports: [CommonModule, RouterLink, DialogComponent, ConfirmDialogComponent, AttendanceMarkFormComponent, StatusLabelPipe, PermissionDirective],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  /** Kurs durum geçişi, katılım onay/iptal ve katılım işleme (attendance)
   * yalnızca Eğitim Yöneticisi ve Eğitmen'e açıktır; Katılımcı kurs
   * detayını sadece görüntüleyebilir. */
  protected readonly manageRoles = [UserRole.EgitimYoneticisi, UserRole.Egitmen];

  course: Course | null = null;
  modules: CourseModule[] = [];
  lessons: Lesson[] = [];
  enrollmentRows: EnrollmentRow[] = [];
  examResultRows: ExamResultRow[] = [];

  loading = true;
  errorMessage: string | null = null;
  activeTab: DetailTab = 'modules';

  attendanceDialogOpen = false;
  attendanceParticipantId: string | null = null;

  /** Kurs durum geçişi onay diyaloğu için bekleyen hedef durum. */
  statusConfirmOpen = false;
  statusActionError: string | null = null;

  /** Katılım durum geçişi onay diyaloğu için bekleyen aksiyon. */
  enrollmentConfirmOpen = false;
  pendingEnrollmentAction: { enrollmentId: string; action: EnrollmentAction } | null = null;
  enrollmentActionError: string | null = null;

  private courseId!: string;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private courseModuleService: CourseModuleService,
    private lessonService: LessonService,
    private enrollmentService: EnrollmentService,
    private participantService: ParticipantService,
    private examService: ExamService,
    private examResultService: ExamResultService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      course: this.courseService.getById(this.courseId),
      modules: this.courseModuleService.getByCourseId(this.courseId),
      enrollments: this.enrollmentService.getAll(),
      participants: this.participantService.getAll(),
      exams: this.examService.getByCourseId(this.courseId),
      examResults: this.examResultService.getAll(),
      lessons: this.lessonService.getAll(),
    }).subscribe({
      next: ({ course, modules, enrollments, participants, exams, examResults, lessons }) => {
        if (!course) {
          this.errorMessage = 'Kurs bulunamadı.';
          this.loading = false;
          return;
        }

        const participantNameById = new Map(participants.map((p) => [p.id, p.fullName]));
        const examTitleById = new Map(exams.map((e) => [e.id, e.title]));
        const courseExamIds = new Set(exams.map((e) => e.id));
        const moduleIds = new Set(modules.map((m) => m.id));

        this.course = course;
        this.modules = modules;
        this.lessons = lessons.filter((l) => moduleIds.has(l.moduleId));

        // Katılımcı rolünde, kurs detayındaki "Katılımcılar" ve "Sonuçlar"
        // sekmeleri diğer katılımcıların bilgilerini sızdırmamalı; sadece
        // aktif kullanıcının kendi kaydı gösterilir.
        const isKatilimci = this.sessionService.currentRole() === UserRole.Katilimci;
        const ownParticipantId = this.sessionService.currentParticipantId();

        this.enrollmentRows = enrollments
          .filter((e) => e.courseId === this.courseId)
          .filter((e) => !isKatilimci || e.participantId === ownParticipantId)
          .map((e) => ({ ...e, participantName: participantNameById.get(e.participantId) ?? e.participantId }));

        this.examResultRows = examResults
          .filter((r) => courseExamIds.has(r.examId))
          .filter((r) => !isKatilimci || r.participantId === ownParticipantId)
          .map((r) => ({
            ...r,
            participantName: participantNameById.get(r.participantId) ?? r.participantId,
            examTitle: examTitleById.get(r.examId) ?? r.examId,
          }));

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Kurs detayı yüklenirken bir hata oluştu.';
        this.loading = false;
      },
    });
  }

  openAttendanceDialog(participantId: string): void {
    this.attendanceParticipantId = participantId;
    this.attendanceDialogOpen = true;
  }

  onAttendanceSaved(): void {
    this.attendanceDialogOpen = false;
    this.attendanceParticipantId = null;
    this.load();
  }

  onAttendanceDialogClosed(): void {
    this.attendanceDialogOpen = false;
    this.attendanceParticipantId = null;
  }

  /** Kursun bir sonraki durumu var mı (Archived değilse her zaman vardır). */
  get nextCourseStatus(): CourseStatus | null {
    return this.course ? NEXT_COURSE_STATUS[this.course.status] : null;
  }

  get courseStatusActionLabel(): string {
    return this.course ? COURSE_STATUS_ACTION_LABELS[this.course.status] : '';
  }

  get statusConfirmMessage(): string {
    return `"${this.courseStatusActionLabel}" işlemini uygulamak istediğinize emin misiniz? Bu işlem geri alınamaz.`;
  }

  get enrollmentConfirmMessage(): string {
    const label = this.pendingEnrollmentAction?.action.label ?? '';
    return `"${label}" işlemini uygulamak istediğinize emin misiniz?`;
  }

  get enrollmentConfirmLabel(): string {
    return this.pendingEnrollmentAction?.action.label ?? 'Onayla';
  }

  get enrollmentConfirmDanger(): boolean {
    return this.pendingEnrollmentAction?.action.danger ?? false;
  }

  openStatusConfirm(): void {
    this.statusActionError = null;
    this.statusConfirmOpen = true;
  }

  confirmStatusChange(): void {
    const next = this.nextCourseStatus;
    if (!this.course || !next) {
      return;
    }

    this.courseService.changeStatus(this.course.id, next).subscribe({
      next: () => {
        this.statusConfirmOpen = false;
        this.load();
      },
      error: (err) => {
        this.statusActionError = err?.message ?? 'Durum değiştirilirken bir hata oluştu.';
        this.statusConfirmOpen = false;
      },
    });
  }

  cancelStatusChange(): void {
    this.statusConfirmOpen = false;
  }

  /** Bir katılım kaydı için o an sunulacak aksiyonlar (Onayla/Aktifleştir/Tamamla/İptal Et). */
  enrollmentActionsFor(row: EnrollmentRow): EnrollmentAction[] {
    return ENROLLMENT_ACTIONS[row.status];
  }

  openEnrollmentActionConfirm(enrollmentId: string, action: EnrollmentAction): void {
    this.enrollmentActionError = null;
    this.pendingEnrollmentAction = { enrollmentId, action };
    this.enrollmentConfirmOpen = true;
  }

  confirmEnrollmentAction(): void {
    if (!this.pendingEnrollmentAction) {
      return;
    }

    const { enrollmentId, action } = this.pendingEnrollmentAction;

    this.enrollmentService.changeStatus(enrollmentId, action.newStatus).subscribe({
      next: () => {
        this.enrollmentConfirmOpen = false;
        this.pendingEnrollmentAction = null;
        this.load();
      },
      error: (err) => {
        this.enrollmentActionError = err?.message ?? 'Durum değiştirilirken bir hata oluştu.';
        this.enrollmentConfirmOpen = false;
      },
    });
  }

  cancelEnrollmentAction(): void {
    this.enrollmentConfirmOpen = false;
    this.pendingEnrollmentAction = null;
  }
}