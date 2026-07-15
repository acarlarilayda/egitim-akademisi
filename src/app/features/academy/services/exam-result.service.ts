import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { ExamResult } from '../models/exam-result.model';
import { demoExamResults } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-exam-results';

/**
 * Sınav Sonucu (ExamResult) CRUD işlemlerini yönetir.
 * Sonuç oluşturulurken puan ve geçme durumu otomatik hesaplanır.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class ExamResultService extends AsyncEntityService<ExamResult> {
  readonly examResults$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoExamResults);
  }

  /**
   * Belirtilen sınava ait tüm sonuçları asenkron olarak döner.
   */
  getByExamId(examId: string): Observable<ExamResult[]> {
    return this.runAsync(() => this.getAllSync().filter((result) => result.examId === examId));
  }

  /**
   * Belirtilen katılımcıya ait tüm sonuçları asenkron olarak döner.
   */
  getByParticipantId(participantId: string): Observable<ExamResult[]> {
    return this.runAsync(() => this.getAllSync().filter((result) => result.participantId === participantId));
  }

  /**
   * Yeni bir sınav sonucu oluşturur. Puan (score) ve geçme durumu
   * (isPassed), doğru/yanlış sayıları ve kursun geçme notuna göre
   * otomatik hesaplanır — component bu hesaplamayı yapmaz.
   *
   * @param examId Sınav ID'si
   * @param participantId Katılımcı ID'si
   * @param correctCount Doğru sayısı
   * @param wrongCount Yanlış sayısı
   * @param totalQuestionCount Sınavdaki toplam soru sayısı (yüzde hesabı için)
   * @param passingScore Kursun geçme notu (0-100 arası)
   */
  create(
    examId: string,
    participantId: string,
    correctCount: number,
    wrongCount: number,
    totalQuestionCount: number,
    passingScore: number
  ): Observable<ExamResult> {
    return this.runAsync(() => {
      const score = totalQuestionCount > 0 ? Math.round((correctCount / totalQuestionCount) * 100) : 0;
      const isPassed = score >= passingScore;

      const now = new Date().toISOString();
      const newResult: ExamResult = {
        id: crypto.randomUUID(),
        examId,
        participantId,
        correctCount,
        wrongCount,
        score,
        isPassed,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newResult]);
      return newResult;
    });
  }
}