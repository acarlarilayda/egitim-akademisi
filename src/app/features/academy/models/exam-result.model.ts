import { BaseModel } from '../../../core/models/base.model';

/**
 * Sınav Sonucu (ExamResult) modeli.
 * Bir katılımcının bir sınavdaki sonucunu temsil eder.
 * Doğru/yanlış/net sayıları ve başarı durumu bu veriden hesaplanır.
 */
export interface ExamResult extends BaseModel {
  examId: string;
  participantId: string;
  correctCount: number;
  wrongCount: number;
  score: number;
  isPassed: boolean;
}