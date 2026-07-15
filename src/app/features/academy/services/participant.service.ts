import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { Participant } from '../models/participant.model';
import { demoParticipants } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-participants';

/**
 * Katılımcı (Participant) CRUD işlemlerini yönetir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class ParticipantService extends AsyncEntityService<Participant> {
  readonly participants$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoParticipants);
  }

  /**
   * Yeni bir katılımcı oluşturur. Yeni katılımcılar varsayılan olarak aktif başlar.
   */
  create(participantData: Omit<Participant, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Observable<Participant> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newParticipant: Participant = {
        ...participantData,
        id: crypto.randomUUID(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newParticipant]);
      return newParticipant;
    });
  }

  /**
   * Bir katılımcının bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Participant, 'id' | 'createdAt'>>): Observable<Participant | undefined> {
    return this.runAsync(() => {
      const participants = this.getAllSync();
      const index = participants.findIndex((participant) => participant.id === id);

      if (index === -1) {
        return undefined;
      }

      const updatedParticipant: Participant = {
        ...participants[index],
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      const updatedParticipants = [...participants];
      updatedParticipants[index] = updatedParticipant;
      this.persistSync(updatedParticipants);

      return updatedParticipant;
    });
  }
}