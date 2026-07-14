import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { ExamResult } from '../models/exam-result.model';
import { demoExamResults } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-exam-results';

/**
 * Sınav Sonucu (ExamResult) CRUD işlemlerini yönetir.
 * Sonuç oluşturulurken puan ve geçme durumu otomatik hesaplanır.
 */
@Injectable({
  providedIn: 'root',
})
export class ExamResultService {
  private examResultsSubject = new BehaviorSubject<ExamResult[]>([]);
  public examResults$: Observable<ExamResult[]> = this.examResultsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoExamResults);
    this.loadExamResults();
  }

  private loadExamResults(): void {
    const examResults = this.storageService.getItem<ExamResult>(STORAGE_KEY);
    this.examResultsSubject.next(examResults);
  }

  /**
   * Tüm sınav sonuçlarını senkron olarak döner.
   */
  getAll(): ExamResult[] {
    return this.examResultsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip sonucu bulur.
   */
  getById(id: string): ExamResult | undefined {
    return this.examResultsSubject.value.find((result) => result.id === id);
  }

  /**
   * Belirtilen sınava ait tüm sonuçları döner.
   */
  getByExamId(examId: string): ExamResult[] {
    return this.examResultsSubject.value.filter((result) => result.examId === examId);
  }

  /**
   * Belirtilen katılımcıya ait tüm sonuçları döner.
   */
  getByParticipantId(participantId: string): ExamResult[] {
    return this.examResultsSubject.value.filter((result) => result.participantId === participantId);
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
  ): ExamResult {
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

    const updatedResults = [...this.examResultsSubject.value, newResult];
    this.storageService.setItem(STORAGE_KEY, updatedResults);
    this.examResultsSubject.next(updatedResults);

    return newResult;
  }
}