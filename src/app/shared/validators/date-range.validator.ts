import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Form group seviyesinde kullanılan çapraz alan (cross-field) validator'ı.
 * Belirtilen bitiş tarihi alanının, başlangıç tarihi alanından sonra
 * olmasını zorunlu kılar.
 */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;

    if (!start || !end) {
      return null;
    }

    return new Date(end) > new Date(start) ? null : { dateRange: true };
  };
}