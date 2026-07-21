import { fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { CertificateEligibilityService } from './certificate-eligibility.service';
import { CertificateEligibilityStatus } from '../../../core/models/enums';

/**
 * CertificateEligibilityService, "sertifika icin katilim orani VE sinav
 * basari sarti birlikte saglanmalidir" kuralini ve sertifika verme
 * (issueCertificate) akisindaki hata senaryolarini dogrular.
 *
 * MockApiService gercekci bir agi simule etmek icin gecikme + %5 rastgele
 * hata icerdiginden (bkz. mock-api.service.ts), testler `fakeAsync`/`tick`
 * ile deterministik hale getirilir ve `Math.random` sabitlenerek rastgele
 * hata devre disi birakilir.
 */
describe('CertificateEligibilityService', () => {
  const ELIGIBILITY_KEY = 'academy-certificate-eligibilities';
  let storageService: StorageService;
  let sessionService: SessionService;

  beforeEach(() => {
    localStorage.clear();
    spyOn(Math, 'random').and.returnValue(0.9); // errorRate (%5) tetiklenmesin
    storageService = new StorageService();
    sessionService = new SessionService();
  });

  function buildService(): CertificateEligibilityService {
    storageService.setItem(ELIGIBILITY_KEY, []);
    const mockApi = new MockApiService();
    const auditLogService = new AuditLogService(storageService, mockApi);
    return new CertificateEligibilityService(storageService, mockApi, auditLogService, sessionService);
  }

  describe('evaluate: katilim orani VE sinav basarisi birlikte sarti', () => {
    it('katilim >= %80 VE sinav gecildiyse Eligible olur', fakeAsync(() => {
      const service = buildService();
      let result: { status: CertificateEligibilityStatus } | undefined;

      service.evaluate('course-1', 'participant-1', 90, true).subscribe((r) => (result = r));
      tick(1000);

      expect(result?.status).toBe(CertificateEligibilityStatus.Eligible);
    }));

    it('katilim tam sinirda (%80) ve sinav gecildiyse Eligible olur (sinir degeri)', fakeAsync(() => {
      const service = buildService();
      let result: { status: CertificateEligibilityStatus } | undefined;

      service.evaluate('course-1', 'participant-1', 80, true).subscribe((r) => (result = r));
      tick(1000);

      expect(result?.status).toBe(CertificateEligibilityStatus.Eligible);
    }));

    it('katilim %80 altindaysa sinav gecilmis olsa bile Eligible olmaz', fakeAsync(() => {
      const service = buildService();
      let result: { status: CertificateEligibilityStatus } | undefined;

      service.evaluate('course-1', 'participant-1', 79, true).subscribe((r) => (result = r));
      tick(1000);

      expect(result?.status).toBe(CertificateEligibilityStatus.Pending);
    }));

    it('sinav gecilmemisse katilim %100 olsa bile Eligible olmaz', fakeAsync(() => {
      const service = buildService();
      let result: { status: CertificateEligibilityStatus } | undefined;

      service.evaluate('course-1', 'participant-1', 100, false).subscribe((r) => (result = r));
      tick(1000);

      expect(result?.status).toBe(CertificateEligibilityStatus.Pending);
    }));

    it('ayni kurs/katilimci icin tekrar cagrildiginda yeni kayit degil, mevcut kaydi gunceller', fakeAsync(() => {
      const service = buildService();
      let firstId: string | undefined;

      service.evaluate('course-1', 'participant-1', 50, false).subscribe((r) => (firstId = r.id));
      tick(1000);

      let secondResult: { id: string; status: CertificateEligibilityStatus } | undefined;
      service.evaluate('course-1', 'participant-1', 95, true).subscribe((r) => (secondResult = r));
      tick(1000);

      expect(secondResult?.id).toBe(firstId);
      expect(secondResult?.status).toBe(CertificateEligibilityStatus.Eligible);
      expect(storageService.getItem(ELIGIBILITY_KEY).length).toBe(1);
    }));
  });

  describe('issueCertificate', () => {
    it('Eligible durumdaki bir kayda sertifika verilebilir ve issuedAt doldurulur', fakeAsync(() => {
      const service = buildService();
      let eligibility: { id: string } | undefined;

      service.evaluate('course-1', 'participant-1', 90, true).subscribe((r) => (eligibility = r));
      tick(1000);

      let issued: { status: CertificateEligibilityStatus; issuedAt: string | null } | undefined;
      service.issueCertificate(eligibility!.id).subscribe((r) => (issued = r));
      tick(1000);

      expect(issued?.status).toBe(CertificateEligibilityStatus.Issued);
      expect(issued?.issuedAt).not.toBeNull();
    }));

    it('Pending durumdaki bir kayda sertifika verilemez (hata senaryosu)', fakeAsync(() => {
      const service = buildService();
      let eligibility: { id: string } | undefined;

      service.evaluate('course-1', 'participant-1', 40, false).subscribe((r) => (eligibility = r));
      tick(1000);

      let error: Error | undefined;
      service.issueCertificate(eligibility!.id).subscribe({
        next: () => fail('basari beklenmiyordu, "sadece Eligible" hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('Eligible');
    }));

    it('var olmayan bir kayit icin sertifika verilmeye calisilirsa hata firlatilir (hata senaryosu)', fakeAsync(() => {
      const service = buildService();
      let error: Error | undefined;

      service.issueCertificate('olmayan-id').subscribe({
        next: () => fail('basari beklenmiyordu, "kayit bulunamadi" hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('bulunamadı');
    }));
  });
});