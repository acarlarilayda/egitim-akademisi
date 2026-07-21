import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Oturum (auth) guard'ı.
 *
 * Aktif kullanıcının var olup olmadığını kontrol eder. Proje şu an
 * gerçek bir login ekranı yerine sağ üstteki "Demo Rol" seçiciyle
 * çalıştığı için (bkz. SessionService), bu kontrol normal kullanımda
 * her zaman geçer; buradaki amaç, ileride gerçek bir kimlik doğrulama
 * (login/token) akışı eklendiğinde route'ları korumak için hazır bir
 * yapı bulunmasıdır. Aktif kullanıcı herhangi bir sebeple boş/undefined
 * olursa kullanıcıyı Dashboard'a yönlendirir.
 */
export const authGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};