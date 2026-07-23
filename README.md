# Eğitim Akademisi — Kurs ve Sınav Yönetim Paneli

Angular 17+ ile geliştirilen, kurs, katılımcı, sınav, sertifika ve audit log
yönetimi içeren kapsamlı bir eğitim akademisi yönetim panelidir.

## 🔗 Canlı Demo
[egitim-akademisi.vercel.app](https://egitim-akademisi.vercel.app)

## 📋 Proje Hakkında

Uygulama; kurs/modül/ders planlaması, katılımcı kayıt (enrollment) süreci,
sınav ve sınav sonucu yönetimi, devam takibi, sertifika uygunluk
değerlendirmesi ve tüm kritik işlemlerin izlenebildiği bir audit log
ekranından oluşur. Her modülde rol bazlı yetkilendirme, workflow durum
geçişleri ve iş kuralı validasyonları uygulanmıştır.

## 🚀 Kurulum

```bash
npm install
```

## ▶️ Çalıştırma

```bash
npm start
```

veya

```bash
ng serve
```

Uygulama `http://localhost:4200` adresinde açılır. Kaynak dosyalarda yapılan
değişikliklerde sayfa otomatik olarak yeniden yüklenir.

## ✅ Testleri Çalıştırma

```bash
npm test
```

veya

```bash
ng test
```

Kritik servisler (`enrollment`, `course`, `question`, `exam-result`,
`attendance-record`, `certificate-eligibility`), validator'lar (`date-range`,
`no-whitespace`, `positive-number`) ve `session` servisi için unit testler
mevcuttur.

## 🧑‍💻 Demo Kullanıcıları

Projede henüz gerçek bir login/kimlik doğrulama ekranı bulunmuyor; bunun
yerine üst menüdeki **rol değiştirici** üzerinden aşağıdaki 3 demo
kullanıcı arasında anlık olarak geçiş yapılabilir. Aktif rol
`localStorage`'da saklanır ve sayfa yenilense de korunur.

| Rol                  | Demo Kullanıcı | Yetki / Davranış                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------------ |
| **Eğitim Yöneticisi** | Elif Yıldız     | Tüm modüllere tam erişim; onay, atama, durum değişikliği ve rapor ekranları |
| **Eğitmen**           | Mert Kaya       | Yalnızca kendi kurslarında (sınav, sınav sonucu, devam kaydı) işlem yapabilir |
| **Katılımcı**         | Ayşe Demir      | Yalnızca kendi kayıt/sonuç/sertifika bilgilerini görüntüleyebilir         |

Rol bazlı kısıtlamalar route guard'lar (`auth.guard.ts`, `role.guard.ts`) ve
`appPermission` directive'i üzerinden uygulanır.

## 🏗️ Mimari

Proje feature-based bir klasör yapısı kullanır:

```
src/app/
├── core/               # Uygulama genelinde kullanılan alt yapı
│   ├── guards/         # auth / role / unsaved-changes guard'ları
│   ├── mock-data/      # Demo veri seti (localStorage'a ilk yüklemede yazılır)
│   ├── models/         # Ortak modeller (AuditLogEntry, enums, base model)
│   └── services/       # mock-api, session, audit-log, storage, theme, notification
├── features/
│   └── academy/
│       ├── models/     # Course, CourseModule, Lesson, Instructor, Participant,
│       │                 Enrollment, Exam, Question, ExamResult,
│       │                 AttendanceRecord, CertificateEligibility
│       ├── services/   # Her modül için CRUD + iş kuralı servisleri
│       ├── pages/       # Liste/form/detay sayfaları (route ile eşleşir)
│       └── academy.routes.ts
└── shared/
    ├── components/     # data-table, dialog, empty-state, form-field vb. reusable bileşenler
    ├── directives/      # permission, debounce, autofocus
    ├── pipes/           # status-label
    └── validators/      # date-range, no-whitespace, positive-number
```

**Veri katmanı:** Gerçek bir backend yerine `mock-api.service.ts` üzerinden
localStorage'a yazan/okuyan bir servis katmanı kullanılır; uygulama ilk
açıldığında `core/mock-data/demo-data.ts` içindeki gerçekçi demo veri seti
localStorage'a yüklenir.

**State yönetimi:** Angular Signals (`signal`, `computed`) tercih edilmiştir;
örneğin sertifika uygunluğu hesaplaması bir `computed` signal ile yapılır.

**İş kuralları:** Kayıt (enrollment) durum geçişleri sabit bir workflow'a
(Beklemede → Onaylandı → Aktif → Tamamlandı/İptal) bağlıdır, her geçiş audit
log'a yazılır; bir katılımcı aynı kursa ikinci kez aktif kayıt oluşturamaz;
sınav geçme notu kurs bazında tanımlanır ve sonuçlar doğru/yanlış sayısından
otomatik hesaplanır.

## 📌 Bilinen Eksikler / Kapsam Dışı Bırakılanlar

- Gerçek bir kimlik doğrulama (login/şifre) akışı yoktur; rol geçişi demo
  amaçlı üst menüdeki rol değiştirici ile yapılır.
- `money`, `date` ve `remaining-time` gibi ek pipe'lar eklenmemiştir; projede
  parasal bir alan bulunmadığı ve tarih gösterimi için Angular'ın built-in
  `date` pipe'ı kullanıldığı için ihtiyaç duyulmamıştır.
- E2E (uçtan uca) test paketi kurulmamıştır; kapsam unit testlerle
  sınırlıdır (bkz. "Testleri Çalıştırma" bölümü).