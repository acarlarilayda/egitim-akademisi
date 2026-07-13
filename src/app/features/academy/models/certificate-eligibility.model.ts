import { BaseModel } from '../../../core/models/base.model';
import { CertificateEligibilityStatus } from '../../../core/models/enums';

/**
 * Sertifika Uygunluğu (CertificateEligibility) modeli.
 * Bir katılımcının bir kurs için sertifika almaya uygun olup olmadığını
 * temsil eder. "Eligible" durumuna geçebilmesi için katılım oranı VE
 * sınav başarı şartı birlikte sağlanmalıdır.
 */
export interface CertificateEligibility extends BaseModel {
  courseId: string;
  participantId: string;
  attendanceRate: number;
  examPassed: boolean;
  status: CertificateEligibilityStatus;
  issuedAt: string | null;
}