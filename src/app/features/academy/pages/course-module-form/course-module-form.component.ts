import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseModuleService } from '../../services/course-module.service';
import { CourseModule } from '../../models/course-module.model';
import { Course } from '../../models/course.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';
import { positiveNumberValidator } from '../../../../shared/validators/positive-number.validator';

/**
 * Ders modülü oluşturma/düzenleme formu (bkz. dokümanın 5. bölümü:
 * "Ders/modül yönetimi: ... oluşturma, düzenleme ... doğrulama akışlarını kapsar.").
 * `courseModule` input'u dolu geldiğinde düzenleme, boş geldiğinde
 * oluşturma modunda çalışır.
 */
@Component({
  selector: 'app-course-module-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './course-module-form.component.html',
  styleUrl: './course-module-form.component.scss',
})
export class CourseModuleFormComponent implements OnChanges {
  @Input() courseModule: CourseModule | null = null;
  @Input() courses: Course[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group({
    courseId: ['', Validators.required],
    title: ['', [Validators.required, noWhitespaceValidator()]],
    order: [null as number | null, [Validators.required, positiveNumberValidator()]],
  });

  constructor(
    private fb: FormBuilder,
    private courseModuleService: CourseModuleService
  ) {}

  ngOnChanges(): void {
    if (this.courseModule) {
      this.form.patchValue({
        courseId: this.courseModule.courseId,
        title: this.courseModule.title,
        order: this.courseModule.order,
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.courseModule;
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
      order: Number(value.order),
    };

    const request$ = this.isEditMode
      ? this.courseModuleService.update(this.courseModule!.id, payload)
      : this.courseModuleService.create(payload);

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