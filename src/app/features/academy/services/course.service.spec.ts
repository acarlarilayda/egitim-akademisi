import { fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { CourseService } from './course.service';
import { CourseStatus } from '../../../core/models/enums';
import { Course } from '../models/course.model';

/**
 * CourseService icin unit testler.
 *
 * Odak noktasi, bir kursun yayina alinabilmesi icin zorunlu alanlarinin
 * (baslik, egitmen, kontenjan, gecme notu vb.) eksiksiz olmasi gerektigini
 * dogrulamaktir; bu kontrol create() ve changeStatus() metotlarinin
 * birlikte davranisiyla saglanir. Ayrica Taslak -> Yayinda -> Tamamlandi ->
 * Arsivlendi workflow'undaki izinli/izinsiz durum gecisleri de dogrulanir.
 *
 * MockApiService gercekci bir agi simule etmek icin gecikme + %5 rastgele
 * hata icerir (bkz. mock-api.service.ts). Bu yuzden testler `fakeAsync`/
 * `tick` ile deterministik hale getirilir ve `Math.random` sabitlenerek
 * rastgele hata varsayilan olarak devre disi birakilir.
 */
describe('CourseService', () => {
  const COURSES_KEY = 'academy-courses';
  let storageService: StorageService;
  let sessionService: SessionService;

  const validCourseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
    title: 'Angular Temelleri',
    description: 'Angular 17 ile standalone component gelistirme egitimi',
    capacity: 20,
    instructorId: 'inst-1',
    passingScore: 60,
    startDate: '2026-08-01',
    endDate: '2026-08-15',
  };

  beforeEach(() => {
    localStorage.clear();
    spyOn(Math, 'random').and.returnValue(0.9); // errorRate (%5) tetiklenmesin
    storageService = new StorageService();
    sessionService = new SessionService();
  });

  function buildService(): CourseService {
    storageService.setItem(COURSES_KEY, []);
    const mockApi = new MockApiService();
    const auditLogService = new AuditLogService(storageService, mockApi);
    return new CourseService(storageService, mockApi, auditLogService, sessionService);
  }

  describe('kurs olusturma', () => {
    it('yeni bir kurs her zaman Taslak (Draft) durumunda baslar', fakeAsync(() => {
      const service = buildService();
      let created: Course | undefined;

      service.create(validCourseData).subscribe((c) => (created = c));
      tick(1000);

      expect(created?.status).toBe(CourseStatus.Draft);
      expect(created?.id).toBeTruthy();
    }));
  });

  describe('"yayindaki kursun zorunlu alanlari eksik birakilamaz" kurali', () => {
    it('tum zorunlu alanlar doluyken Taslak -> Yayinda gecisi basarili olur', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create(validCourseData).subscribe((c) => (courseId = c.id));
      tick(1000);

      let published: Course | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe((c) => (published = c));
      tick(1000);

      expect(published?.status).toBe(CourseStatus.Published);
    }));

    it('title bos iken yayina alma reddedilir', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create({ ...validCourseData, title: '' }).subscribe((c) => (courseId = c.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe({
        next: () => fail('basari beklenmiyordu, zorunlu alan hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zorunlu alanlar eksik');
      expect(storageService.getItem<Course>(COURSES_KEY)[0].status).toBe(CourseStatus.Draft);
    }));

    it('instructorId atanmamisken yayina alma reddedilir', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create({ ...validCourseData, instructorId: '' }).subscribe((c) => (courseId = c.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe({
        next: () => fail('basari beklenmiyordu, zorunlu alan hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zorunlu alanlar eksik');
    }));

    it('capacity 0 veya negatifken yayina alma reddedilir', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create({ ...validCourseData, capacity: 0 }).subscribe((c) => (courseId = c.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe({
        next: () => fail('basari beklenmiyordu, zorunlu alan hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zorunlu alanlar eksik');
    }));

    it('passingScore 0 veya negatifken yayina alma reddedilir', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create({ ...validCourseData, passingScore: 0 }).subscribe((c) => (courseId = c.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe({
        next: () => fail('basari beklenmiyordu, zorunlu alan hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('zorunlu alanlar eksik');
    }));
  });

  describe('durum gecisi (workflow) kurallari', () => {
    it('Draft -> Published -> Completed -> Archived siralı gecisleri basarili olur', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create(validCourseData).subscribe((c) => (courseId = c.id));
      tick(1000);

      service.changeStatus(courseId, CourseStatus.Published).subscribe();
      tick(1000);
      service.changeStatus(courseId, CourseStatus.Completed).subscribe();
      tick(1000);

      let archived: Course | undefined;
      service.changeStatus(courseId, CourseStatus.Archived).subscribe((c) => (archived = c));
      tick(1000);

      expect(archived?.status).toBe(CourseStatus.Archived);
    }));

    it('adimlar atlanarak yapilan bir gecis (Draft -> Completed) reddedilir', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create(validCourseData).subscribe((c) => (courseId = c.id));
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Completed).subscribe({
        next: () => fail('basari beklenmiyordu, gecersiz durum gecisi hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('Geçersiz durum geçişi');
    }));

    it('Archived durumundan hicbir gecise izin verilmez (terminal durum)', fakeAsync(() => {
      const service = buildService();
      let courseId = '';

      service.create(validCourseData).subscribe((c) => (courseId = c.id));
      tick(1000);
      service.changeStatus(courseId, CourseStatus.Published).subscribe();
      tick(1000);
      service.changeStatus(courseId, CourseStatus.Completed).subscribe();
      tick(1000);
      service.changeStatus(courseId, CourseStatus.Archived).subscribe();
      tick(1000);

      let error: Error | undefined;
      service.changeStatus(courseId, CourseStatus.Published).subscribe({
        next: () => fail('basari beklenmiyordu, gecersiz durum gecisi hatasi bekleniyordu'),
        error: (err) => (error = err),
      });
      tick(1000);

      expect(error?.message).toContain('Geçersiz durum geçişi');
    }));
  });
});