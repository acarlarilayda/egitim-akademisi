import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Yeniden kullanılabilir modal/dialog bileşeni. Create/update formlarını
 * ve onay (confirm) içeriklerini barındırmak için kullanılır.
 * İçerik <ng-content> ile projekte edilir; başlık ve açık/kapalı durumu
 * dışarıdan @Input ile kontrol edilir.
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';

  /** Kullanıcı kapatma butonuna veya arka plana tıkladığında tetiklenir. */
  @Output() closed = new EventEmitter<void>();

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}