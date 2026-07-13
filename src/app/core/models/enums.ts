/**
 * Kurs durumları.
 * İzinli geçişler: Taslak -> Yayında -> Tamamlandı -> Arşivlendi
 * Kural: Yayındaki bir kursun zorunlu alanları eksik olamaz.
 */
export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Completed = 'completed',
  Archived = 'archived',
}

/**
 * Katılımcı kayıt (Enrollment) durumları.
 * İzinli geçişler: Beklemede -> Onaylandı -> Aktif -> (Tamamlandı | İptal)
 * Kural: Aynı katılımcı aynı kursa ikinci kez aktif kayıt oluşturamaz.
 */
export enum EnrollmentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * Sınav sorusu durumu.
 * Kural: Yayındaki (aktif) bir soru silinemez, sadece pasife alınabilir.
 */
export enum QuestionStatus {
  Active = 'active',
  Inactive = 'inactive',
}

/**
 * Sertifika uygunluk durumu.
 * Kural: "Eligible" olmak için katılım oranı VE sınav başarı şartı birlikte sağlanmalı.
 */
export enum CertificateEligibilityStatus {
  Pending = 'pending',
  Eligible = 'eligible',
  Issued = 'issued',
}

/**
 * Kullanıcı rolleri — route guard ve yetki kontrolünde kullanılacak.
 */
export enum UserRole {
  EgitimYoneticisi = 'egitim_yoneticisi',
  Egitmen = 'egitmen',
  Katilimci = 'katilimci',
}