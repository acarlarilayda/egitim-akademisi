import { CanDeactivateFn } from '@angular/router';

/**
 * Kaydedilmemiş değişikliği olan bir component'in uyması gereken sözleşme.
 * `hasUnsavedChanges()` true dönerse, kullanıcı sayfadan ayrılmaya
 * çalıştığında (route değişimi, geri tuşu vb.) onay istenir.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Genel amaçlı "kaydedilmemiş değişiklik" guard'ı.
 *
 * Route'a özel bir mantık yazmak yerine, component'in kendisi
 * `HasUnsavedChanges` arayüzünü uygular; guard sadece bu arayüzü çağırır.
 * Böylece tek bir guard, ileride başka route'lu form sayfaları eklenirse
 * onlarda da tekrar kullanılabilir — component tarafında sadece
 * `hasUnsavedChanges()` metodunu implemente etmek yeterlidir.
 *
 * Not: Bu guard yalnızca route bazlı (kendi URL'i olan) form sayfalarını
 * korur. Liste ekranlarındaki dialog/modal içinde açılan formlar (örn.
 * katılımcı ekleme, sınav sonucu girme) bir route değişikliği olmadan
 * kapandığı için bu guard'ın kapsamı dışındadır; onlar için modal'ın kendi
 * kapatma akışında ayrı bir onay adımı gerekir.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return window.confirm('Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinize emin misiniz?');
};