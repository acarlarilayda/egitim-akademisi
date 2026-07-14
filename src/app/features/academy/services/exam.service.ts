import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Exam } from '../models/exam.model';
import { demoExams } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-exams';

/**
 * Sınav (Exam) CRUD işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private examsSubject = new BehaviorSubject<Exam[]>([]);
  public exams$: Observable<Exam[]> = this.examsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoExams);
    this.loadExams();
  }

  private loadExams(): void {
    const exams = this.storageService.getItem<Exam>(STORAGE_KEY);
    this.examsSubject.next(exams);
  }

  /**
   * Tüm sınavları senkron olarak döner.
   */
  getAll(): Exam[] {
    return this.examsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip sınavı bulur.
   */
  getById(id: string): Exam | undefined {
    return this.examsSubject.value.find((exam) => exam.id === id);
  }

  /**
   * Belirtilen kursa ait tüm sınavları döner.
   */
  getByCourseId(courseId: string): Exam[] {
    return this.examsSubject.value.filter((exam) => exam.courseId === courseId);
  }

  /**
   * Yeni bir sınav oluşturur.
   */
  create(examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam {
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...examData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedExams = [...this.examsSubject.value, newExam];
    this.storageService.setItem(STORAGE_KEY, updatedExams);
    this.examsSubject.next(updatedExams);

    return newExam;
  }

  /**
   * Bir sınavın bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Exam, 'id' | 'createdAt'>>): Exam | undefined {
    const exams = this.examsSubject.value;
    const index = exams.findIndex((exam) => exam.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedExam: Exam = {
      ...exams[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    const updatedExams = [...exams];
    updatedExams[index] = updatedExam;

    this.storageService.setItem(STORAGE_KEY, updatedExams);
    this.examsSubject.next(updatedExams);

    return updatedExam;
  }
}