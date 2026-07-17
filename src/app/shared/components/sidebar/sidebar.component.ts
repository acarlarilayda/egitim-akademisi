import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../../core/models/nav-item.model';
import { SessionService } from '../../../core/services/session.service';

/**
 * Sidebar.
 *
 * İki bağımsız durumu var:
 * - `collapsed` (masaüstü): daraltılmış/genişletilmiş görünüm, kullanıcının
 *   kendi tercihiyle değişir, bileşen içinde tutulur.
 * - `mobileOpen` (mobil, `< 768px`): parent (MainLayoutComponent) tarafından
 *   kontrol edilen overlay/drawer durumu; hamburger butonla açılır, bir linke
 *   tıklanınca veya arka plana (backdrop) tıklanınca kapanır.
 *
 * Menü öğeleri, aktif kullanıcının rolüne göre filtrelenir — yetkisiz
 * olduğu sayfalar menüde hiç görünmez.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (mobileOpen) {
      <div class="sidebar__backdrop" (click)="closeMobile.emit()"></div>
    }

    <aside
      class="sidebar"
      [class.sidebar--collapsed]="collapsed()"
      [class.sidebar--mobile-open]="mobileOpen"
    >
      <div class="sidebar__header">
        @if (!collapsed()) {
          <span class="sidebar__title">Eğitim Akademisi</span>
        }
        <button
          type="button"
          class="sidebar__toggle"
          (click)="toggleCollapsed()"
          [attr.aria-label]="collapsed() ? 'Menüyü genişlet' : 'Menüyü daralt'"
        >
          {{ collapsed() ? '»' : '«' }}
        </button>
      </div>

      <nav class="sidebar__nav">
        @for (item of visibleNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="sidebar__link--active"
            class="sidebar__link"
            (click)="closeMobile.emit()"
          >
            <span class="sidebar__icon">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span class="sidebar__label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: var(--sidebar-width);
      height: 100vh;
      background-color: var(--color-surface);
      border-right: 1px solid var(--color-border);
      transition: width 0.2s ease, transform 0.2s ease;
      overflow-x: hidden;
    }

    .sidebar--collapsed {
      width: var(--sidebar-width-collapsed);
    }

    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--topbar-height);
      padding-inline: var(--space-md);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .sidebar__title {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
    }

    .sidebar__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background-color: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      flex-shrink: 0;
    }

    .sidebar__toggle:hover {
      background-color: var(--color-surface-alt);
    }

    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding: var(--space-md);
      overflow-y: auto;
    }

    .sidebar__link {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      text-decoration: none;
      white-space: nowrap;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .sidebar__link:hover {
      background-color: var(--color-surface-alt);
      color: var(--color-text-primary);
    }

    .sidebar__link--active {
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
    }

    .sidebar__icon {
      font-size: var(--font-size-md);
      flex-shrink: 0;
    }

    .sidebar__label {
      font-size: var(--font-size-sm);
    }

    .sidebar__backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.45);
      z-index: 20;
    }

    /* Mobilde sidebar varsayılan olarak ekran dışına gizlenir; sadece
       mobileOpen true iken içeri kayar (overlay/drawer davranışı). */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        inset-block: 0;
        left: 0;
        z-index: 21;
        width: var(--sidebar-width);
        transform: translateX(-100%);
        box-shadow: var(--shadow-md);
      }

      .sidebar--collapsed {
        width: var(--sidebar-width);
      }

      .sidebar--mobile-open {
        transform: translateX(0);
      }
    }
  `],
})
export class SidebarComponent {
  private readonly sessionService = inject(SessionService);

  /** Mobil overlay açık/kapalı durumu — MainLayoutComponent tarafından yönetilir. */
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  protected readonly collapsed = signal(false);

  protected get visibleNavItems() {
    return NAV_ITEMS.filter((item) => this.sessionService.hasRole(item.roles));
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }
}