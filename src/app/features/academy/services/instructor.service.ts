import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { Instructor } from '../models/instructor.model';
import { demoInstructors } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-instructors';

/**
 * Eğitmen (Instructor) CRUD işlemlerini yönetir.
 */
@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  private instructorsSubject = new BehaviorSubject<Instructor[]>([]);
  public instructors$: Observable<Instructor[]> = this.instructorsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.storageService.seedIfEmpty(STORAGE_KEY, demoInstructors);
    this.loadInstructors();
  }

  private loadInstructors(): void {
    const instructors = this.storageService.getItem<Instructor>(STORAGE_KEY);
    this.instructorsSubject.next(instructors);
  }

  /**
   * Tüm eğitmenleri senkron olarak döner.
   */
  getAll(): Instructor[] {
    return this.instructorsSubject.value;
  }

  /**
   * Belirtilen ID'ye sahip eğitmeni bulur.
   */
  getById(id: string): Instructor | undefined {
    return this.instructorsSubject.value.find((instructor) => instructor.id === id);
  }

  /**
   * Yeni bir eğitmen oluşturur. Yeni eğitmenler varsayılan olarak aktif başlar.
   */
  create(instructorData: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Instructor {
    const now = new Date().toISOString();
    const newInstructor: Instructor = {
      ...instructorData,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const updatedInstructors = [...this.instructorsSubject.value, newInstructor];
    this.storageService.setItem(STORAGE_KEY, updatedInstructors);
    this.instructorsSubject.next(updatedInstructors);

    return newInstructor;
  }
  /**
   * Bir eğitmenin bilgilerini günceller (isActive dahil — burada özel
   * bir status workflow kuralı olmadığı için tüm alanlar serbestçe
   * değiştirilebilir).
   */
  update(id: string, changes: Partial<Omit<Instructor, 'id' | 'createdAt'>>): Instructor | undefined {
    const instructors = this.instructorsSubject.value;
    const index = instructors.findIndex((instructor) => instructor.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedInstructor: Instructor = {
      ...instructors[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    const updatedInstructors = [...instructors];
    updatedInstructors[index] = updatedInstructor;

    this.storageService.setItem(STORAGE_KEY, updatedInstructors);
    this.instructorsSubject.next(updatedInstructors);

    return updatedInstructor;
  }
}