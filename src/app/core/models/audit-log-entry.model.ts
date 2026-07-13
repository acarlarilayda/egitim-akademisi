import { BaseModel } from './base.model';

/**
 * Audit Log Kaydı (AuditLogEntry) modeli.
 * Sistemdeki kritik işlemleri (kayıt oluşturma, durum değişikliği,
 * sertifika üretimi vb.) izlemek için kullanılır. Her kritik işlem
 * bu log'a bir kayıt düşürür; işlem tipi, zamanı, kimin yaptığı,
 * açıklama ve varsa eski/yeni değer bilgisini tutar.
 */
export interface AuditLogEntry extends BaseModel {
  entityType: string;
  entityId: string;
  action: string;
  performedByUserId: string;
  performedByRole: string;
  description: string;
  oldValue: string | null;
  newValue: string | null;
}