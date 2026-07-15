import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { CourseModule, Lesson } from '../models/course-module.model';
import { demoCourseModules, demoLessons } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-course-modules';

/**
 * Ders Modülü (CourseModule) CRUD işlemlerini yönetir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class CourseModuleService extends AsyncEntityService<CourseModule> {
  readonly modules$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoCourseModules);
  }

  /**
   * Belirtilen kursa ait tüm modülleri, sıra numarasına göre asenkron döner.
   */
  getByCourseId(courseId: string): Observable<CourseModule[]> {
    return this.runAsync(() =>
      this.getAllSync()
        .filter((module) => module.courseId === courseId)
        .sort((a, b) => a.order - b.order)
    );
  }

  /**
   * Yeni bir modül oluşturur.
   */
  create(moduleData: Omit<CourseModule, 'id' | 'createdAt' | 'updatedAt'>): Observable<CourseModule> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newModule: CourseModule = {
        ...moduleData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newModule]);
      return newModule;
    });
  }

  /**
   * Bir modülün bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<CourseModule, 'id' | 'createdAt'>>): Observable<CourseModule | undefined> {
    return this.runAsync(() => {
      const modules = this.getAllSync();
      const index = modules.findIndex((module) => module.id === id);

      if (index === -1) {
        return undefined;
      }

      const updatedModule: CourseModule = {
        ...modules[index],
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      const updatedModules = [...modules];
      updatedModules[index] = updatedModule;
      this.persistSync(updatedModules);

      return updatedModule;
    });
  }
}

const LESSON_STORAGE_KEY = 'academy-lessons';

/**
 * Ders (Lesson) CRUD işlemlerini yönetir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class LessonService extends AsyncEntityService<Lesson> {
  readonly lessons$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(LESSON_STORAGE_KEY, storageService, mockApi, demoLessons);
  }

  /**
   * Belirtilen modüle ait tüm dersleri, sıra numarasına göre asenkron döner.
   */
  getByModuleId(moduleId: string): Observable<Lesson[]> {
    return this.runAsync(() =>
      this.getAllSync()
        .filter((lesson) => lesson.moduleId === moduleId)
        .sort((a, b) => a.order - b.order)
    );
  }

  /**
   * Yeni bir ders oluşturur.
   */
  create(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Observable<Lesson> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newLesson: Lesson = {
        ...lessonData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newLesson]);
      return newLesson;
    });
  }

  /**
   * Bir dersin bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Lesson, 'id' | 'createdAt'>>): Observable<Lesson | undefined> {
    return this.runAsync(() => {
      const lessons = this.getAllSync();
      const index = lessons.findIndex((lesson) => lesson.id === id);

      if (index === -1) {
        return undefined;
      }

      const updatedLesson: Lesson = {
        ...lessons[index],
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      const updatedLessons = [...lessons];
      updatedLessons[index] = updatedLesson;
      this.persistSync(updatedLessons);

      return updatedLesson;
    });
  }
}