# 🚀 Proje Dağıtım ve Yönetim Sistemi (Project Distribution & Management System)

Modern, rol tabanlı (Admin, Proje Yöneticisi, Geliştirici) iş akışlarını, yetenek odaklı görev dağıtımlarını, dosya eklerini, silinen verilerin kurtarılmasını (Soft Delete) ve otomatik e-posta bildirimlerini merkezi olarak yöneten kurumsal web tabanlı proje yönetim platformu.

---

## 🌟 Canlı Demo & Dağıtım
- 🔗 **Canlı URL:** [proje-dagitim-sistemi.vercel.app](https://proje-dagitim-sistemi.vercel.app)
- ⚡ **Dağıtım Mimarisi:** Vercel CI/CD Pipeline ile otomatik build & deploy

---

## 🎯 Projenin Amacı & Çözülen Problemler
Yazılım ekiplerinde yaşanan yetki karmaşasını, manuel iş dağıtımından doğan zaman kayıplarını ve dağınık iletişim kanallarını ortadan kaldırmak amacıyla geliştirilmiştir:

- **Net Rol & Yetki İzolasyonu:** Admin, PM ve Developer panelleri ve API seviyesinde rol doğrulamaları ile tam yetki ayrımı.
- **Güvenli Kayıt & Admin Onay Akışı:** Yeni kayıt olan kullanıcıların hemen yetki almasını engelleyen onay mekanizması (`isApproved`, `approvalStatus`) ve şifre belirleme davet token'ları (`inviteToken`).
- **Yetenek Odaklı Görev Dağıtımı:** Geliştiricilerin uzmanlık alanlarına (`skills`) göre doğru projelere ve görevlere filtrelenerek atanabilmesi.
- **Kayıpsız Veri Mimarisi (Soft Delete & Trash):** Silinen kullanıcı, proje ve görevlerin anında silinmesi yerine `deletedAt` bayrağı ile arşivlenmesi ve çöp kutusundan tek tıkla geri döndürülebilmesi.
- **Ekip İçi İletişim & Dokümantasyon:** Görevler altında yorumlaşma ve her göreve özel dosya/tasarım/ekran görüntüsü yükleme imkanı.

---

## ✨ Kapsamlı Modüller ve Özellikler

### 🛡️ 1. Admin Yönetim Paneli
- **Kullanıcı Onay/Ret İşlemleri:** Bekleyen kayıtları listeleme, onaylama ve reddetme.
- **Otomatik E-Posta Tetikleyicileri:** Onaylanan kullanıcılara otomatik aktivasyon/şifre belirleme bağlantısı, reddedilenlere bilgilendirme maili.
- **Kullanıcı Durum Kontrolü:** Kullanıcıları aktif/pasif duruma getirme, şifre sıfırlama talepleri ve çöp kutusuna gönderme.
- **Dinamik Kullanıcı Detay Modalı:**
  - **PM Tıklandığında:** Yönettiği projelerin toplam sayısı ve proje başlıklarının listesi.
  - **Developer Tıklandığında:** Tanımlı uzmanlık ve yetenek rozetleri (`skills`).
- **Sistem İstatistikleri:** Toplam kullanıcı, aktif proje, bekleyen onay ve tamamlanan görevlerin anlık metrik kartları.

### 📁 2. Proje Yöneticisi (PM) Paneli
- **Proje Oluşturma & Planlama:** Başlangıç/bitiş tarihleri, açıklamalar ve proje kapsamı belirleme.
- **Görev (Task) Yönetimi:** Görev oluşturma, öncelik atama (`LOW`, `MEDIUM`, `HIGH`) ve durum yönetimi (`TODO`, `IN_PROGRESS`, `DONE`).
- **Geliştirici Atama:** Projedeki görevlere geliştiricileri yeteneklerine göre atama ve iş yükü takibi.

### 💻 3. Geliştirici (Developer) Paneli
- **Kişiselleştirilmiş Görev Paneli:** Yalnızca üzerine atanan aktif ve tamamlanan görevleri listeleme.
- **Durum Güncelleme & Yorumlaşma:** Görev durumlarını gerçek zamanlı değiştirme, yorum ekleme.
- **Dosya & Ek Yükleme:** Görev ve yorumlara teknik doküman, ekran görüntüsü veya tasarım dosyalarını ekleme.
- **Profil & Yetenek Yönetimi:** Kendi yetenek havuzunu (`skills`) güncelleme.

### 🗑️ 4. Çöp Kutusu (Trash Bin & Soft Delete)
- Silinen kullanıcılar, projeler ve görevler ayrı bir çöp kutusu sekmesinde listelenir.
- Kalıcı olarak silme (`Hard Delete`) veya sisteme eksiksiz geri yükleme (`Restore`) desteği.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router)** | Server & Client Components, modern sayfa yönlendirmeleri |
| **Dil** | **TypeScript** | Uçtan uca tip güvenliği ve derleme denetimi |
| **Stil & UI** | **Tailwind CSS & Lucide Icons** | Tam responsive, modern kart ve modal tasarımları |
| **Veritabanı & ORM** | **PostgreSQL / MySQL + Prisma ORM** | İlişkisel veri modelleme, migration ve sorgu optimizasyonu |
| **E-Posta Servisi** | **Nodemailer / Resend** | SMTP entegrasyonlu dinamik e-posta şablonları |
| **Dosya Yönetimi** | **Multipart Form-Data / Upload API** | Görev ekleri ve doküman depolama altyapısı |
| **Kimlik Doğrulama** | **JWT & Token Doğrulama** | Güvenli oturum açma, şifre sıfırlama ve davet token'ları |
| **Dağıtım (Hosting)** | **Vercel** | Otomatik CI/CD entegrasyonu ve Edge desteği |

---

## 📂 Mimari ve Dizin Yapısı

```bash
proje-dagitim-appcd/
├── app/
│   ├── api/
│   │   ├── admin/               # Kullanıcı onay, detay, rol yönetimi ve istatistik API'leri
│   │   ├── auth/                # Login, register, token doğrulama ve şifre belirleme
│   │   ├── developer/           # Geliştirici görev ve durum güncellemeleri
│   │   ├── projects/            # Proje CRUD işlemleri
│   │   ├── tasks/               # Görev atama, durum değiştirme ve yorum endpoint'leri
│   │   ├── upload/              # Dosya ve görsel yükleme servisi
│   │   └── trash/               # Çöp kutusu listeleme ve geri alma (restore) API'leri
│   ├── dashboard/
│   │   ├── admin/               # Admin paneli sayfaları
│   │   ├── pm/                  # Proje yöneticisi sayfaları
│   │   └── developer/           # Geliştirici paneli sayfaları
│   ├── layout.tsx
│   └── page.tsx
├── components/                  # UserDetailModal, ChangePasswordModal vb. ortak bileşenler
├── lib/
│   ├── prisma.ts                # Prisma Client tekil bağlantı havuzu
│   ├── auth.ts                  # Oturum ve rol kontrol fonksiyonları
│   └── mail.ts                  # Otomatik bildirim maili gönderim servisi
├── prisma/
│   └── schema.prisma            # Veri modelleri (User, Project, Task, Comment, File)
└── public/                      # Favicon, ikonlar ve statik dosyalar