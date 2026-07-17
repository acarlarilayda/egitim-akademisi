import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { UserRole } from '../models/enums';

/**
 * Rol bazlı route guard.
 *
 * Route tanımında `data: { roles: [UserRole...] }` verilmişse, aktif
 * kullanıcının rolü bu listede yoksa erişim engellenir ve kullanıcı
 * `/dashboard?yetkisiz=1` adresine yönlendirilir (Dashboard bu query
 * parametresini görünce kısa bir "yetkiniz yok" uyarısı gösterir).
 * `data.roles` tanımlı değilse route tüm rollere açıktır (örn. Dashboard).
 *
 * Route tanımlarındaki `data.roles` erişim matrisi, sidebar menü
 * filtrelemesiyle (`nav-item.model.ts`) tutarlı tutulmalıdır.
 */
export const roleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (sessionService.hasRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard'], { queryParams: { yetkisiz: 1 } });
};