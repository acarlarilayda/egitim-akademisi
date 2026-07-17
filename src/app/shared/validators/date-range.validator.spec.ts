import { FormGroup, FormControl } from '@angular/forms';
import { dateRangeValidator } from './date-range.validator';

describe('dateRangeValidator', () => {
  const validator = dateRangeValidator('startDate', 'endDate');

  function buildGroup(startDate: string | null, endDate: string | null): FormGroup {
    return new FormGroup({
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
    });
  }

  it('bitis tarihi baslangictan sonraysa gecerli sayar', () => {
    const group = buildGroup('2026-03-01', '2026-04-15');
    expect(validator(group)).toBeNull();
  });

  it('bitis tarihi baslangictan onceyse gecersiz sayar', () => {
    const group = buildGroup('2026-04-15', '2026-03-01');
    expect(validator(group)).toEqual({ dateRange: true });
  });

  it('bitis tarihi baslangicla ayniysa gecersiz sayar (kesinlikle sonra olmali)', () => {
    const group = buildGroup('2026-03-01', '2026-03-01');
    expect(validator(group)).toEqual({ dateRange: true });
  });

  it('tarihlerden biri bossa henuz kontrol etmez (required validatorlar zaten yakalar)', () => {
    expect(validator(buildGroup(null, '2026-04-15'))).toBeNull();
    expect(validator(buildGroup('2026-03-01', null))).toBeNull();
  });
});