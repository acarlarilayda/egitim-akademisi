import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AsyncEntityService } from '../../../core/services/async-entity-base.service';
import { Instructor } from '../models/instructor.model';
import { demoInstructors } from '../../../core/mock-data/demo-data';

const STORAGE_KEY = 'academy-instructors';

/**
 * Eğitmen (Instructor) CRUD işlemlerini yönetir.
 * Tüm public metodlar mock API üzerinden asenkron çalışır.
 */
@Injectable({
  providedIn: 'root',
})
export class InstructorService extends AsyncEntityService<Instructor> {
  readonly instructors$ = this.items$;

  constructor(storageService: StorageService, mockApi: MockApiService) {
    super(STORAGE_KEY, storageService, mockApi, demoInstructors);
  }

  /**
   * Yeni bir eğitmen oluşturur. Yeni eğitmenler varsayılan olarak aktif başlar.
   */
  create(instructorData: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): Observable<Instructor> {
    return this.runAsync(() => {
      const now = new Date().toISOString();
      const newInstructor: Instructor = {
        ...instructorData,
        id: crypto.randomUUID(),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      this.persistSync([...this.getAllSync(), newInstructor]);
      return newInstructor;
    });
  }

  /**
   * Bir eğitmenin bilgilerini günceller (isActive dahil — burada özel
   * bir status workflow kuralı olmadığı için tüm alanlar serbestçe
   * değiştirilebilir).
   */
  update(id: string, changes: Partial<Omit<Instructor, 'id' | 'createdAt'>>): Observable<Instructor | undefined> {
    return this.runAsync(() => {
      const instructors = this.getAllSync();
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
      this.persistSync(updatedInstructors);

      return updatedInstructor;
    });
  }
}