import { BaseModel } from '../../../core/models/base.model';

/**
 * Sınav (Exam) modeli.
 * Bir kursa bağlı sınavı temsil eder. Geçme notu Course modelinde
 * kurs bazında tanımlanır; burada tekrar tutulmaz.
 */
export interface Exam extends BaseModel {
  courseId: string;
  title: string;
  durationMinutes: number;
}