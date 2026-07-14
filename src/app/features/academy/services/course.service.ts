import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Course } from '../models/course.model';
import { CourseStatus } from '../../../core/models/enums';
import { demoCourses } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-courses';

/**
 * Kurs (Course) CRUD işlemlerini ve kurs durum geçişi iş kurallarını yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$: Observable<Course[]> = this.coursesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoCourses);
    this.loadCourses();
  }

  private loadCourses(): void {
    const courses = this.storageService.getItem<Course>(STORAGE_KEY);
    this.coursesSubject.next(courses);
  }

  /**
   * Tüm kursları senkron (anlık) olarak döner.
   * Filtreleme/arama gibi tek seferlik işlemler için kullanılır.
   */
  getAll(): Course[] {
    return this.coursesSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip kursu bulur. Bulunamazsa undefined döner.
   */
  getById(id: string): Course | undefined {
    return this.coursesSubject.value.find((course) => course.id === id);
  }

  /**
   * Yeni bir kurs oluşturur. id, createdAt, updatedAt alanları otomatik
   * üretilir; yeni kurslar her zaman Taslak (Draft) durumunda başlar.
   */
  create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Course {
    const now = new Date().toISOString();
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(),
      status: CourseStatus.Draft,
      createdAt: now,
      updatedAt: now,
    };

    const updatedCourses = [...this.coursesSubject.value, newCourse];
    this.storageService.setItem(STORAGE_KEY, updatedCourses);
    this.coursesSubject.next(updatedCourses);

    return newCourse;
  }

  /**
   * Bir kursun genel bilgilerini günceller (title, description, capacity vb.).
   * Status değişiklikleri için ayrı bir metod (changeStatus) kullanılır —
   * çünkü status geçişleri kurallara tabidir, serbestçe değiştirilemez.
   */
  update(id: string, changes: Partial<Omit<Course, 'id' | 'createdAt' | 'status'>>): Course | undefined {
    const courses = this.coursesSubject.value;
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

    this.storageService.setItem(STORAGE_KEY, updatedCourses);
    this.coursesSubject.next(updatedCourses);

    return updatedCourse;
  }

  /**
   * Kurs durumunu değiştirir. İzin verilen geçişler:
   * Draft -> Published -> Completed -> Archived
   * Yayına alınırken (Published) zorunlu alanların (title, description,
   * instructorId, capacity, passingScore) dolu olduğu kontrol edilir.
   */
  changeStatus(id: string, newStatus: CourseStatus): Course {
    const course = this.getById(id);
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
      throw new Error(
        `Geçersiz durum geçişi: ${course.status} -> ${newStatus}`
      );
    }

    if (newStatus === CourseStatus.Published) {
      const hasRequiredFields =
        course.title && course.description && course.instructorId && course.capacity > 0 && course.passingScore > 0;
      if (!hasRequiredFields) {
        throw new Error('Kurs yayına alınamaz: zorunlu alanlar eksik.');
      }
    }

    const finalCourses = this.coursesSubject.value.map((c) =>
      c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
    );

    this.storageService.setItem(STORAGE_KEY, finalCourses);
    this.coursesSubject.next(finalCourses);

    return finalCourses.find((c) => c.id === id)!;
  }
}