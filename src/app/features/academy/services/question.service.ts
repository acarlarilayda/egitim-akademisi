import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { SessionService } from '../../../core/services/session.service';
import { Question } from '../models/question.model';
import { QuestionStatus } from '../../../core/models/enums';
import { demoQuestions } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-questions';

/**
 * Sınav Sorusu (Question) CRUD işlemlerini yönetir.
 * Yayındaki (aktif) bir soru silinemez, sadece pasife alınabilir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class QuestionService extends AsyncEntityService<Question> {
  readonly questions$ = this.items$;

  constructor(
    storageService: StorageService,
    mockApi: MockApiService,
    private auditLogService: AuditLogService,
    private sessionService: SessionService
  ) {
    super(STORAGE_KEY, storageService, mockApi, demoQuestions);
  }

  /**
   * Belirtilen sınava ait tüm soruları asenkron olarak döner.
   */
  getByExamId(examId: string): Observable<Question[]> {
    return this.runAsync(() => this.getAllSync().filter((question) => question.examId === examId));
  }

  /**
   * Yeni bir soru oluşturur. Yeni sorular varsayılan olarak aktif başlar.
   */
  create(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Observable<Question> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newQuestion: Question = {
        ...questionData,
        id: crypto.randomUUID(),
        status: QuestionStatus.Active,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newQuestion]);
      return newQuestion;
    });
  }

  /**
   * Bir sorunun içeriğini günceller (text, options, correctOptionIndex vb.).
   */
  update(id: string, changes: Partial<Omit<Question, 'id' | 'createdAt' | 'status'>>): Observable<Question | undefined> {
    return this.runAsync(() => {
      const questions = this.getAllSync();
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
      this.persistSync(updatedQuestions);

      return updatedQuestion;
    });
  }

  /**
   * Bir soruyu pasife alır. Doküman kuralı gereği aktif sorular
   * doğrudan silinemez; bu metod "silme" işleminin yerini alır.
   * Bu, geri döndürülemez ve kritik bir işlem olduğu için audit log'a düşer.
   */
  deactivate(id: string): Observable<Question | undefined> {
    return this.runAsync(() => {
      const question = this.getByIdSync(id);
      if (!question) {
        return undefined;
      }

      if (question.status === QuestionStatus.Inactive) {
        throw new Error('Bu soru zaten pasif durumda.');
      }

      const updatedQuestions = this.getAllSync().map((q) =>
        q.id === id ? { ...q, status: QuestionStatus.Inactive, updatedAt: new Date().toISOString() } : q
      );
      this.persistSync(updatedQuestions);

      return updatedQuestions.find((q) => q.id === id);
    }).pipe(
      switchMap((question) => {
        if (!question) {
          return [question];
        }

        const activeUser = this.sessionService.currentUser();
        return this.auditLogService
          .log({
            entityType: 'Question',
            entityId: id,
            action: 'DEACTIVATE',
            performedByUserId: activeUser.id,
            performedByRole: activeUser.role,
            description: 'Soru pasife alındı (soft delete)',
            oldValue: QuestionStatus.Active,
            newValue: QuestionStatus.Inactive,
          })
          .pipe(map(() => question));
      })
    );
  }
}