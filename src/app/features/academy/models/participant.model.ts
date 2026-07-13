import { BaseModel } from '../../../core/models/base.model';

/**
 * Katılımcı (Participant) modeli.
 * Eğitim programlarına kayıt olan kişileri temsil eder.
 */
export interface Participant extends BaseModel {
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
}