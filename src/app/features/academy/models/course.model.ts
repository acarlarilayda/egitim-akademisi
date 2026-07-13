import { BaseModel } from '../../../core/models/base.model';
import { CourseStatus } from '../../../core/models/enums';

/**
 * Kurs (Course) modeli.
 * Sistemdeki her kursun ana veri nesnesidir.
 * BaseModel'i extends ederek id, createdAt, updatedAt alanlarını otomatik alıyoruz.
 */
export interface Course extends BaseModel {
  title: string;
  description: string;
  status: CourseStatus;
  capacity: number;
  instructorId: string;
  passingScore: number;
  startDate: string;
  endDate: string;
}