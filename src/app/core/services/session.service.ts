import { Injectable, computed, signal } from '@angular/core';
import { UserRole } from '../models/enums';

const STORAGE_KEY = 'egitim-akademisi-active-role';

/** Demo kullanıcı — henüz gerçek bir login akışı olmadığı için sadece
 * rol bazlı davranışı test/demo edebilmek amacıyla tanımlanmıştır.
 * `id`, audit log kayıtlarında "kim yaptı" bilgisini tutmak için kullanılır.
 * `instructorId`, Egitmen rolündeki demo kullanıcıyı `Instructor` veri
 * modelindeki karşılığına bağlar; "eğitmen sadece kendi kurslarının
 * sonuçlarını düzenleyebilir" kuralı bu alan üzerinden uygulanır. */
export interface DemoUser {
  id: string;
  fullName: string;
  role: UserRole;
  instructorId?: string;
}

export const DEMO_USERS: DemoUser[] = [
  { id: 'demo-egitim-yoneticisi', fullName: 'Elif Yıldız', role: UserRole.EgitimYoneticisi },
  { id: 'demo-egitmen', fullName: 'Mert Kaya', role: UserRole.Egitmen, instructorId: 'inst-2' },
  { id: 'demo-katilimci', fullName: 'Ayşe Demir', role: UserRole.Katilimci },
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

  /**
   * Aktif kullanıcının, verilen eğitmene ait bir kursu yönetip
   * yönetemeyeceğini belirler.
   * Eğitim Yöneticisi her kursu yönetebilir; Eğitmen sadece
   * `instructorId`'si kendisininkiyle eşleşen kursları yönetebilir.
   */
  canManageCourse(courseInstructorId: string): boolean {
    const user = this.activeUser();

    if (user.role === UserRole.EgitimYoneticisi) {
      return true;
    }

    if (user.role === UserRole.Egitmen) {
      return user.instructorId === courseInstructorId;
    }

    return false;
  }

  private getInitialUser(): DemoUser {
    const saved = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    const found = saved && DEMO_USERS.find((demoUser) => demoUser.role === saved);
    return found || DEMO_USERS[0];
  }
}