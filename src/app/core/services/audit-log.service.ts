import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { AuditLogEntry } from '../models/audit-log-entry.model';
import { demoAuditLogEntries } from '../mock-data/demo-data';

const STORAGE_KEY = 'academy-audit-log';

/**
 * Audit Log (AuditLogEntry) kayıtlarını yönetir.
 * Sistemdeki kritik işlemleri (durum değişikliği, sertifika verme vb.)
 * kaydetmek için kullanılır. Sadece ekleme yapılır, güncelleme/silme yoktur
 * — bir denetim kaydının değiştirilmesi anlamlı olmaz.
 */
@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private entriesSubject = new BehaviorSubject<AuditLogEntry[]>([]);
  public entries$: Observable<AuditLogEntry[]> = this.entriesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoAuditLogEntries);
    this.loadEntries();
  }

  private loadEntries(): void {
    const entries = this.storageService.getItem<AuditLogEntry>(STORAGE_KEY);
    this.entriesSubject.next(entries);
  }

  /**
   * Tüm audit log kayıtlarını, en yeniden en eskiye sıralı olarak döner.
   */
  getAll(): AuditLogEntry[] {
    return [...this.entriesSubject.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Belirtilen entity'e (örneğin bir Course veya Enrollment) ait tüm
   * log kayıtlarını döner. Bir kaydın geçmişini görüntülemek için kullanılır.
   */
  getByEntityId(entityId: string): AuditLogEntry[] {
    return this.entriesSubject.value.filter((entry) => entry.entityId === entityId);
  }

  /**
   * Yeni bir audit log kaydı oluşturur. Diğer servisler, kritik bir
   * işlem gerçekleştirdiklerinde (durum değişikliği, sertifika verme vb.)
   * bu metodu çağırarak işlemi kayıt altına alır.
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'updatedAt'>): AuditLogEntry {
    const now = new Date().toISOString();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedEntries = [...this.entriesSubject.value, newEntry];
    this.storageService.setItem(STORAGE_KEY, updatedEntries);
    this.entriesSubject.next(updatedEntries);

    return newEntry;
  }
}