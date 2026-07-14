import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle"
      (click)="themeService.toggleTheme()"
      [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'"
    >
      @if (themeService.currentTheme() === 'dark') {
        <span>☀️</span>
      } @else {
        <span>🌙</span>
      }
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      cursor: pointer;
      font-size: var(--font-size-md);
      transition: background-color 0.2s ease;
    }

    .theme-toggle:hover {
      background-color: var(--color-surface-alt);
    }
  `],
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}