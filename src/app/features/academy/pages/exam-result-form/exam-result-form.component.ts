import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ExamResultService } from '../../services/exam-result.service';
import { Exam } from '../../models/exam.model';
import { Participant } from '../../models/participant.model';
import { Course } from '../../models/course.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

/**
 * Sınav sonucu kaydetme formu (bkz. dokümanın 5. bölümü: "Puanlama: ...
 * oluşturma ... doğrulama akışlarını kapsar."). Puan ve geçme durumu
 * ExamResultService tarafından otomatik hesaplandığı için (10. bölüm:
 * "sonuçlar otomatik hesaplanır"), bu form sadece oluşturma (create)
 * yapar — düzenleme, puanlama bütünlüğünü bozacağı için desteklenmez.
 */
@Component({
  selector: 'app-exam-result-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './exam-result-form.component.html',
  styleUrl: './exam-result-form.component.scss',
})
export class ExamResultFormComponent {
  @Input() exams: Exam[] = [];
  @Input() participants: Participant[] = [];
  @Input() courses: Course[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group(
    {
      examId: ['', Validators.required],
      participantId: ['', Validators.required],
      totalQuestionCount: [null as number | null, [Validators.required, Validators.min(1)]],
      correctCount: [null as number | null, [Validators.required, Validators.min(0)]],
      wrongCount: [null as number | null, [Validators.required, Validators.min(0)]],
    },
    { validators: ExamResultFormComponent.countsWithinTotalValidator }
  );

  constructor(
    private fb: FormBuilder,
    private examResultService: ExamResultService
  ) {}

  /** Doğru + yanlış sayısı, toplam soru sayısını aşamaz. */
  private static countsWithinTotalValidator(group: AbstractControl): ValidationErrors | null {
    const total = group.get('totalQuestionCount')?.value;
    const correct = group.get('correctCount')?.value;
    const wrong = group.get('wrongCount')?.value;

    if (total == null || correct == null || wrong == null) {
      return null;
    }

    return Number(correct) + Number(wrong) > Number(total) ? { countsExceedTotal: true } : null;
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const exam = this.exams.find((e) => e.id === value.examId);
    const course = exam ? this.courses.find((c) => c.id === exam.courseId) : undefined;

    if (!exam || !course) {
      this.errorMessage = 'Seçilen sınava ait kurs bulunamadı.';
      return;
    }

    this.submitting = true;
    this.examResultService
      .create(
        value.examId!,
        value.participantId!,
        Number(value.correctCount),
        Number(value.wrongCount),
        Number(value.totalQuestionCount),
        course.passingScore
      )
      .subscribe({
        next: () => {
          this.submitting = false;
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.message ?? 'Kaydedilirken bir hata oluştu.';
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}