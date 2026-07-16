import { Component, EventEmitter, Input, Output } from '@angular/core';
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

/**
 * Sertifika uygunluğu değerlendirme formu (bkz. dokümanın 11. bölümü:
 * "Sertifika uygunluğu için computed signal veya selector kullanılmalıdır.").
 * Kullanıcı sadece kurs + katılımcı seçer; katılım oranı
 * (AttendanceRecordService.calculateAttendanceRate) ve sınav başarı durumu
 * otomatik hesaplanır, elle girilmez.
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

  constructor(
    private fb: FormBuilder,
    private certificateEligibilityService: CertificateEligibilityService,
    private attendanceRecordService: AttendanceRecordService,
    private examService: ExamService,
    private examResultService: ExamResultService
  ) {}

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { courseId, participantId } = this.form.getRawValue();
    this.submitting = true;

    forkJoin({
      exams: this.examService.getByCourseId(courseId!),
      results: this.examResultService.getByParticipantId(participantId!),
    }).subscribe({
      next: ({ exams, results }) => {
        const courseExamIds = new Set(exams.map((e) => e.id));
        const examPassed = results.some((r) => courseExamIds.has(r.examId) && r.isPassed);
        const attendanceRate = this.attendanceRecordService.calculateAttendanceRate(courseId!, participantId!);

        this.certificateEligibilityService.evaluate(courseId!, participantId!, attendanceRate, examPassed).subscribe({
          next: () => {
            this.submitting = false;
            this.saved.emit();
          },
          error: (err) => {
            this.submitting = false;
            this.errorMessage = err?.message ?? 'Değerlendirme sırasında bir hata oluştu.';
          },
        });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.message ?? 'Değerlendirme için veriler yüklenirken bir hata oluştu.';
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}