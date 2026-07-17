import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { UserRole } from '../../../core/models/enums';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.EgitimYoneticisi]: 'Eğitim Yöneticisi',
  [UserRole.Egitmen]: 'Eğitmen',
  [UserRole.Katilimci]: 'Katılımcı',
};

/**
 * Demo rol değiştirici.
 *
 * Henüz bir login ekranı bulunmadığı için, rol/yetki davranışını
 * (route guard + `appPermission` directive) canlı olarak test edebilmek
 * amacıyla topbar'a eklenen geçici bir bileşendir. Gerçek bir auth akışı
 * eklendiğinde bu bileşenin yerini login sonrası gelen kullanıcı/rol bilgisi alacaktır.
 */
@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="role-switcher">
      <span class="role-switcher__label">Demo Rol</span>
      <select
        class="role-switcher__select"
        [ngModel]="sessionService.currentRole()"
        (ngModelChange)="onRoleChange($event)"
        aria-label="Demo rol değiştirici"
      >
        @for (user of sessionService.demoUsers; track user.role) {
          <option [value]="user.role">{{ roleLabels[user.role] }} ({{ user.fullName }})</option>
        }
      </select>
    </label>
  `,
  styles: [`
    .role-switcher {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .role-switcher__label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    .role-switcher__select {
      font-size: var(--font-size-sm);
      padding: 6px var(--space-sm);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      color: var(--color-text-primary);
      cursor: pointer;
      max-width: 220px;
    }

    @media (max-width: 560px) {
      .role-switcher__label {
        display: none;
      }

      .role-switcher__select {
        max-width: 140px;
      }
    }
  `],
})
export class RoleSwitcherComponent {
  protected readonly sessionService = inject(SessionService);
  protected readonly roleLabels = ROLE_LABELS;

  protected onRoleChange(role: UserRole): void {
    this.sessionService.setRole(role);
  }
}