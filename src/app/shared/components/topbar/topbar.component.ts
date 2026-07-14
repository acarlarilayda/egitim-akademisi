import { Component } from '@angular/core';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ThemeToggleComponent],
  template: `
    <header class="topbar">
      <h1 class="topbar__title">Eğitim Akademisi</h1>
      <div class="topbar__actions">
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

    .topbar__title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .topbar__actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
  `],
})
export class TopbarComponent {}