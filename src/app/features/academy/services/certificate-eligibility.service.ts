import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { CertificateEligibility } from '../models/certificate-eligibility.model';
import { CertificateEligibilityStatus } from '../../../core/models/enums';
import { demoCertificateEligibilities } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-certificate-eligibilities';

/**
 * Sertifika Uygunluğu (CertificateEligibility) CRUD işlemlerini yönetir.
 * "Eligible" durumuna geçebilmek için katılım oranı VE sınav başarı
 * şartının birlikte sağlanması gerekir. Tüm public metodlar mock API
 * üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class CertificateEligibilityService extends AsyncEntityService<CertificateEligibility> {
  readonly eligibilities$ = this.items$;

  constructor(
    storageService: StorageService,
    mockApi: MockApiService,
    private auditLogService: AuditLogService,
    private sessionService: SessionService
  ) {
    super(STORAGE_KEY, storageService, mockApi, demoCertificateEligibilities);
  }

  /**
   * Belirtilen katılımcının belirtilen kurstaki sertifika uygunluk kaydını
   * asenkron olarak bulur.
   */
  getByCourseAndParticipant(courseId: string, participantId: string): Observable<CertificateEligibility | undefined> {
    return this.runAsync(() => this.getByCourseAndParticipantSync(courseId, participantId));
  }

  private getByCourseAndParticipantSync(courseId: string, participantId: string): CertificateEligibility | undefined {
    return this.getAllSync().find(
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
  ): Observable<CertificateEligibility> {
    return this.runAsync(() => {
      const MINIMUM_ATTENDANCE_RATE = 80;
      const isEligible = attendanceRate >= MINIMUM_ATTENDANCE_RATE && examPassed;

      const existing = this.getByCourseAndParticipantSync(courseId, participantId);
      const now = new Date().toISOString();

      if (existing) {
        const updatedEligibility: CertificateEligibility = {
          ...existing,
          attendanceRate,
          examPassed,
          status: isEligible ? CertificateEligibilityStatus.Eligible : CertificateEligibilityStatus.Pending,
          updatedAt: now,
        };

        const updatedList = this.getAllSync().map((e) => (e.id === existing.id ? updatedEligibility : e));
        this.persistSync(updatedList);

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

      this.persistSync([...this.getAllSync(), newEligibility]);
      return newEligibility;
    });
  }

  /**
   * Uygun (Eligible) durumdaki bir katılımcıya sertifika verir.
   * Sadece Eligible durumundaki kayıtlar için sertifika verilebilir.
   * Bu, geri döndürülemez ve kritik bir işlem olduğu için audit log'a düşer.
   */
  issueCertificate(id: string): Observable<CertificateEligibility> {
    return this.runAsync(() => {
      const eligibility = this.getByIdSync(id);
      if (!eligibility) {
        throw new Error(`Sertifika uygunluk kaydı bulunamadı: ${id}`);
      }

      if (eligibility.status !== CertificateEligibilityStatus.Eligible) {
        throw new Error('Sertifika yalnızca uygun (Eligible) durumdaki katılımcılara verilebilir.');
      }

      const now = new Date().toISOString();
      const updatedList = this.getAllSync().map((e) =>
        e.id === id
          ? { ...e, status: CertificateEligibilityStatus.Issued, issuedAt: now, updatedAt: now }
          : e
      );
      this.persistSync(updatedList);

      return updatedList.find((e) => e.id === id)!;
    }).pipe(
      switchMap((eligibility) => {
        const activeUser = this.sessionService.currentUser();
        return this.auditLogService
          .log({
            entityType: 'CertificateEligibility',
            entityId: id,
            action: 'CERTIFICATE_ISSUED',
            performedByUserId: activeUser.id,
            performedByRole: activeUser.role,
            description: 'Katılımcıya sertifika verildi',
            oldValue: CertificateEligibilityStatus.Eligible,
            newValue: CertificateEligibilityStatus.Issued,
          })
          .pipe(map(() => eligibility));
      })
    );
  }
}