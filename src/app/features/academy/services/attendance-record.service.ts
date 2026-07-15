import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { AttendanceRecord } from '../models/attendance-record.model';
import { demoAttendanceRecords } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-attendance-records';

/**
 * Katılım Kaydı (AttendanceRecord) CRUD işlemlerini yönetir.
 * Ayrıca bir katılımcının bir kurstaki toplam katılım oranını hesaplar.
 * CRUD/sorgu metodları mock API üzerinden asenkron çalışır; katılım oranı
 * hesaplaması ise zaten yüklenmiş veri üzerinde çalışan senkron bir
 * computed selector'dır (bkz. proje kabul kriterleri).
 */
@Injectable({
  providedIn: 'root',
})
export class AttendanceRecordService extends AsyncEntityService<AttendanceRecord> {
  readonly attendanceRecords$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoAttendanceRecords);
  }

  /**
   * Belirtilen katılımcının belirtilen kurstaki tüm katılım kayıtlarını
   * asenkron olarak döner.
   */
  getByCourseAndParticipant(courseId: string, participantId: string): Observable<AttendanceRecord[]> {
    return this.runAsync(() => this.getByCourseAndParticipantSync(courseId, participantId));
  }

  private getByCourseAndParticipantSync(courseId: string, participantId: string): AttendanceRecord[] {
    return this.getAllSync().filter(
      (record) => record.courseId === courseId && record.participantId === participantId
    );
  }

  /**
   * Yeni bir katılım kaydı oluşturur.
   */
  create(recordData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Observable<AttendanceRecord> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newRecord: AttendanceRecord = {
        ...recordData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newRecord]);
      return newRecord;
    });
  }

  /**
   * Bir katılımcının bir kurstaki katılım oranını yüzde olarak hesaplar.
   * (katıldığı oturum sayısı / toplam oturum sayısı) * 100
   * Hiç kayıt yoksa 0 döner. Zaten bellekte yüklü olan veri üzerinde
   * çalıştığı için senkrondur (computed selector).
   */
  calculateAttendanceRate(courseId: string, participantId: string): number {
    const records = this.getByCourseAndParticipantSync(courseId, participantId);

    if (records.length === 0) {
      return 0;
    }

    const attendedCount = records.filter((record) => record.attended).length;
    return Math.round((attendedCount / records.length) * 100);
  }
}