import { BaseModel } from '../../../core/models/base.model';

/**
 * Ders Modülü (CourseModule) modeli.
 * Bir kursun içindeki üst düzey konu başlığını/bölümünü temsil eder.
 * Örneğin "Angular Temelleri" kursunun "Componentler", "Servisler" gibi modülleri olabilir.
 */
export interface CourseModule extends BaseModel {
  courseId: string;
  title: string;
  order: number;
}

/**
 * Ders (Lesson) modeli.
 * Bir modülün içindeki tekil ders içeriğini temsil eder.
 * Katılım kayıtları (AttendanceRecord) bu seviyede tutulur.
 */
export interface Lesson extends BaseModel {
  moduleId: string;
  title: string;
  content: string;
  order: number;
}