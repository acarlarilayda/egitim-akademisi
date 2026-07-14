import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Question } from '../models/question.model';
import { QuestionStatus } from '../../../core/models/enums';
import { demoQuestions } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-questions';

/**
 * Sınav Sorusu (Question) CRUD işlemlerini yönetir.
 * Yayındaki (aktif) bir soru silinemez, sadece pasife alınabilir.
 */
@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  public questions$: Observable<Question[]> = this.questionsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoQuestions);
    this.loadQuestions();
  }

  private loadQuestions(): void {
    const questions = this.storageService.getItem<Question>(STORAGE_KEY);
    this.questionsSubject.next(questions);
  }

  /**
   * Tüm soruları senkron olarak döner.
   */
  getAll(): Question[] {
    return this.questionsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip soruyu bulur.
   */
  getById(id: string): Question | undefined {
    return this.questionsSubject.value.find((question) => question.id === id);
  }

  /**
   * Belirtilen sınava ait tüm soruları döner.
   */
  getByExamId(examId: string): Question[] {
    return this.questionsSubject.value.filter((question) => question.examId === examId);
  }

  /**
   * Yeni bir soru oluşturur. Yeni sorular varsayılan olarak aktif başlar.
   */
  create(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Question {
    const now = new Date().toISOString();
    const newQuestion: Question = {
      ...questionData,
      id: crypto.randomUUID(),
      status: QuestionStatus.Active,
      createdAt: now,
      updatedAt: now,
    };

    const updatedQuestions = [...this.questionsSubject.value, newQuestion];
    this.storageService.setItem(STORAGE_KEY, updatedQuestions);
    this.questionsSubject.next(updatedQuestions);

    return newQuestion;
  }

  /**
   * Bir sorunun içeriğini günceller (text, options, correctOptionIndex vb.).
   */
  update(id: string, changes: Partial<Omit<Question, 'id' | 'createdAt' | 'status'>>): Question | undefined {
    const questions = this.questionsSubject.value;
    const index = questions.findIndex((question) => question.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedQuestion: Question = {
      ...questions[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;

    this.storageService.setItem(STORAGE_KEY, updatedQuestions);
    this.questionsSubject.next(updatedQuestions);

    return updatedQuestion;
  }

  /**
   * Bir soruyu pasife alır. Doküman kuralı gereği aktif sorular
   * doğrudan silinemez; bu metod "silme" işleminin yerini alır.
   */
  deactivate(id: string): Question | undefined {
    const question = this.getById(id);
    if (!question) {
      return undefined;
    }

    if (question.status === QuestionStatus.Inactive) {
      throw new Error('Bu soru zaten pasif durumda.');
    }

    const updatedQuestions = this.questionsSubject.value.map((q) =>
      q.id === id ? { ...q, status: QuestionStatus.Inactive, updatedAt: new Date().toISOString() } : q
    );

    this.storageService.setItem(STORAGE_KEY, updatedQuestions);
    this.questionsSubject.next(updatedQuestions);

    return updatedQuestions.find((q) => q.id === id);
  }
}