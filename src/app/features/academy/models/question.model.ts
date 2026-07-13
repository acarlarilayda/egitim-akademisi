import { BaseModel } from '../../../core/models/base.model';
import { QuestionStatus } from '../../../core/models/enums';

/**
 * Sınav Sorusu (Question) modeli.
 * Bir sınava bağlı soruyu temsil eder. Yayındaki (aktif) bir soru
 * silinemez, sadece pasife alınabilir — bu yüzden "delete" işlemi yerine
 * status alanı üzerinden yönetilir.
 */
export interface Question extends BaseModel {
  examId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  status: QuestionStatus;
}