import { Injectable, computed, signal } from '@angular/core';
import { UserRole } from '../models/enums';

const STORAGE_KEY = 'egitim-akademisi-active-role';

/** Demo kullanıcı — henüz gerçek bir login akışı olmadığı için sadece
 * rol bazlı davranışı test/demo edebilmek amacıyla tanımlanmıştır. */
export interface DemoUser {
  fullName: string;
  role: UserRole;
}

export const DEMO_USERS: DemoUser[] = [
  { fullName: 'Elif Yıldız', role: UserRole.EgitimYoneticisi },
  { fullName: 'Mert Kaya', role: UserRole.Egitmen },
  { fullName: 'Ayşe Demir', role: UserRole.Katilimci },
];

/**
 * Uygulamanın "kim olarak giriş yapıldığı" bilgisini tutan servis.
 *
 * Projede henüz bir login ekranı bulunmadığından, aktif kullanıcı/rol
 * localStorage'da (ThemeService ile aynı desende) saklanır ve topbar'daki
 * demo rol değiştirici üzerinden anlık olarak değiştirilebilir.
 * Route guard'lar ve `appPermission` directive'i bu servisin sağladığı
 * `currentRole` sinyaline göre karar verir.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly activeUser = signal<DemoUser>(this.getInitialUser());

  readonly currentUser = this.activeUser.asReadonly();
  readonly currentRole = computed(() => this.activeUser().role);

  readonly demoUsers = DEMO_USERS;

  setRole(role: UserRole): void {
    const user = DEMO_USERS.find((demoUser) => demoUser.role === role) ?? DEMO_USERS[0];
    this.activeUser.set(user);
    localStorage.setItem(STORAGE_KEY, user.role);
  }

  /** Aktif rolün, verilen rol listesinden biri olup olmadığını kontrol eder.
   * Rol listesi boş/undefined verilirse (kısıtlama yok) her zaman true döner. */
  hasRole(allowedRoles?: UserRole[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    return allowedRoles.includes(this.currentRole());
  }

  private getInitialUser(): DemoUser {
    const saved = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    const found = saved && DEMO_USERS.find((demoUser) => demoUser.role === saved);
    return found || DEMO_USERS[0];
  }
}