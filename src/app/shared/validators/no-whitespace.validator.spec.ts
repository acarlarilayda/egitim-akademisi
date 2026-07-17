import { FormControl } from '@angular/forms';
import { noWhitespaceValidator } from './no-whitespace.validator';

describe('noWhitespaceValidator', () => {
  const validator = noWhitespaceValidator();

  it('sadece boşluklardan oluşan bir değeri geçersiz sayar', () => {
    const control = new FormControl('   ');
    expect(validator(control)).toEqual({ whitespace: true });
  });

  it('boş string değerini geçerli sayar (required validator zaten bunu yakalar)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('gerçek içerik barındıran bir değeri geçerli sayar', () => {
    const control = new FormControl('Angular ile Modern Web Geliştirme');
    expect(validator(control)).toBeNull();
  });

  it('başında/sonunda boşluk olsa bile içeriği olan değeri geçerli sayar', () => {
    const control = new FormControl('  Kurs Adı  ');
    expect(validator(control)).toBeNull();
  });
});