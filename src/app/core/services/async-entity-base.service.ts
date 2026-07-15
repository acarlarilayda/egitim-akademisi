import { signal } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { StorageService } from './storage.service';
import { MockApiService, MockApiOptions } from './mock-api.service';

/**
 * localStorage tabanlı, mock API ile asenkron davranan CRUD servisleri için
 * ortak temel sınıf. Tekrar eden state yönetimi (BehaviorSubject, loading
 * signal, localStorage okuma/yazma) burada tutulur; her feature servisi
 * sadece kendine özgü iş kurallarını (create/update/workflow) yazar.
 *
 * - `items$`  : ekranların abone olacağı canlı liste (her başarılı yazmadan sonra günceller)
 * - `loading` : component'lerde loading spinner göstermek için kullanılacak signal
 * - `xxxSync` : servis içi zincirleme iş kuralları için senkron erişim (component'lere açılmaz)
 */
export abstract class AsyncEntityService<T extends { id: string }> {
  protected readonly itemsSubject: BehaviorSubject<T[]>;
  readonly items$: Observable<T[]>;
  readonly loading = signal(false);

  protected constructor(
    protected readonly storageKey: string,
    protected readonly storageService: StorageService,
    protected readonly mockApi: MockApiService,
    seedData: T[]
  ) {
    this.storageService.seedIfEmpty(storageKey, seedData);
    this.itemsSubject = new BehaviorSubject<T[]>(this.storageService.getItem<T>(storageKey));
    this.items$ = this.itemsSubject.asObservable();
  }

  /** Mevcut listeyi (anlık, senkron) döner — sadece servis içi kullanım için. */
  protected getAllSync(): T[] {
    return this.itemsSubject.value;
  }

  /** Belirtilen ID'ye sahip kaydı senkron bulur — sadece servis içi kullanım için. */
  protected getByIdSync(id: string): T | undefined {
    return this.itemsSubject.value.find((item) => item.id === id);
  }

  /** Yeni listeyi hem localStorage'a hem de canlı stream'e yazar. */
  protected persistSync(items: T[]): void {
    this.storageService.setItem(this.storageKey, items);
    this.itemsSubject.next(items);
  }

  /**
   * Senkron bir işlemi, gecikme + rastgele hata simülasyonu ile Observable'a
   * çevirir ve işlem sürerken `loading` signal'ini true yapar.
   */
  protected runAsync<R>(action: () => R, options?: MockApiOptions): Observable<R> {
    this.loading.set(true);
    return this.mockApi.simulateRequest(action, options).pipe(finalize(() => this.loading.set(false)));
  }

  /** Tüm kayıtları asenkron olarak (mock API üzerinden) döner. */
  getAll(): Observable<T[]> {
    return this.runAsync(() => this.getAllSync());
  }

  /** Belirtilen ID'ye sahip kaydı asenkron olarak döner. */
  getById(id: string): Observable<T | undefined> {
    return this.runAsync(() => this.getByIdSync(id));
  }
}