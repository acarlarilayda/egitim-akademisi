import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Sadece boşluk karakterlerinden oluşan girdileri geçersiz sayar
 * (örn. kullanıcı sadece boşluk tuşuna basıp "zorunlu alan" kontrolünü
 * atlatamaz).
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    const isWhitespaceOnly = value.length > 0 && value.trim().length === 0;
    return isWhitespaceOnly ? { whitespace: true } : null;
  };
}