import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { MockApiService } from './mock-api.service';
import { AsyncEntityService } from './async-entity-base.service';
import { AuditLogEntry } from '../models/audit-log-entry.model';
import { demoAuditLogEntries } from '../mock-data/demo-data';

const STORAGE_KEY = 'academy-audit-log';

/**
 * Audit Log (AuditLogEntry) kayıtlarını yönetir.
 * Sistemdeki kritik işlemleri (durum değişikliği, sertifika verme vb.)
 * kaydetmek için kullanılır. Sadece ekleme yapılır, güncelleme/silme yoktur
 * — bir denetim kaydının değiştirilmesi anlamlı olmaz.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class AuditLogService extends AsyncEntityService<AuditLogEntry> {
  readonly entries$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoAuditLogEntries);
  }

  /**
   * Tüm audit log kayıtlarını, en yeniden en eskiye sıralı olarak asenkron döner.
   */
  override getAll(): Observable<AuditLogEntry[]> {
    return this.runAsync(() =>
      [...this.getAllSync()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }

  /**
   * Belirtilen entity'e (örneğin bir Course veya Enrollment) ait tüm
   * log kayıtlarını asenkron döner. Bir kaydın geçmişini görüntülemek için kullanılır.
   */
  getByEntityId(entityId: string): Observable<AuditLogEntry[]> {
    return this.runAsync(() => this.getAllSync().filter((entry) => entry.entityId === entityId));
  }

  /**
   * Yeni bir audit log kaydı oluşturur. Diğer servisler, kritik bir
   * işlem gerçekleştirdiklerinde (durum değişikliği, sertifika verme vb.)
   * bu metodu çağırarak işlemi kayıt altına alır.
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'updatedAt'>): Observable<AuditLogEntry> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newEntry: AuditLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newEntry]);
      return newEntry;
    });
  }
}