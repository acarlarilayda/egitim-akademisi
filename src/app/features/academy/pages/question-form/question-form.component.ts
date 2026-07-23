import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

/** En az `min` eleman şartını kontrol eden FormArray validator'ı. */
function minOptionsValidator(min: number): ValidatorFn {
  return (control): ValidationErrors | null => {
    const array = control as FormArray;
    return array.length >= min ? null : { minOptions: true };
  };
}

/**
 * Soru oluşturma/düzenleme formu (bkz. dokümanın 5. bölümü: "Sınav ve soru
 * bankası: ... oluşturma, düzenleme ... doğrulama akışlarını kapsar.").
 * Seçenekler (options) dinamik bir FormArray'dir; en az 2, en fazla 6
 * seçenek eklenebilir. Doğru cevap, seçeneklerden biri radio ile
 * işaretlenerek belirlenir (correctOptionIndex).
 *
 * Doküman kuralı gereği ("Yayındaki sınav sorusu silinemez; pasife
 * alınabilir") bu form sadece create/update yapar; pasife alma işlemi
 * question-list.component.ts üzerinden ayrı bir confirm dialog ile yapılır.
 */
@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, AutofocusDirective],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.scss',
})
export class QuestionFormComponent implements OnChanges {
  @Input() question: Question | null = null;
  @Input() examId = '';
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;
  readonly minOptions = MIN_OPTIONS;
  readonly maxOptions = MAX_OPTIONS;

  readonly form = this.fb.group({
    text: ['', [Validators.required, noWhitespaceValidator()]],
    options: this.fb.array(
      [this.createOptionControl(), this.createOptionControl()],
      [minOptionsValidator(MIN_OPTIONS)]
    ),
    correctOptionIndex: [null as number | null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService
  ) {}

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  private createOptionControl(value = ''): FormControl {
    return this.fb.control(value, [Validators.required, noWhitespaceValidator()]);
  }

  ngOnChanges(): void {
    if (this.question) {
      this.optionsArray.clear();
      this.question.options.forEach((option) => this.optionsArray.push(this.createOptionControl(option)));
      this.form.patchValue({
        text: this.question.text,
        correctOptionIndex: this.question.correctOptionIndex,
      });
    } else {
      this.optionsArray.clear();
      this.optionsArray.push(this.createOptionControl());
      this.optionsArray.push(this.createOptionControl());
      this.form.reset({ text: '', correctOptionIndex: null });
    }
  }

  get isEditMode(): boolean {
    return !!this.question;
  }

  addOption(): void {
    if (this.optionsArray.length < MAX_OPTIONS) {
      this.optionsArray.push(this.createOptionControl());
    }
  }

  removeOption(index: number): void {
    if (this.optionsArray.length <= MIN_OPTIONS) {
      return;
    }
    this.optionsArray.removeAt(index);

    const correctIndex = this.form.get('correctOptionIndex')?.value;
    if (correctIndex === index) {
      this.form.patchValue({ correctOptionIndex: null });
    } else if (correctIndex !== null && correctIndex !== undefined && correctIndex > index) {
      this.form.patchValue({ correctOptionIndex: correctIndex - 1 });
    }
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
      examId: this.examId,
      text: value.text!.trim(),
      options: (value.options as string[]).map((option) => option.trim()),
      correctOptionIndex: Number(value.correctOptionIndex),
    };

    const request$ = this.isEditMode
      ? this.questionService.update(this.question!.id, payload)
      : this.questionService.create(payload);

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