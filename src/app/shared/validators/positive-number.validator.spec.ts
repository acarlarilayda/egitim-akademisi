import { FormControl } from '@angular/forms';
import { positiveNumberValidator } from './positive-number.validator';

describe('positiveNumberValidator', () => {
  const validator = positiveNumberValidator();

  it('boş değeri (null/undefined/"") geçerli sayar — required validator zaten bunu yakalar', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(undefined))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('0 veya negatif bir sayıyı geçersiz sayar', () => {
    expect(validator(new FormControl(0))).toEqual({ notPositive: true });
    expect(validator(new FormControl(-5))).toEqual({ notPositive: true });
  });

  it('pozitif bir sayıyı geçerli sayar', () => {
    expect(validator(new FormControl(25))).toBeNull();
  });

  it('string olarak gelen pozitif bir sayıyı da geçerli sayar (form input değerleri string gelebilir)', () => {
    expect(validator(new FormControl('10'))).toBeNull();
  });
});