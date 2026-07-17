import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

/**
 * Ana layout. Mobil sidebar'ın açık/kapalı durumunu burada tutar:
 * Topbar'daki hamburger buton `mobileMenuOpen` sinyalini toggle'lar,
 * Sidebar bunu `mobileOpen` input'u üzerinden alır ve linke tıklanınca
 * veya backdrop'a tıklanınca `closeMobile` ile kapatır. Sayfa değişiminde
 * (route navigasyonu) da otomatik kapanır, böylece bir sonraki ekrana
 * geçildiğinde overlay ekranda kalmaz.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout">
      <app-sidebar [mobileOpen]="mobileMenuOpen()" (closeMobile)="closeMobileMenu()" />
      <div class="layout__content">
        <app-topbar (menuToggle)="toggleMobileMenu()" />
        <main class="layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .layout__content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .layout__main {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-lg);
      background-color: var(--color-bg);
    }
  `],
})
export class MainLayoutComponent {
  protected readonly mobileMenuOpen = signal(false);

  constructor(router: Router) {
    router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.mobileMenuOpen.set(false));
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}