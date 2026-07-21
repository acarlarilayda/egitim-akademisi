import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  private readonly defaultDurationMs = 4000;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: string): void {
    this.notificationsSignal.update((list) => list.filter((n) => n.id !== id));
  }

  private show(type: NotificationType, message: string): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.notificationsSignal.update((list) => [...list, { id, type, message }]);

    setTimeout(() => this.dismiss(id), this.defaultDurationMs);
  }
}