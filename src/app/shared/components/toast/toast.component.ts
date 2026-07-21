import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        class="toast-item"
        *ngFor="let notification of notificationService.notifications()"
        [attr.data-type]="notification.type"
      >
        <span class="toast-item__icon">
          {{ notification.type === 'success' ? '✓' : notification.type === 'error' ? '⚠️' : 'ℹ️' }}
        </span>
        <span class="toast-item__message">{{ notification.message }}</span>
        <button
          type="button"
          class="toast-item__close"
          (click)="notificationService.dismiss(notification.id)"
          aria-label="Kapat"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  constructor(protected notificationService: NotificationService) {}
}