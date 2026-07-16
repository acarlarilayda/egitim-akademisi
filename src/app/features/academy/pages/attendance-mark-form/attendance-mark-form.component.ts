import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceRecordService } from '../../services/attendance-record.service';
import { Lesson } from '../../models/course-module.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

/**
 * Katılım işleme formu (bkz. dokümanın 5. bölümü: "Katılım takibi: ...
 * oluşturma ... doğrulama akışlarını kapsar."). Ayrı bir route yerine
 * Kurs Detay ekranındaki Katılımcılar sekmesine gömülüdür, çünkü dokümanın
 * 6. bölümündeki route listesinde katılım takibi için ayrı bir sayfa yoktur.
 */
@Component({
  selector: 'app-attendance-mark-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './attendance-mark-form.component.html',
  styleUrl: './attendance-mark-form.component.scss',
})
export class AttendanceMarkFormComponent {
  @Input() courseId!: string;
  @Input() participantId!: string;
  @Input() lessons: Lesson[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group({
    lessonId: ['', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    attended: [true],
  });

  constructor(
    private fb: FormBuilder,
    private attendanceRecordService: AttendanceRecordService
  ) {}

  submit(): void {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();

    this.attendanceRecordService
      .create({
        courseId: this.courseId,
        participantId: this.participantId,
        lessonId: value.lessonId!,
        date: new Date(value.date!).toISOString(),
        attended: !!value.attended,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.message ?? 'Katılım kaydedilirken bir hata oluştu.';
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}