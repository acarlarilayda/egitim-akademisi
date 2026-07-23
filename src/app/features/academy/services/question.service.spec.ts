import { fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { QuestionService } from './question.service';
import { QuestionStatus } from '../../../core/models/enums';
import { Question } from '../models/question.model';

/**
 * QuestionService icin unit testler.
 *
 * Odak noktasi, yayindaki (aktif) bir sinav sorusunun fiziksel olarak
 * silinemeyecegi, sadece pasife alinabilecegi kuralidir. Servis kasitli
 * olarak bir "delete" metodu sunmaz; tek kaldirma yolu `deactivate()` ile
 * soruyu Inactive duruma gecirmektir. Bu testler hem bu davranisi hem de
 * zaten pasif olan bir soru uzerinde tekrar islem yapilamayacagini
 * dogrular.
 *
 * MockApiService gercekci bir agi simule etmek icin gecikme + %5 rastgele
 * hata icerir (bkz. mock-api.service.ts). Bu yuzden testler `fakeAsync`/
 * `tick` ile deterministik hale getirilir ve `Math.random` sabitlenerek
 * rastgele hata varsayilan olarak devre disi birakilir.
 */
describe('QuestionService', () => {
  const QUESTIONS_KEY = 'academy-questions';
  let storageService: StorageService;
  let sessionService: SessionService;

  const validQuestionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
    examId: 'exam-1',
    text: 'Angular standalone component nedir?',
    options: ['NgModule gerektirmeyen component', 'Sadece test icin kullanilan component', 'Bir CSS framework'],
    correctOptionIndex: 0,
  };

  beforeEach(() => {
    localStorage.clear();
    spyOn(Math, 'random').and.returnValue(0.9); // errorRate (%5) tetiklenmesin
    storageService = new StorageService();
    sessionService = new SessionService();
  });

  function buildService(): QuestionService {
    storageService.setItem(QUESTIONS_KEY, []);
    const mockApi = new MockApiService();
    const auditLogService = new AuditLogService(storageService, mockApi);
    return new QuestionService(storageService, mockApi, auditLogService, sessionService);
  }

  it('QuestionService uzerinde bir "delete" metodu bulunmaz (kural: soru silinemez)', () => {
    const service = buildService();
    expect((service as unknown as { delete?: unknown }).delete).toBeUndefined();
  });

  describe('soru olusturma', () => {
    it('yeni bir soru her zaman Active (yayinda) durumunda baslar', fakeAsync(() => {
      const service = buildService();
      let created: Question | undefined;

      service.create(validQuestionData).subscribe((q) => (created = q));
      tick(1000);

      expect(created?.status).toBe(QuestionStatus.Active);
    }));
  });

  describe('"aktif soru silinemez, sadece pasife alinabilir" kurali', () => {
    it('aktif bir soru deactivate() ile basariyla pasife alinir', fakeAsync(() => {
      const service = buildService();
      let questionId = '';

      service.create(validQuestionData).subscribe((q) => (questionId = q.id));
      tick(1000);

      let deactivated: Question | undefined;
      service.deactivate(questionId).subscribe((q) => (deactivated = q));
      tick(1000);

      expect(deactivated?.status).toBe(QuestionStatus.Inactive);
      // Kayit fiziksel olarak silinmedi, sadece durumu degisti.
      expect(storageService.getItem(QUESTIONS_KEY).length).toBe(1);
    }));

    it('zaten pasif olan bir soru tekrar pasife alinmaya calisilirsa hata doner', fakeAsync(() => {
      const service = buildService();
      let questionId = '';

      service.create(validQuestionData).subscribe((q) => (questionId = q.id));
      tick(1000);
      service.deactivate(questionId).subscribe();
      tick(1000);

      let error: Error | undefined;
      service.deactivate(questionId).subscribe({
        next: () => fail('basari beklenmiyordu, "zaten pasif" hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zaten pasif durumda');
    }));

    it('deactivate(), var olmayan bir id icin kayit olusturmadan undefined doner', fakeAsync(() => {
      const service = buildService();
      let result: Question | undefined = { id: 'placeholder' } as Question;

      service.deactivate('olmayan-id').subscribe((q) => (result = q));
      tick(1000);

      expect(result).toBeUndefined();
      expect(storageService.getItem(QUESTIONS_KEY).length).toBe(0);
    }));

    it('update(), status alanini degistiremez — pasife alma sadece deactivate() ile yapilabilir', fakeAsync(() => {
      const service = buildService();
      let questionId = '';

      service.create(validQuestionData).subscribe((q) => (questionId = q.id));
      tick(1000);

      let updated: Question | undefined;
      service.update(questionId, { text: 'Guncellenmis soru metni' }).subscribe((q) => (updated = q));
      tick(1000);

      expect(updated?.text).toBe('Guncellenmis soru metni');
      expect(updated?.status).toBe(QuestionStatus.Active);
    }));
  });
});