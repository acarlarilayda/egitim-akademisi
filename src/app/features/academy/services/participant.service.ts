import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Participant } from '../models/participant.model';
import { demoParticipants } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-participants';

/**
 * Katılımcı (Participant) CRUD işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private participantsSubject = new BehaviorSubject<Participant[]>([]);
  public participants$: Observable<Participant[]> = this.participantsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoParticipants);
    this.loadParticipants();
  }

  private loadParticipants(): void {
    const participants = this.storageService.getItem<Participant>(STORAGE_KEY);
    this.participantsSubject.next(participants);
  }

  /**
   * Tüm katılımcıları senkron olarak döner.
   */
  getAll(): Participant[] {
    return this.participantsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip katılımcıyı bulur.
   */
  getById(id: string): Participant | undefined {
    return this.participantsSubject.value.find((participant) => participant.id === id);
  }

  /**
   * Yeni bir katılımcı oluşturur. Yeni katılımcılar varsayılan olarak aktif başlar.
   */
  create(participantData: Omit<Participant, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Participant {
    const now = new Date().toISOString();
    const newParticipant: Participant = {
      ...participantData,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const updatedParticipants = [...this.participantsSubject.value, newParticipant];
    this.storageService.setItem(STORAGE_KEY, updatedParticipants);
    this.participantsSubject.next(updatedParticipants);

    return newParticipant;
  }

  /**
   * Bir katılımcının bilgilerini günceller.
   */
  update(id: string, changes: Partial<Omit<Participant, 'id' | 'createdAt'>>): Participant | undefined {
    const participants = this.participantsSubject.value;
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

    this.storageService.setItem(STORAGE_KEY, updatedParticipants);
    this.participantsSubject.next(updatedParticipants);

    return updatedParticipant;
  }
}