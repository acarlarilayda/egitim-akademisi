import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';

/**
 * Yeniden kullanılabilir onay (confirm) diyaloğu.
 *
 * "Silme/iptal/onay gibi kritik işlemler confirm dialog olmadan
 * yapılmamalıdır" kuralını karşılamak için tüm durum geçişi, iptal ve
 * sertifika verme gibi geri döndürülemez işlemlerde kullanılır.
 * Tarayıcının çirkin/tutarsız `window.confirm()` popup'ı yerine projenin
 * kendi tasarım diline (renk, tipografi) uyan bir modal sağlar.
 *
 * Kullanım:
 * ```html
 * <app-confirm-dialog
 *   [open]="confirmOpen"
 *   title="Kursu Yayına Al"
 *   message="Bu kursu yayına almak istediğinize emin misiniz?"
 *   confirmLabel="Yayına Al"
 *   (confirmed)="onConfirmed()"
 *   (cancelled)="confirmOpen = false"
 * ></app-confirm-dialog>
 * ```
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogComponent],
  template: `
    <app-dialog [open]="open" [title]="title" (closed)="onCancel()">
      <p class="confirm-dialog__message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button type="button" class="confirm-dialog__cancel" (click)="onCancel()">{{ cancelLabel }}</button>
        <button
          type="button"
          class="confirm-dialog__confirm"
          [class.confirm-dialog__confirm--danger]="danger"
          (click)="onConfirm()"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </app-dialog>
  `,
  styles: [`
    .confirm-dialog__message {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-lg);
      line-height: 1.5;
    }

    .confirm-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-sm);
    }

    .confirm-dialog__cancel {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background-color: var(--color-surface);
      color: var(--color-text-primary);
      cursor: pointer;
      font-size: var(--font-size-sm);
    }

    .confirm-dialog__confirm {
      padding: var(--space-sm) var(--space-md);
      border: none;
      border-radius: 6px;
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    .confirm-dialog__confirm--danger {
      background-color: var(--color-danger);
    }
  `],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Emin misiniz?';
  @Input() message = 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?';
  @Input() confirmLabel = 'Onayla';
  @Input() cancelLabel = 'Vazgeç';
  /** true ise onay butonu tehlikeli/geri döndürülemez bir işlemi vurgulayan kırmızı renkte gösterilir (örn. iptal). */
  @Input() danger = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}