import { BaseModel } from '../../../core/models/base.model';
import { EnrollmentStatus } from '../../../core/models/enums';

/**
 * Katılımcı Kayıt (Enrollment) modeli.
 * Bir katılımcının bir kursa kaydını temsil eder — Course ve Participant'ı birbirine bağlar.
 * Bir katılımcının aynı kursta aynı anda birden fazla aktif kaydı olamaz.
 */
export interface Enrollment extends BaseModel {
  courseId: string;
  participantId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}