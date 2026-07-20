import { Pipe, PipeTransform } from '@angular/core';

/**
 * Enum tabanlı durum (status) değerlerini (CourseStatus, EnrollmentStatus,
 * QuestionStatus, CertificateEligibilityStatus...) kullanıcıya gösterilecek
 * Türkçe etikete çevirir. Tabloda/listelerde ham İngilizce enum değeri
 * (örn. "published") yerine "Yayında" gibi okunabilir bir metin gösterir.
 *
 * Bilinmeyen bir değer gelirse (örn. yeni bir status eklenip buraya
 * işlenmediyse) ham değeri olduğu gibi döner, böylece sessizce veri
 * kaybolmaz.
 */
const STATUS_LABELS: Record<string, string> = {
  // CourseStatus
  draft: 'Taslak',
  published: 'Yayında',
  completed: 'Tamamlandı',
  archived: 'Arşivlendi',
  // EnrollmentStatus
  pending: 'Beklemede',
  approved: 'Onaylandı',
  active: 'Aktif',
  cancelled: 'İptal Edildi',
  // QuestionStatus
  inactive: 'Pasif',
  // CertificateEligibilityStatus
  eligible: 'Uygun',
  issued: 'Verildi',
};

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return STATUS_LABELS[value] ?? value;
  }
}