import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { Course } from '../models/course.model';
import { CourseStatus } from '../../../core/models/enums';
import { demoCourses } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-courses';

/**
 * Kurs (Course) CRUD işlemlerini ve kurs durum geçişi iş kurallarını yönetir.
 * Tüm public metodlar gerçek bir API çağrısını simüle eder (gecikme + rastgele
 * hata senaryosu için bkz. MockApiService/AsyncEntityService); component'ler
 * loading/error state'lerini bu Observable'lara abone olarak yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService extends AsyncEntityService<Course> {
  /** Geriye dönük uyumluluk için: courses$ === items$ */
  readonly courses$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoCourses);
  }

  /**
   * Yeni bir kurs oluşturur. id, createdAt, updatedAt alanları otomatik
   * üretilir; yeni kurslar her zaman Taslak (Draft) durumunda başlar.
   */
  create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Observable<Course> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newCourse: Course = {
        ...courseData,
        id: crypto.randomUUID(),
        status: CourseStatus.Draft,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newCourse]);
      return newCourse;
    });
  }

  /**
   * Bir kursun genel bilgilerini günceller (title, description, capacity vb.).
   * Status değişiklikleri için ayrı bir metod (changeStatus) kullanılır —
   * çünkü status geçişleri kurallara tabidir, serbestçe değiştirilemez.
   */
  update(id: string, changes: Partial<Omit<Course, 'id' | 'createdAt' | 'status'>>): Observable<Course | undefined> {
    return this.runAsync(() => {
      const courses = this.getAllSync();
      const index = courses.findIndex((course) => course.id === id);

      if (index === -1) {
        return undefined;
      }

      const updatedCourse: Course = {
        ...courses[index],
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      const updatedCourses = [...courses];
      updatedCourses[index] = updatedCourse;
      this.persistSync(updatedCourses);

      return updatedCourse;
    });
  }

  /**
   * Kurs durumunu değiştirir. İzin verilen geçişler:
   * Draft -> Published -> Completed -> Archived
   * Yayına alınırken (Published) zorunlu alanların (title, description,
   * instructorId, capacity, passingScore) dolu olduğu kontrol edilir.
   */
  changeStatus(id: string, newStatus: CourseStatus): Observable<Course> {
    return this.runAsync(() => {
      const course = this.getByIdSync(id);
      if (!course) {
        throw new Error(`Kurs bulunamadı: ${id}`);
      }

      const allowedTransitions: Record<CourseStatus, CourseStatus[]> = {
        [CourseStatus.Draft]: [CourseStatus.Published],
        [CourseStatus.Published]: [CourseStatus.Completed],
        [CourseStatus.Completed]: [CourseStatus.Archived],
        [CourseStatus.Archived]: [],
      };

      const isAllowed = allowedTransitions[course.status].includes(newStatus);
      if (!isAllowed) {
        throw new Error(`Geçersiz durum geçişi: ${course.status} -> ${newStatus}`);
      }

      if (newStatus === CourseStatus.Published) {
        const hasRequiredFields =
          course.title && course.description && course.instructorId && course.capacity > 0 && course.passingScore > 0;
        if (!hasRequiredFields) {
          throw new Error('Kurs yayına alınamaz: zorunlu alanlar eksik.');
        }
      }

      const finalCourses = this.getAllSync().map((c) =>
        c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
      );
      this.persistSync(finalCourses);

      return finalCourses.find((c) => c.id === id)!;
    });
  }
}