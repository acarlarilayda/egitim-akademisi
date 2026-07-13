import { BaseModel } from '../../../core/models/base.model';

/**
 * Katılım Kaydı (AttendanceRecord) modeli.
 * Bir katılımcının bir kurs oturumundaki (ders/lesson bazlı) katılım
 * durumunu temsil eder. Sertifika uygunluğu hesaplanırken bu kayıtlardan
 * toplam katılım oranı çıkarılır.
 */
export interface AttendanceRecord extends BaseModel {
  courseId: string;
  participantId: string;
  lessonId: string;
  attended: boolean;
  date: string;
}