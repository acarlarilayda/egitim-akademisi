import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipantService } from '../../services/participant.service';
import { Participant } from '../../models/participant.model';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { noWhitespaceValidator } from '../../../../shared/validators/no-whitespace.validator';

/**
 * Katılımcı oluşturma/düzenleme formu. `participant` input'u dolu
 * geldiğinde düzenleme (update), boş/null geldiğinde oluşturma (create)
 * modunda çalışır.
 */
@Component({
  selector: 'app-participant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './participant-form.component.html',
  styleUrl: './participant-form.component.scss',
})
export class ParticipantFormComponent implements OnChanges {
  @Input() participant: Participant | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, noWhitespaceValidator()]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,}$/)]],
  });

  constructor(
    private fb: FormBuilder,
    private participantService: ParticipantService
  ) {}

  ngOnChanges(): void {
    if (this.participant) {
      this.form.patchValue({
        fullName: this.participant.fullName,
        email: this.participant.email,
        phone: this.participant.phone,
      });
    } else {
      this.form.reset();
    }
  }

  get isEditMode(): boolean {
    return !!this.participant;
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
      fullName: value.fullName!.trim(),
      email: value.email!.trim(),
      phone: value.phone!.trim(),
    };

    const request$ = this.isEditMode
      ? this.participantService.update(this.participant!.id, payload)
      : this.participantService.create(payload);

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