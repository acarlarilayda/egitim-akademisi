import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { CourseModule, Lesson } from '../models/course-module.model';
import { demoCourseModules, demoLessons } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-course-modules';

/**
 * Ders Modülü (CourseModule) CRUD işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class CourseModuleService {
  private modulesSubject = new BehaviorSubject<CourseModule[]>([]);
  public modules$: Observable<CourseModule[]> = this.modulesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoCourseModules);
    this.loadModules();
  }

  private loadModules(): void {
    const modules = this.storageService.getItem<CourseModule>(STORAGE_KEY);
    this.modulesSubject.next(modules);
  }

  /**
   * Tüm modülleri senkron olarak döner.
   */
  getAll(): CourseModule[] {
    return this.modulesSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip modülü bulur.
   */
  getById(id: string): CourseModule | undefined {
    return this.modulesSubject.value.find((module) => module.id === id);
  }

  /**
   * Belirtilen kursa ait tüm modülleri, sıra numarasına göre döner.
   */
  getByCourseId(courseId: string): CourseModule[] {
    return this.modulesSubject.value
      .filter((module) => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Yeni bir modül oluşturur.
   */
  create(moduleData: Omit<CourseModule, 'id' | 'createdAt' | 'updatedAt'>): CourseModule {
    const now = new Date().toISOString();
    const newModule: CourseModule = {
      ...moduleData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedModules = [...this.modulesSubject.value, newModule];
    this.storageService.setItem(STORAGE_KEY, updatedModules);
    this.modulesSubject.next(updatedModules);

    return newModule;
  }

  /**
   * Bir modülün bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<CourseModule, 'id' | 'createdAt'>>): CourseModule | undefined {
    const modules = this.modulesSubject.value;
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

    this.storageService.setItem(STORAGE_KEY, updatedModules);
    this.modulesSubject.next(updatedModules);

    return updatedModule;
  }
}

const LESSON_STORAGE_KEY = 'academy-lessons';

/**
 * Ders (Lesson) CRUD işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);
  public lessons$: Observable<Lesson[]> = this.lessonsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(LESSON_STORAGE_KEY, demoLessons);
    this.loadLessons();
  }

  private loadLessons(): void {
    const lessons = this.storageService.getItem<Lesson>(LESSON_STORAGE_KEY);
    this.lessonsSubject.next(lessons);
  }

  /**
   * Tüm dersleri senkron olarak döner.
   */
  getAll(): Lesson[] {
    return this.lessonsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip dersi bulur.
   */
  getById(id: string): Lesson | undefined {
    return this.lessonsSubject.value.find((lesson) => lesson.id === id);
  }

  /**
   * Belirtilen modüle ait tüm dersleri, sıra numarasına göre döner.
   */
  getByModuleId(moduleId: string): Lesson[] {
    return this.lessonsSubject.value
      .filter((lesson) => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Yeni bir ders oluşturur.
   */
  create(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Lesson {
    const now = new Date().toISOString();
    const newLesson: Lesson = {
      ...lessonData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedLessons = [...this.lessonsSubject.value, newLesson];
    this.storageService.setItem(LESSON_STORAGE_KEY, updatedLessons);
    this.lessonsSubject.next(updatedLessons);

    return newLesson;
  }

  /**
   * Bir dersin bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Lesson, 'id' | 'createdAt'>>): Lesson | undefined {
    const lessons = this.lessonsSubject.value;
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

    this.storageService.setItem(LESSON_STORAGE_KEY, updatedLessons);
    this.lessonsSubject.next(updatedLessons);

    return updatedLesson;
  }
}