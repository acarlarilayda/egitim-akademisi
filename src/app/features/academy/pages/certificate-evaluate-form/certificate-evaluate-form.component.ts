import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CertificateEligibilityService } from '../../services/certificate-eligibility.service';
import { AttendanceRecordService } from '../../services/attendance-record.service';
import { ExamService } from '../../services/exam.service';
import { ExamResultService } from '../../services/exam-result.service';
import { Course } from '../../models/course.model';
import { Participant } from '../../models/participant.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

const MINIMUM_ATTENDANCE_RATE = 80;

interface EligibilityPreview {
  attendanceRate: number;
  examPassed: boolean;
  isEligible: boolean;
}

/**
 * Sertifika uygunlugu degerlendirme formu.
 * Kullanici sadece kurs + katilimci secer; katilim orani
 * (AttendanceRecordService.calculateAttendanceRate) ve sinav basari durumu
 * otomatik hesaplanir, elle girilmez. Nihai uygunluk durumu
 * (eligibilityPreview) bir Angular computed() signal'idir: secim
 * degistikce hesaplanan ham degerler (attendanceRateSig, examPassedSig)
 * signal'lara yazilir, computed() bunlardan turetilmis sonucu anlik
 * olarak formda gosterir ve gonderim sirasinda yeniden hesaplamaya
 * gerek kalmadan aynen kullanilir.
 */
@Component({
  selector: 'app-certificate-evaluate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './certificate-evaluate-form.component.html',
  styleUrl: './certificate-evaluate-form.component.scss',
})
export class CertificateEvaluateFormComponent {
  @Input() courses: Course[] = [];
  @Input() participants: Participant[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group({
    courseId: ['', Validators.required],
    participantId: ['', Validators.required],
  });

  private readonly attendanceRateSig = signal<number | null>(null);
  private readonly examPassedSig = signal<boolean | null>(null);
  private readonly loadingPreview = signal(false);

  readonly loadingPreviewReadonly = this.loadingPreview.asReadonly();

  /**
   * Sertifika uygunlugu icin computed signal. Katilim orani VE sinav
   * basari sarti birlikte saglanmalidir (>= %80 katilim ve sinavi gecmis
   * olmak). Her iki ham deger de hesaplanmadan (null) onizleme gosterilmez.
   */
  readonly eligibilityPreview = computed<EligibilityPreview | null>(() => {
    const attendanceRate = this.attendanceRateSig();
    const examPassed = this.examPassedSig();

    if (attendanceRate === null || examPassed === null) {
      return null;
    }

    return {
      attendanceRate,
      examPassed,
      isEligible: attendanceRate >= MINIMUM_ATTENDANCE_RATE && examPassed,
    };
  });

  constructor(
    private fb: FormBuilder,
    private certificateEligibilityService: CertificateEligibilityService,
    private attendanceRecordService: AttendanceRecordService,
    private examService: ExamService,
    private examResultService: ExamResultService
  ) {
    this.form.valueChanges.subscribe(() => this.refreshPreview());
  }

  private refreshPreview(): void {
    const { courseId, participantId } = this.form.getRawValue();

    if (!courseId || !participantId) {
      this.attendanceRateSig.set(null);
      this.examPassedSig.set(null);
      return;
    }

    this.loadingPreview.set(true);
    forkJoin({
      exams: this.examService.getByCourseId(courseId),
      results: this.examResultService.getByParticipantId(participantId),
    }).subscribe({
      next: ({ exams, results }) => {
        const courseExamIds = new Set(exams.map((exam) => exam.id));
        this.examPassedSig.set(results.some((result) => courseExamIds.has(result.examId) && result.isPassed));
        this.attendanceRateSig.set(
          this.attendanceRecordService.calculateAttendanceRate(courseId, participantId)
        );
        this.loadingPreview.set(false);
      },
      error: () => {
        this.loadingPreview.set(false);
      },
    });
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const preview = this.eligibilityPreview();
    if (!preview) {
      return;
    }

    const { courseId, participantId } = this.form.getRawValue();
    this.submitting = true;

    this.certificateEligibilityService
      .evaluate(courseId!, participantId!, preview.attendanceRate, preview.examPassed)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.message ?? 'Değerlendirme sırasında bir hata oluştu.';
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}