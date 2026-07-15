import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { Exam } from '../models/exam.model';
import { demoExams } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-exams';

/**
 * Sınav (Exam) CRUD işlemlerini yönetir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class ExamService extends AsyncEntityService<Exam> {
  readonly exams$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoExams);
  }

  /**
   * Belirtilen kursa ait tüm sınavları asenkron olarak döner.
   */
  getByCourseId(courseId: string): Observable<Exam[]> {
    return this.runAsync(() => this.getAllSync().filter((exam) => exam.courseId === courseId));
  }

  /**
   * Yeni bir sınav oluşturur.
   */
  create(examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Observable<Exam> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newExam: Exam = {
        ...examData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newExam]);
      return newExam;
    });
  }

  /**
   * Bir sınavın bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Exam, 'id' | 'createdAt'>>): Observable<Exam | undefined> {
    return this.runAsync(() => {
      const exams = this.getAllSync();
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
      this.persistSync(updatedExams);

      return updatedExam;
    });
  }
}