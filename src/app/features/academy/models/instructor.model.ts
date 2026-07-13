import { BaseModel } from '../../../core/models/base.model';

/**
 * Eğitmen (Instructor) modeli.
 * Eğitmenler operasyonel ekranlarda sadece kendi yetki alanları dahilinde işlem yapabilir;
 * örneğin bir eğitmen yalnızca kendi verdiği kursların sınav sonuçlarını düzenleyebilir.
 */
export interface Instructor extends BaseModel {
  fullName: string;
  email: string;
  expertise: string;
  isActive: boolean;
}