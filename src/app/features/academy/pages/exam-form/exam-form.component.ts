import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam.model';
import { Course } from '../../models/course.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';
import { positiveNumberValidator } from '../../../../shared/validators/positive-number.validator';

/**
 * Sınav oluşturma/düzenleme formu (bkz. dokümanın 5. bölümü:
 * "Sınav ve soru bankası: ... oluşturma, düzenleme ... doğrulama akışlarını kapsar.").
 * Geçme notu Course modelinde kurs bazında tanımlı olduğundan (10. bölüm),
 * burada tekrar sorulmaz.
 */
@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, AutofocusDirective],
  templateUrl: './exam-form.component.html',
  styleUrl: './exam-form.component.scss',
})
export class ExamFormComponent implements OnChanges {
  @Input() exam: Exam | null = null;
  @Input() courses: Course[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group({
    courseId: ['', Validators.required],
    title: ['', [Validators.required, noWhitespaceValidator()]],
    durationMinutes: [null as number | null, [Validators.required, positiveNumberValidator()]],
  });

  constructor(
    private fb: FormBuilder,
    private examService: ExamService
  ) {}

  ngOnChanges(): void {
    if (this.exam) {
      this.form.patchValue({
        courseId: this.exam.courseId,
        title: this.exam.title,
        durationMinutes: this.exam.durationMinutes,
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.exam;
  }

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();
    const payload = {
      courseId: value.courseId!,
      title: value.title!.trim(),
      durationMinutes: Number(value.durationMinutes),
    };

    const request$ = this.isEditMode
      ? this.examService.update(this.exam!.id, payload)
      : this.examService.create(payload);

    request$.subscribe({
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