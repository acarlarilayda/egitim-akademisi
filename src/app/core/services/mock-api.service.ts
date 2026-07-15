import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/** Bir mock API çağrısı için opsiyonel ayarlar. */
export interface MockApiOptions {
  /** Simüle edilen ağ gecikmesi (ms). Varsayılan: 350ms. */
  delayMs?: number;
  /** Hata simülasyon olasılığı (0-1 arası). Varsayılan: %5. */
  errorRate?: number;
  /** Hata durumunda fırlatılacak Error'un mesajı. */
  errorMessage?: string;
}

const DEFAULT_DELAY_MS = 350;
const DEFAULT_ERROR_RATE = 0.05;
const DEFAULT_ERROR_MESSAGE = 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.';

/**
 * Gerçek bir backend bulunmadığı için, senkron localStorage tabanlı
 * işlemleri gerçekçi bir API çağrısı gibi simüle eder:
 * - Ağ gecikmesi (delay) ekler, böylece loading state gerçekten görülebilir.
 * - Belirli bir olasılıkla rastgele hata fırlatır, böylece error state
 *   ekranlarda gerçek koşullarda test edilebilir.
 *
 * Kullanım: feature servisleri, localStorage okuma/yazma içeren senkron
 * bir fonksiyonu `simulateRequest` ile sarmalayarak Observable döner hale getirir.
 */
@Injectable({
  providedIn: 'root',
})
export class MockApiService {
  simulateRequest<T>(action: () => T, options: MockApiOptions = {}): Observable<T> {
    const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
    const errorRate = options.errorRate ?? DEFAULT_ERROR_RATE;
    const errorMessage = options.errorMessage ?? DEFAULT_ERROR_MESSAGE;

    return timer(delayMs).pipe(
      switchMap(() => {
        if (Math.random() < errorRate) {
          return throwError(() => new Error(errorMessage));
        }

        try {
          const result = action();
          return new Observable<T>((subscriber) => {
            subscriber.next(result);
            subscriber.complete();
          });
        } catch (err) {
          return throwError(() => err);
        }
      })
    );
  }
}