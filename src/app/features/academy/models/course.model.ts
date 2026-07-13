import { BaseModel } from '../../../core/models/base.model';
import { CourseStatus } from '../../../core/models/enums';

/**
 * Kurs (Course) modeli.
 * Doküman Madde 7: "İlgili modülün ana veri nesnesidir; id, createdAt, updatedAt alanları bulunmalıdır."
 * BaseModel'i extends ederek bu ortak alanları otomatik alıyoruz.
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