import { Component, EventEmitter, Output } from '@angular/core';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { RoleSwitcherComponent } from '../role-switcher/role-switcher.component';

/**
 * Topbar. Mobilde (`< 768px`) sol tarafta bir hamburger buton belirir ve
 * `menuToggle` event'i ile sidebar'ın mobil overlay durumunu açar/kapatır
 * (buton görünürlüğü CSS media query ile yönetilir).
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ThemeToggleComponent, RoleSwitcherComponent],
  template: `
    <header class="topbar">
      <div class="topbar__start">
        <button
          type="button"
          class="topbar__menu-button"
          (click)="menuToggle.emit()"
          aria-label="Menüyü aç/kapat"
        >
          ☰
        </button>
        <h1 class="topbar__title">Eğitim Akademisi</h1>
      </div>
      <div class="topbar__actions">
        <app-role-switcher />
        <app-theme-toggle />
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--topbar-height);
      padding-inline: var(--space-lg);
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .topbar__start {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-width: 0;
    }

    .topbar__menu-button {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: transparent;
      color: var(--color-text-primary);
      font-size: var(--font-size-md);
      cursor: pointer;
      flex-shrink: 0;
    }

    .topbar__title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar__actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-shrink: 0;
    }

    /* Hamburger buton sadece mobilde görünür; sidebar bu genişlikte
       overlay/drawer moduna geçer (bkz. sidebar.component.ts). */
    @media (max-width: 768px) {
      .topbar__menu-button {
        display: flex;
      }

      .topbar__title {
        font-size: var(--font-size-md);
      }
    }
  `],
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
}