import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { CertificateEligibility } from '../models/certificate-eligibility.model';
import { CertificateEligibilityStatus } from '../../../core/models/enums';
import { demoCertificateEligibilities } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-certificate-eligibilities';

/**
 * Sertifika Uygunluğu (CertificateEligibility) CRUD işlemlerini yönetir.
 * "Eligible" durumuna geçebilmek için katılım oranı VE sınav başarı
 * şartının birlikte sağlanması gerekir.
 */
@Injectable({
  providedIn: 'root',
})
export class CertificateEligibilityService {
  private eligibilitiesSubject = new BehaviorSubject<CertificateEligibility[]>([]);
  public eligibilities$: Observable<CertificateEligibility[]> = this.eligibilitiesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoCertificateEligibilities);
    this.loadEligibilities();
  }

  private loadEligibilities(): void {
    const eligibilities = this.storageService.getItem<CertificateEligibility>(STORAGE_KEY);
    this.eligibilitiesSubject.next(eligibilities);
  }

  /**
   * Tüm sertifika uygunluklarını senkron olarak döner.
   */
  getAll(): CertificateEligibility[] {
    return this.eligibilitiesSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip kaydı bulur.
   */
  getById(id: string): CertificateEligibility | undefined {
    return this.eligibilitiesSubject.value.find((eligibility) => eligibility.id === id);
  }

  /**
   * Belirtilen katılımcının belirtilen kurstaki sertifika uygunluk kaydını bulur.
   */
  getByCourseAndParticipant(courseId: string, participantId: string): CertificateEligibility | undefined {
    return this.eligibilitiesSubject.value.find(
      (eligibility) => eligibility.courseId === courseId && eligibility.participantId === participantId
    );
  }

  /**
   * Bir katılımcının bir kurs için sertifika uygunluğunu değerlendirir
   * ve kaydı oluşturur/günceller. "Eligible" durumuna geçebilmesi için
   * katılım oranının minimum eşiği (%80) VE sınavı geçmiş olması
   * birlikte sağlanmalıdır.
   *
   * @param courseId Kurs ID'si
   * @param participantId Katılımcı ID'si
   * @param attendanceRate Hesaplanmış katılım oranı (0-100)
   * @param examPassed Katılımcının sınavı geçip geçmediği
   */
  evaluate(
    courseId: string,
    participantId: string,
    attendanceRate: number,
    examPassed: boolean
  ): CertificateEligibility {
    const MINIMUM_ATTENDANCE_RATE = 80;
    const isEligible = attendanceRate >= MINIMUM_ATTENDANCE_RATE && examPassed;

    const existing = this.getByCourseAndParticipant(courseId, participantId);
    const now = new Date().toISOString();

    if (existing) {
      const updatedEligibility: CertificateEligibility = {
        ...existing,
        attendanceRate,
        examPassed,
        status: isEligible ? CertificateEligibilityStatus.Eligible : CertificateEligibilityStatus.Pending,
        updatedAt: now,
      };

      const updatedList = this.eligibilitiesSubject.value.map((e) =>
        e.id === existing.id ? updatedEligibility : e
      );
      this.storageService.setItem(STORAGE_KEY, updatedList);
      this.eligibilitiesSubject.next(updatedList);

      return updatedEligibility;
    }

    const newEligibility: CertificateEligibility = {
      id: crypto.randomUUID(),
      courseId,
      participantId,
      attendanceRate,
      examPassed,
      status: isEligible ? CertificateEligibilityStatus.Eligible : CertificateEligibilityStatus.Pending,
      issuedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [...this.eligibilitiesSubject.value, newEligibility];
    this.storageService.setItem(STORAGE_KEY, updatedList);
    this.eligibilitiesSubject.next(updatedList);

    return newEligibility;
  }

  /**
   * Uygun (Eligible) durumdaki bir katılımcıya sertifika verir.
   * Sadece Eligible durumundaki kayıtlar için sertifika verilebilir.
   */
  issueCertificate(id: string): CertificateEligibility {
    const eligibility = this.getById(id);
    if (!eligibility) {
      throw new Error(`Sertifika uygunluk kaydı bulunamadı: ${id}`);
    }

    if (eligibility.status !== CertificateEligibilityStatus.Eligible) {
      throw new Error('Sertifika yalnızca uygun (Eligible) durumdaki katılımcılara verilebilir.');
    }

    const now = new Date().toISOString();
    const updatedList = this.eligibilitiesSubject.value.map((e) =>
      e.id === id
        ? { ...e, status: CertificateEligibilityStatus.Issued, issuedAt: now, updatedAt: now }
        : e
    );

    this.storageService.setItem(STORAGE_KEY, updatedList);
    this.eligibilitiesSubject.next(updatedList);

    return updatedList.find((e) => e.id === id)!;
  }
}