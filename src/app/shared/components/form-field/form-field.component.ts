import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

/**
 * Reactive Forms için yeniden kullanılabilir form alanı sarmalayıcısı.
 * Label, input (ng-content ile projekte edilir) ve validasyon hata
 * mesajını tek bir yerden yönetir. Kullanım:
 *
 * <app-form-field label="Kurs Adı" [control]="form.get('title')"
 *   [errorMessages]="{ required: 'Zorunlu alan.' }">
 *   <input formControlName="title" />
 * </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() control: AbstractControl | null = null;
  /** validator adı -> gösterilecek Türkçe hata mesajı eşlemesi. */
  @Input() errorMessages: Record<string, string> = {};

  get showError(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  get errorMessage(): string | null {
    if (!this.control?.errors) {
      return null;
    }
    const firstErrorKey = Object.keys(this.control.errors)[0];
    return this.errorMessages[firstErrorKey] ?? 'Geçersiz değer.';
  }
}