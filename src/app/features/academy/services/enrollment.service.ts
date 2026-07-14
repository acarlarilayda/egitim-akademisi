import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Enrollment } from '../models/enrollment.model';
import { EnrollmentStatus } from '../../../core/models/enums';
import { demoEnrollments } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-enrollments';

/**
 * Katılımcı Kayıt (Enrollment) CRUD işlemlerini ve kayıt durum geçişi
 * iş kurallarını yönetir. Ayrıca aynı katılımcının aynı kursa birden
 * fazla aktif kaydı olmasını engeller.
 */
@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  public enrollments$: Observable<Enrollment[]> = this.enrollmentsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoEnrollments);
    this.loadEnrollments();
  }

  private loadEnrollments(): void {
    const enrollments = this.storageService.getItem<Enrollment>(STORAGE_KEY);
    this.enrollmentsSubject.next(enrollments);
  }

  /**
   * Tüm kayıtları senkron olarak döner.
   */
  getAll(): Enrollment[] {
    return this.enrollmentsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip kaydı bulur.
   */
  getById(id: string): Enrollment | undefined {
    return this.enrollmentsSubject.value.find((enrollment) => enrollment.id === id);
  }

  /**
   * Yeni bir kayıt oluşturur. Aynı katılımcının aynı kursta zaten aktif
   * (Pending, Approved veya Active durumunda) bir kaydı varsa, yeni kayıt
   * oluşturulmasına izin verilmez.
   */
  create(courseId: string, participantId: string): Enrollment {
    const activeStatuses = [
      EnrollmentStatus.Pending,
      EnrollmentStatus.Approved,
      EnrollmentStatus.Active,
    ];

    const hasActiveEnrollment = this.enrollmentsSubject.value.some(
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

    const updatedEnrollments = [...this.enrollmentsSubject.value, newEnrollment];
    this.storageService.setItem(STORAGE_KEY, updatedEnrollments);
    this.enrollmentsSubject.next(updatedEnrollments);

    return newEnrollment;
  }

  /**
   * Kayıt durumunu değiştirir. İzin verilen geçişler:
   * Pending -> Approved -> Active -> (Completed | Cancelled)
   * Ayrıca Pending veya Approved durumundan doğrudan Cancelled'a geçilebilir.
   */
  changeStatus(id: string, newStatus: EnrollmentStatus): Enrollment {
    const enrollment = this.getById(id);
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

    const updatedEnrollments = this.enrollmentsSubject.value.map((e) =>
      e.id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e
    );

    this.storageService.setItem(STORAGE_KEY, updatedEnrollments);
    this.enrollmentsSubject.next(updatedEnrollments);

    return updatedEnrollments.find((e) => e.id === id)!;
  }
}