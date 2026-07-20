import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AttendanceRecordService } from './attendance-record.service';
import { AttendanceRecord } from '../models/attendance-record.model';

/**
 * calculateAttendanceRate, sertifika uygunlugu degerlendirmesinde
 * kullanilan kritik bir hesaplama fonksiyonudur. localStorage dogrudan
 * seed edilerek servis kontrollu bir veri kumesiyle baslatilir; asenkron
 * create/update akisina gerek yoktur cunku fonksiyon zaten yuklu veri
 * uzerinde senkron calisir.
 */
describe('AttendanceRecordService - calculateAttendanceRate', () => {
  const STORAGE_KEY = 'academy-attendance-records';
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  function buildService(records: AttendanceRecord[]): AttendanceRecordService {
    storageService.setItem(STORAGE_KEY, records);
    return new AttendanceRecordService(storageService, new MockApiService());
  }

  function buildRecord(attended: boolean, courseId = 'course-1', participantId = 'participant-1'): AttendanceRecord {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      courseId,
      participantId,
      lessonId: crypto.randomUUID(),
      attended,
      date: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  it('hic kayit yoksa 0 doner', () => {
    const service = buildService([]);
    expect(service.calculateAttendanceRate('course-1', 'participant-1')).toBe(0);
  });

  it('tum oturumlara katilmissa 100 doner', () => {
    const service = buildService([buildRecord(true), buildRecord(true), buildRecord(true)]);
    expect(service.calculateAttendanceRate('course-1', 'participant-1')).toBe(100);
  });

  it('kismi katilimda dogru yuzdeyi hesaplar (2/4 oturum = 50)', () => {
    const service = buildService([
      buildRecord(true),
      buildRecord(true),
      buildRecord(false),
      buildRecord(false),
    ]);
    expect(service.calculateAttendanceRate('course-1', 'participant-1')).toBe(50);
  });

  it('farkli kurs/katilimci kombinasyonlarina ait kayitlari hesaba katmaz', () => {
    const service = buildService([
      buildRecord(true, 'course-1', 'participant-1'),
      buildRecord(false, 'course-2', 'participant-1'),
      buildRecord(false, 'course-1', 'participant-2'),
    ]);
    expect(service.calculateAttendanceRate('course-1', 'participant-1')).toBe(100);
  });
});