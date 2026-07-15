import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Değerin 0'dan büyük bir sayı olmasını zorunlu kılar (örn. kontenjan). */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return Number(value) > 0 ? null : { notPositive: true };
  };
}