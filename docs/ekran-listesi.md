# Ekran Listesi

Bu doküman, projede yer alacak tüm ekranları ve bağlı oldukları route'ları listeler. Her modül; listeleme, detay, oluşturma, düzenleme ve silme/iptal akışlarını kapsar; ayrıca loading, empty state, error state ve form validasyonu içerir.

## Genel

| Ekran | Route | Erişim |
|---|---|---|
| Dashboard | `/dashboard` | Tüm roller |

## Kurs Kataloğu

| Ekran | Route | Erişim |
|---|---|---|
| Kurs Listesi | `/kurslar` | Eğitim Yöneticisi, Eğitmen, Katılımcı (salt-okunur, sadece kayıtlı olduğu kurslar) |
| Yeni Kurs | `/kurslar/yeni` | Eğitim Yöneticisi |
| Kurs Detayı | `/kurslar/:id` | Eğitim Yöneticisi, Eğitmen, Katılımcı (salt-okunur; Katılımcılar/Sonuçlar sekmelerinde sadece kendi kaydı) |

## Ders/Modül Yönetimi

| Ekran | Route | Erişim |
|---|---|---|
| Modül Listesi | `/moduller` | Eğitim Yöneticisi, Eğitmen |

## Katılımcı Kayıtları

| Ekran | Route | Erişim |
|---|---|---|
| Katılımcı Listesi | `/katilimcilar` | Eğitim Yöneticisi |

## Sınav ve Soru Bankası

| Ekran | Route | Erişim |
|---|---|---|
| Sınav Listesi | `/sinavlar` | Eğitim Yöneticisi, Eğitmen |
| Soru Bankası | `/sinavlar/:examId/sorular` | Eğitim Yöneticisi, Eğitmen |

## Puanlama / Sonuçlar

| Ekran | Route | Erişim |
|---|---|---|
| Sonuç Listesi | `/sonuclar` | Eğitim Yöneticisi, Eğitmen (kayıt/düzenleme); Katılımcı (salt-okunur, sadece kendi sonuçları) |

## Sertifika Uygunluğu

| Ekran | Route | Erişim |
|---|---|---|
| Sertifika Listesi | `/sertifikalar` | Eğitim Yöneticisi (değerlendirme/verme); Katılımcı (salt-okunur, sadece kendi durumu) |

## Raporlama ve Audit Log

| Ekran | Route | Erişim |
|---|---|---|
| Audit Log | `/audit-log` | Eğitim Yöneticisi |

## Notlar

- Katılım takibi ayrı bir route yerine kurs/katılımcı detay ekranları içinde gösterilecektir.
- Tüm liste ekranlarında pagination, arama, filtreleme ve sıralama bulunacaktır.
- Kritik işlemler (silme, iptal, onay) confirm dialog ile korunacaktır.
- **Katılımcı rolü** salt-okunur bir "öğrenci portalı" görünümündedir: Modüller, Katılımcılar (yönetim listesi), Sınavlar/Soru Bankası ve Audit Log ekranlarına erişemez; Kurslar, Sonuçlar ve Sertifikalar ekranlarında ise sadece kendi kayıtlarını/kendi verisini görür, oluşturma/düzenleme/onay/durum değiştirme aksiyonları kendisine gösterilmez.
