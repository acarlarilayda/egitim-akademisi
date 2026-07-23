import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceRecordService } from '../../services/attendance-record.service';
import { AttendanceRecord } from '../../models/attendance-record.model';
import { Lesson } from '../../models/course-module.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
/**
 * Katılım işleme formu. Ayrı bir route yerine Kurs Detay ekranındaki
 * Katılımcılar sekmesine gömülüdür.
 *
 * Sadece yeni kayıt ekleme formu değil, katılımcının o kurstaki mevcut
 * katılım geçmişini de gösterir; aksi halde kayıtlar (sertifika uygunluğu
 * hesaplamasında kullanılsa da) kullanıcı arayüzünde hiç görünür olmazdı.
 */
@Component({
  selector: 'app-attendance-mark-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, EmptyStateComponent, AutofocusDirective],
  templateUrl: './attendance-mark-form.component.html',
  styleUrl: './attendance-mark-form.component.scss',
})
export class AttendanceMarkFormComponent implements OnInit {
  @Input() courseId!: string;
  @Input() participantId!: string;
  @Input() lessons: Lesson[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  existingRecords: AttendanceRecord[] = [];
  loadingRecords = false;

  readonly form = this.fb.group({
    lessonId: ['', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    attended: [true],
  });

  constructor(
    private fb: FormBuilder,
    private attendanceRecordService: AttendanceRecordService
  ) {}

  ngOnInit(): void {
    this.loadingRecords = true;
    this.attendanceRecordService.getByCourseAndParticipant(this.courseId, this.participantId).subscribe({
      next: (records) => {
        this.existingRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
        this.loadingRecords = false;
      },
      error: () => {
        this.loadingRecords = false;
      },
    });
  }

  /** Bir lessonId'ye karşılık gelen ders başlığını döner. */
  lessonTitle(lessonId: string): string {
    return this.lessons.find((lesson) => lesson.id === lessonId)?.title ?? lessonId;
  }

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