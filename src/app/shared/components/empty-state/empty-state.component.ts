import { Component, Input } from '@angular/core';

/**
 * Paylaşılan "boş durum" (empty state) bileşeni.
 *
 * Bir liste/tablo/panel filtre sonucu boşsa veya hiç kayıt yoksa
 * kullanılır. Öncesinde her sayfa kendi `<p>` etiketini ve kendi CSS
 * class'ını tanımlıyordu (örn. `tab-panel__empty`, `dashboard__panel-empty`);
 * bu bileşen o tekrarı tek bir yere topluyor, böylece boş durumun görünümü
 * (ikon, boşluk, renk) her yerde tutarlı olur ve ileride değiştirilmek
 * istendiğinde tek bir dosyadan güncellenir.
 *
 * Kullanım:
 * ```html
 * <app-empty-state message="Bu kursa ait modül yok." />
 * <app-empty-state message="Arama kriterlerine uyan kayıt yok." icon="🔍" />
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <span class="empty-state__icon">{{ icon }}</span>
      <span class="empty-state__message">{{ message }}</span>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() message = 'Kayıt bulunamadı.';
  @Input() icon = '📭';
}