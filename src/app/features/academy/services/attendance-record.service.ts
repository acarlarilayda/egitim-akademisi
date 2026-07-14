import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { AttendanceRecord } from '../models/attendance-record.model';
import { demoAttendanceRecords } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-attendance-records';

/**
 * Katılım Kaydı (AttendanceRecord) CRUD işlemlerini yönetir.
 * Ayrıca bir katılımcının bir kurstaki toplam katılım oranını hesaplar.
 */
@Injectable({
  providedIn: 'root',
})
export class AttendanceRecordService {
  private attendanceRecordsSubject = new BehaviorSubject<AttendanceRecord[]>([]);
  public attendanceRecords$: Observable<AttendanceRecord[]> = this.attendanceRecordsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoAttendanceRecords);
    this.loadAttendanceRecords();
  }

  private loadAttendanceRecords(): void {
    const records = this.storageService.getItem<AttendanceRecord>(STORAGE_KEY);
    this.attendanceRecordsSubject.next(records);
  }

  /**
   * Tüm katılım kayıtlarını senkron olarak döner.
   */
  getAll(): AttendanceRecord[] {
    return this.attendanceRecordsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip kaydı bulur.
   */
  getById(id: string): AttendanceRecord | undefined {
    return this.attendanceRecordsSubject.value.find((record) => record.id === id);
  }

  /**
   * Belirtilen katılımcının belirtilen kurstaki tüm katılım kayıtlarını döner.
   */
  getByCourseAndParticipant(courseId: string, participantId: string): AttendanceRecord[] {
    return this.attendanceRecordsSubject.value.filter(
      (record) => record.courseId === courseId && record.participantId === participantId
    );
  }

  /**
   * Yeni bir katılım kaydı oluşturur.
   */
  create(recordData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const now = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedRecords = [...this.attendanceRecordsSubject.value, newRecord];
    this.storageService.setItem(STORAGE_KEY, updatedRecords);
    this.attendanceRecordsSubject.next(updatedRecords);

    return newRecord;
  }

  /**
   * Bir katılımcının bir kurstaki katılım oranını yüzde olarak hesaplar.
   * (katıldığı oturum sayısı / toplam oturum sayısı) * 100
   * Hiç kayıt yoksa 0 döner.
   */
  calculateAttendanceRate(courseId: string, participantId: string): number {
    const records = this.getByCourseAndParticipant(courseId, participantId);

    if (records.length === 0) {
      return 0;
    }

    const attendedCount = records.filter((record) => record.attended).length;
    return Math.round((attendedCount / records.length) * 100);
  }
}