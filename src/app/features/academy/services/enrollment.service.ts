import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { Enrollment } from '../models/enrollment.model';
import { EnrollmentStatus } from '../../../core/models/enums';
import { demoEnrollments } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-enrollments';

/**
 * Katılımcı Kayıt (Enrollment) CRUD işlemlerini ve kayıt durum geçişi
 * iş kurallarını yönetir. Ayrıca aynı katılımcının aynı kursa birden
 * fazla aktif kaydı olmasını engeller. Tüm public metodlar mock API
 * üzerinden asenkron çalışır (bkz. AsyncEntityService).
 */
@Injectable({
  providedIn: 'root',
})
export class EnrollmentService extends AsyncEntityService<Enrollment> {
  readonly enrollments$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoEnrollments);
  }

  /**
   * Yeni bir kayıt oluşturur. Aynı katılımcının aynı kursta zaten aktif
   * (Pending, Approved veya Active durumunda) bir kaydı varsa, yeni kayıt
   * oluşturulmasına izin verilmez.
   */
  create(courseId: string, participantId: string): Observable<Enrollment> {
    return this.runAsync(() => {
      const activeStatuses = [
        EnrollmentStatus.Pending,
        EnrollmentStatus.Approved,
        EnrollmentStatus.Active,
      ];

      const hasActiveEnrollment = this.getAllSync().some(
        (enrollment) =>
          enrollment.courseId === courseId &&
          enrollment.participantId === participantId &&
          activeStatuses.includes(enrollment.status)
      );

      if (hasActiveEnrollment) {
        throw new Error('Bu katılımcının bu kursta zaten aktif bir kaydı var.');
      }

      const now = new Date().toISOString();
      const newEnrollment: Enrollment = {
        id: crypto.randomUUID(),
        courseId,
        participantId,
        status: EnrollmentStatus.Pending,
        enrolledAt: now,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newEnrollment]);
      return newEnrollment;
    });
  }

  /**
   * Kayıt durumunu değiştirir. İzin verilen geçişler:
   * Pending -> Approved -> Active -> (Completed | Cancelled)
   * Ayrıca Pending veya Approved durumundan doğrudan Cancelled'a geçilebilir.
   */
  changeStatus(id: string, newStatus: EnrollmentStatus): Observable<Enrollment> {
    return this.runAsync(() => {
      const enrollment = this.getByIdSync(id);
      if (!enrollment) {
        throw new Error(`Kayıt bulunamadı: ${id}`);
      }

      const allowedTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
        [EnrollmentStatus.Pending]: [EnrollmentStatus.Approved, EnrollmentStatus.Cancelled],
        [EnrollmentStatus.Approved]: [EnrollmentStatus.Active, EnrollmentStatus.Cancelled],
        [EnrollmentStatus.Active]: [EnrollmentStatus.Completed, EnrollmentStatus.Cancelled],
        [EnrollmentStatus.Completed]: [],
        [EnrollmentStatus.Cancelled]: [],
      };

      const isAllowed = allowedTransitions[enrollment.status].includes(newStatus);
      if (!isAllowed) {
        throw new Error(`Geçersiz durum geçişi: ${enrollment.status} -> ${newStatus}`);
      }

      const updatedEnrollments = this.getAllSync().map((e) =>
        e.id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e
      );
      this.persistSync(updatedEnrollments);

      return updatedEnrollments.find((e) => e.id === id)!;
    });
  }
}