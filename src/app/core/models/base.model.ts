/**
 * Tüm domain modellerinin ortak alanlarını tanımlayan temel arayüz (interface).
 * Course, Enrollment, Exam gibi her ana model bunu "extends" ederek kullanacak.
 * Böylece id, createdAt, updatedAt gibi alanları her modelde tekrar tekrar yazmayız.
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Audit log ve diğer yerlerde "kim yaptı" bilgisini tutmak için kullanılacak
 * basit bir kullanıcı/rol referansı.
 */
export interface AuditableBy {
  performedByUserId: string;
  performedByRole: string;
}