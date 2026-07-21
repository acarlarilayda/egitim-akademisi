import { fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { ExamResultService } from './exam-result.service';
import { UserRole } from '../../../core/models/enums';

/**
 * ExamResultService.create, sinav sonucu puanlamasini (score, isPassed)
 * ve "Egitmen sadece kendi kurslarinin sonuclarini duzenleyebilir" yetki
 * kuralini dogrular.
 *
 * MockApiService gercekci bir agi simule etmek icin gecikme + %5 rastgele
 * hata icerir (bkz. mock-api.service.ts). Bu yuzden testler `fakeAsync`/
 * `tick` ile deterministik hale getirilir ve `Math.random` sabitlenerek
 * rastgele hata varsayilan olarak devre disi birakilir; sadece ilgili
 * testte bilincli olarak tetiklenir (bkz. "mock API hatasi" testi).
 */
describe('ExamResultService', () => {
  const RESULTS_KEY = 'academy-exam-results';
  let storageService: StorageService;
  let sessionService: SessionService;

  beforeEach(() => {
    localStorage.clear();
    spyOn(Math, 'random').and.returnValue(0.9); // errorRate (%5) tetiklenmesin
    storageService = new StorageService();
    sessionService = new SessionService();
  });

  function buildService(): ExamResultService {
    storageService.setItem(RESULTS_KEY, []);
    const mockApi = new MockApiService();
    const auditLogService = new AuditLogService(storageService, mockApi);
    return new ExamResultService(storageService, mockApi, auditLogService, sessionService);
  }

  describe('puan ve gecme durumu hesaplamasi', () => {
    it('gecme notunun ustunde puan alaninda isPassed true doner', fakeAsync(() => {
      const service = buildService();
      let result: { score: number; isPassed: boolean } | undefined;

      service.create('exam-1', 'participant-1', 8, 2, 10, 60, 'inst-1').subscribe((r) => (result = r));
      tick(1000);

      expect(result?.score).toBe(80);
      expect(result?.isPassed).toBeTrue();
    }));

    it('gecme notunun altinda puan alaninda isPassed false doner', fakeAsync(() => {
      const service = buildService();
      let result: { score: number; isPassed: boolean } | undefined;

      service.create('exam-1', 'participant-1', 4, 6, 10, 60, 'inst-1').subscribe((r) => (result = r));
      tick(1000);

      expect(result?.score).toBe(40);
      expect(result?.isPassed).toBeFalse();
    }));

    it('puan tam gecme notuna esitse isPassed true doner (sinir degeri)', fakeAsync(() => {
      const service = buildService();
      let result: { score: number; isPassed: boolean } | undefined;

      service.create('exam-1', 'participant-1', 6, 4, 10, 60, 'inst-1').subscribe((r) => (result = r));
      tick(1000);

      expect(result?.score).toBe(60);
      expect(result?.isPassed).toBeTrue();
    }));
  });

  describe('"Egitmen sadece kendi kurslarinin sonuclarini girebilir" kurali', () => {
    it('Egitim Yoneticisi, instructorId eslesmese bile sonuc girebilir', fakeAsync(() => {
      sessionService.setRole(UserRole.EgitimYoneticisi);
      const service = buildService();
      let result: unknown;
      let errored = false;

      service.create('exam-1', 'participant-1', 5, 5, 10, 50, 'baska-bir-egitmenin-id').subscribe({
        next: (r) => (result = r),
        error: () => (errored = true),
      });
      tick(1000);

      expect(errored).toBeFalse();
      expect(result).toBeTruthy();
    }));

    it('Egitmen, kendi kursu olmayan bir sinavin sonucunu giremez (hata senaryosu)', fakeAsync(() => {
      sessionService.setRole(UserRole.Egitmen);
      const service = buildService();
      let error: Error | undefined;

      service.create('exam-1', 'participant-1', 5, 5, 10, 50, 'baska-bir-egitmenin-id').subscribe({
        next: () => fail('basari beklenmiyordu, yetki hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('yetkiniz yok');
      expect(storageService.getItem(RESULTS_KEY).length).toBe(0);
    }));

    it('Egitmen, kendi kursunun sonucunu girebilir', fakeAsync(() => {
      sessionService.setRole(UserRole.Egitmen);
      const ownInstructorId = sessionService.currentUser().instructorId!;
      const service = buildService();
      let result: { isPassed: boolean } | undefined;

      service.create('exam-1', 'participant-1', 7, 3, 10, 50, ownInstructorId).subscribe((r) => (result = r));
      tick(1000);

      expect(result?.isPassed).toBeTrue();
      expect(storageService.getItem(RESULTS_KEY).length).toBe(1);
    }));
  });

  describe('mock API hata simulasyonu (agi/sunucu hatasi senaryosu)', () => {
    it('rastgele bir sunucu hatasi olustugunda hata abonelere iletilir ve kayit olusturulmaz', fakeAsync(() => {
      (Math.random as jasmine.Spy).and.returnValue(0.01); // errorRate (%5) altinda -> hata simule edilir
      sessionService.setRole(UserRole.EgitimYoneticisi);
      const service = buildService();
      let error: Error | undefined;

      service.create('exam-1', 'participant-1', 5, 5, 10, 50, 'inst-1').subscribe({
        next: () => fail('basari beklenmiyordu, sunucu hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error).toBeTruthy();
      expect(storageService.getItem(RESULTS_KEY).length).toBe(0);
    }));
  });
});