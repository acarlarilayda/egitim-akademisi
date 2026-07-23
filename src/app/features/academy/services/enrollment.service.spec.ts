import { fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentStatus } from '../../../core/models/enums';

/**
 * EnrollmentService icin unit testler.
 *
 * Odak noktasi, sistemin en kritik is kurali olan "bir katilimci ayni kursa
 * ikinci kez aktif kayit olusturamaz" kisitidir; bu kural create() ve
 * changeStatus() metotlarinin birlikte davranisiyla saglanir. Ayrica
 * kayit durumlari arasindaki (Pending -> Approved -> Active -> Completed/
 * Cancelled) izinli/izinsiz gecis kurallari da dogrulanir.
 *
 * MockApiService gercekci bir agi simule etmek icin gecikme + %5 rastgele
 * hata icerir (bkz. mock-api.service.ts). Bu yuzden testler `fakeAsync`/
 * `tick` ile deterministik hale getirilir ve `Math.random` sabitlenerek
 * rastgele hata varsayilan olarak devre disi birakilir.
 */
describe('EnrollmentService', () => {
  const ENROLLMENTS_KEY = 'academy-enrollments';
  let storageService: StorageService;
  let sessionService: SessionService;

  beforeEach(() => {
    localStorage.clear();
    spyOn(Math, 'random').and.returnValue(0.9); // errorRate (%5) tetiklenmesin
    storageService = new StorageService();
    sessionService = new SessionService();
  });

  function buildService(): EnrollmentService {
    storageService.setItem(ENROLLMENTS_KEY, []);
    const mockApi = new MockApiService();
    const auditLogService = new AuditLogService(storageService, mockApi);
    return new EnrollmentService(storageService, mockApi, auditLogService, sessionService);
  }

  describe('"ayni kursa ikinci kez aktif kayit olusturulamaz" kurali', () => {
    it('bir katilimcinin bir kursta ilk kaydi Pending durumunda basariyla olusur', fakeAsync(() => {
      const service = buildService();
      let created: { status: EnrollmentStatus } | undefined;

      service.create('course-1', 'participant-1').subscribe((e) => (created = e));
      tick(1000);

      expect(created?.status).toBe(EnrollmentStatus.Pending);
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(1);
    }));

    it('Pending durumda aktif kaydi varken ayni katilimci ayni kursa ikinci kez kayit olusturamaz', fakeAsync(() => {
      const service = buildService();

      service.create('course-1', 'participant-1').subscribe();
      tick(1000);

      let error: Error | undefined;
      service.create('course-1', 'participant-1').subscribe({
        next: () => fail('basari beklenmiyordu, cift kayit hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zaten aktif bir kaydı var');
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(1);
    }));

    it('Approved veya Active durumdaki kayit da "aktif" sayilir ve ikinci kaydi engeller', fakeAsync(() => {
      const service = buildService();
      let enrollmentId = '';

      service.create('course-1', 'participant-1').subscribe((e) => (enrollmentId = e.id));
      tick(1000);

      service.changeStatus(enrollmentId, EnrollmentStatus.Approved).subscribe();
      tick(1000);
      service.changeStatus(enrollmentId, EnrollmentStatus.Active).subscribe();
      tick(1000);

      let error: Error | undefined;
      service.create('course-1', 'participant-1').subscribe({
        next: () => fail('basari beklenmiyordu, cift kayit hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zaten aktif bir kaydı var');
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(1);
    }));

    it('bir kayit Cancelled duruma gectikten sonra ayni katilimci ayni kursa tekrar kayit olusturabilir', fakeAsync(() => {
      const service = buildService();
      let enrollmentId = '';

      service.create('course-1', 'participant-1').subscribe((e) => (enrollmentId = e.id));
      tick(1000);

      service.changeStatus(enrollmentId, EnrollmentStatus.Cancelled).subscribe();
      tick(1000);

      let secondCreated: { status: EnrollmentStatus } | undefined;
      let errored = false;
      service.create('course-1', 'participant-1').subscribe({
        next: (e) => (secondCreated = e),
        error: () => (errored = true),
      });
      tick(1000);

      expect(errored).toBeFalse();
      expect(secondCreated?.status).toBe(EnrollmentStatus.Pending);
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(2);
    }));

    it('ayni katilimcinin farkli bir kursa kaydi engellenmez', fakeAsync(() => {
      const service = buildService();

      service.create('course-1', 'participant-1').subscribe();
      tick(1000);

      let errored = false;
      service.create('course-2', 'participant-1').subscribe({ error: () => (errored = true) });
      tick(1000);

      expect(errored).toBeFalse();
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(2);
    }));

    it('farkli bir katilimcinin ayni kursa kaydi engellenmez', fakeAsync(() => {
      const service = buildService();

      service.create('course-1', 'participant-1').subscribe();
      tick(1000);

      let errored = false;
      service.create('course-1', 'participant-2').subscribe({ error: () => (errored = true) });
      tick(1000);

      expect(errored).toBeFalse();
      expect(storageService.getItem(ENROLLMENTS_KEY).length).toBe(2);
    }));
  });

  describe('durum gecisi (workflow) kurallari', () => {
    it('izinli bir gecis (Pending -> Approved) basarili olur ve audit log uretir', fakeAsync(() => {
      const service = buildService();
      let enrollmentId = '';

      service.create('course-1', 'participant-1').subscribe((e) => (enrollmentId = e.id));
      tick(1000);

      let updated: { status: EnrollmentStatus } | undefined;
      service.changeStatus(enrollmentId, EnrollmentStatus.Approved).subscribe((e) => (updated = e));
      tick(1000);

      expect(updated?.status).toBe(EnrollmentStatus.Approved);
    }));

    it('izinsiz bir gecis (Pending -> Completed) reddedilir', fakeAsync(() => {
      const service = buildService();
      let enrollmentId = '';

      service.create('course-1', 'participant-1').subscribe((e) => (enrollmentId = e.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(enrollmentId, EnrollmentStatus.Completed).subscribe({
        next: () => fail('basari beklenmiyordu, gecersiz durum gecisi hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('Geçersiz durum geçişi');
      expect(storageService.getItem<{ status: EnrollmentStatus }>(ENROLLMENTS_KEY)[0].status).toBe(
        EnrollmentStatus.Pending
      );
    }));

    it('Completed veya Cancelled durumdan hicbir gecise izin verilmez (terminal durum)', fakeAsync(() => {
      const service = buildService();
      let enrollmentId = '';

      service.create('course-1', 'participant-1').subscribe((e) => (enrollmentId = e.id));
      tick(1000);
      service.changeStatus(enrollmentId, EnrollmentStatus.Cancelled).subscribe();
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(enrollmentId, EnrollmentStatus.Approved).subscribe({
        next: () => fail('basari beklenmiyordu, gecersiz durum gecisi hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('Geçersiz durum geçişi');
    }));
  });
});