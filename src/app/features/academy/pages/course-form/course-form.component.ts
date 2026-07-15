import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { Instructor } from '../../models/instructor.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';
import { positiveNumberValidator } from '../../../../shared/validators/positive-number.validator';
import { dateRangeValidator } from '../../../../shared/validators/date-range.validator';

/**
 * Kurs oluşturma/düzenleme formu. `course` input'u dolu geldiğinde
 * düzenleme (update), boş/null geldiğinde oluşturma (create) modunda
 * çalışır — aynı form, aynı validasyon kuralları her iki akışta da geçerli.
 */
@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss',
})
export class CourseFormComponent implements OnChanges {
  @Input() course: Course | null = null;
  @Input() instructors: Instructor[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group(
    {
      title: ['', [Validators.required, noWhitespaceValidator()]],
      description: ['', [Validators.required, noWhitespaceValidator()]],
      instructorId: ['', Validators.required],
      capacity: [null as number | null, [Validators.required, positiveNumberValidator()]],
      passingScore: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    },
    { validators: dateRangeValidator('startDate', 'endDate') }
  );

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {}

  ngOnChanges(): void {
    if (this.course) {
      this.form.patchValue({
        title: this.course.title,
        description: this.course.description,
        instructorId: this.course.instructorId,
        capacity: this.course.capacity,
        passingScore: this.course.passingScore,
        startDate: this.course.startDate.substring(0, 10),
        endDate: this.course.endDate.substring(0, 10),
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.course;
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
      title: value.title!.trim(),
      description: value.description!.trim(),
      instructorId: value.instructorId!,
      capacity: Number(value.capacity),
      passingScore: Number(value.passingScore),
      startDate: new Date(value.startDate!).toISOString(),
      endDate: new Date(value.endDate!).toISOString(),
    };

    const request$ = this.isEditMode
      ? this.courseService.update(this.course!.id, payload)
      : this.courseService.create(payload);

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