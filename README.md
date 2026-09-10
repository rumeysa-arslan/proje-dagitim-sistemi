# 🚀 Proje Dağıtım ve Yönetim Sistemi (Multi-Tenant SaaS Modeli)

Modern, rol tabanlı (SuperAdmin, Admin, Proje Yöneticisi, Analist, Geliştirici) iş akışlarını, yetenek odaklı görev dağıtımlarını, dosya eklerini, silinen verilerin kurtarılmasını (Soft Delete) ve otomatik e-posta bildirimlerini çok kiracılı (multi-tenant) bir yapıda yöneten kurumsal web tabanlı proje yönetim platformu.

---

## 🌟 Canlı Demo & Dağıtım
- 🔗 **Canlı URL:** [proje-dagitim-sistemi.vercel.app](https://proje-dagitim-sistemi.vercel.app)
- ⚡ **Dağıtım Mimarisi:** Vercel CI/CD Pipeline ile otomatik build & deploy

---

## 🎯 Projenin Amacı & Çözülen Problemler
Yazılım ekiplerinde yaşanan yetki karmaşasını, manuel iş dağıtımından doğan zaman kayıplarını ve dağınık iletişim kanallarını ortadan kaldırmak amacıyla geliştirilmiştir:

- **SaaS & Çok Kiracılı (Multi-Tenant) Mimari:** Sisteme kayıt olan her şirkete (tenant) özel izole çalışma alanı ve dinamik URL (slug) yapısı (örn: `/ana-firma/dashboard/...`).
- **Güvenli Yönlendirme ve Kimlik Doğrulama:** Next.js Edge Middleware ile sayfa render edilmeden önce JWT token doğrulaması yapılır, kullanıcı otomatik olarak kendi şirket alanına (slug) yönlendirilir.
- **Abonelik ve Plan Yönetimi (FREE/PRO):** Şirketlere özel plan kapasiteleri ve premium özellik kısıtlamaları (Örn: Çöp kutusundan geri yükleme gibi modüllerin PRO plana özel olması).
- **Net Rol & Yetki İzolasyonu:** SuperAdmin, Admin, PM, Analyst ve Developer panelleri ile hem arayüz hem de API seviyesinde tam yetki ayrımı.
- **Performans & Analitik Raporlama:** Analist rolü sayesinde personel performansının ölçümü ve PDF tabanlı rapor çıktılarının alınabilmesi.
- **Kayıpsız Veri Mimarisi (Soft Delete & Trash):** Silinen kullanıcı, proje ve görevlerin `deletedAt` bayrağı ile arşivlenmesi ve PRO planda tek tıkla geri döndürülebilmesi.

---

## ✨ Kapsamlı Modüller ve Özellikler

### 🔐 1. Güvenlik ve Kimlik Doğrulama (Edge Middleware)
- **Güvenli Çerez (Cookie) Yönetimi:** JWT token'ları XSS (Cross-Site Scripting) ve CSRF saldırılarına karşı `HttpOnly` ve `SameSite=Lax` güvenlik politikalarıyla çerezlerde şifrelenmiş olarak saklanır.
- **Edge Seviyesinde Yetki Kontrolü:** `jose` kütüphanesi kullanılarak, Middleware üzerinden gelen her istekte kullanıcının JWT payload'u çözümlenir. İzinsiz rollerin (örn: Developer'ın PM sayfasına girmesi) erişimi sunucuya bile ulaşmadan engellenir.
- **Dinamik Tenant Yönlendirmesi (Routing):** Kullanıcı `/dashboard` dizinine girmeye çalıştığında, sistem token içindeki `slug` bilgisini okur ve kullanıcıyı otomatik olarak kendi şirketinin URL yapısına (`/[slug]/dashboard/`) yönlendirir.
- **İzole SuperAdmin Doğrulaması:** Sistem yöneticisi (SuperAdmin), standart kullanıcılardan tamamen bağımsız bir token (`superadmin_token`) ve yönlendirme akışıyla korunur.

### 👑 2. SuperAdmin Yönetim Paneli
- **SaaS Merkez Kontrolü:** Sisteme kayıtlı tüm şirketlerin (tenant) merkezi olarak izlenmesi ve yönetimi.
- **Tenant Durum & Plan Yönetimi:** Şirketleri "Aktif/Pasif" duruma getirme, yeni şirket ekleme ve şirket abonelik planlarını (FREE / PRO vb.) güncelleme yetkisi.
- **Dinamik Slug Ataması:** Her şirket için URL'de kullanılacak eşsiz `slug` yapısının oluşturulması.

### 🛡️ 3. Şirket Admin Paneli
- **Abonelik & Limit Takibi:** Şirketin bulunduğu plana (FREE/PRO) göre kullanıcı ekleme sınırlarının takibi ve plan yükseltme arayüzü.
- **Kullanıcı Onay/Ret İşlemleri:** Şirket çalışma alanına (slug) başvuran kayıtları listeleme, onaylama ve reddetme.
- **Dinamik Kullanıcı Detay Modalı:** Personellerin (PM, Developer vb.) detaylı istatistiklerini (projeler, yetenek rozetleri) inceleme yeteneği.

### 📊 4. Analist (Analyst) Paneli & PDF Raporlama
- **Sistem Performans İzleme:** Çalışanların ve projelerin süreç hızı ile iş tamamlama metriklerinin anlık analizi.
- **Rol Bazlı Performans Ölçümü:** PM ve Geliştiricilerin iş yükü, çözüm hızı ve tamamlama oranlarının analizi.
- **PDF Export:** Tek tıkla seçilen personelin (PM veya Developer) performans raporunu PDF olarak indirebilme özelliği.

### 📁 5. Proje Yöneticisi (PM) Paneli
- **Proje Oluşturma & Planlama:** Başlangıç/bitiş tarihleri, açıklamalar ve proje kapsamı belirleme.
- **Görev (Task) Yönetimi:** Görev oluşturma, öncelik atama (`LOW`, `MEDIUM`, `HIGH`) ve durum yönetimi (`TODO`, `IN_PROGRESS`, `DONE`).
- **Yetenek Odaklı Atama:** Projedeki görevlere geliştiricileri uzmanlık alanlarına (`skills`) göre filtreleyerek atama.

### 💻 6. Geliştirici (Developer) Paneli
- **Kişiselleştirilmiş Görev Paneli:** Yalnızca üzerine atanan aktif ve tamamlanan görevleri listeleme.
- **Durum Güncelleme & Yorumlaşma:** Görev durumlarını gerçek zamanlı değiştirme, dosya, ekran görüntüsü veya tasarım ekleme ve yorumlaşma.
- **Yetenek Ekleme & Silme:** Seviyesine göre(`DÜŞÜK`,`ORTA`,`YÜKSEK`) yetenek ekleme ve silme özelliği.


### 🗑️ 7. Çöp Kutusu (Trash Bin)
- Silinen kullanıcılar, projeler ve görevler için ayrı bir çöp kutusu sekmesi.
- **Kalıcı Silme & Yumuşak Silme:** Hard Delete işlemleri ve PRO planlı şirketlere özel "Sisteme Eksiksiz Geri Yükleme" (Soft Delete) özelliği.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router)** | Server & Client Components, modern ve hızlı yönlendirmeler |
| **Güvenlik & Middleware**| **Next.js Middleware & jose**| Edge seviyesinde JWT doğrulaması, `HttpOnly` & `SameSite=Lax` |
| **Dil** | **TypeScript** | Uçtan uca tip güvenliği ve derleme denetimi |
| **Stil & UI** | **Tailwind CSS & Lucide Icons** | Tam responsive, modern arayüz tasarımı ve grafikler |
| **Raporlama & Dışa Aktarma**| **PDF Generation (Client/Server)**| Analist paneli için dinamik PDF oluşturma araçları |
| **Veritabanı & ORM** | **Neon (Serverless Postgres) + Prisma ORM** | Serverless mimariye uygun, hızlı ve multi-tenant veritabanı yönetimi |
| **E-Posta Servisi** | **Nodemailer / Resend** | SMTP entegrasyonlu dinamik e-posta şablonları |
| **Dağıtım (Hosting)** | **Vercel** | Otomatik CI/CD entegrasyonu ve Edge desteği |

---

## 📂 Mimari ve Dizin Yapısı

Multi-tenant (çok kullanıcılı) mimari sayesinde sistem, en dışta genel işlemleri, iç `[slug]` yapısında ise şirketlere özel izole çalışma alanlarını barındırır.

```bash
proje-dagitim-appcd/
├── app/
│   ├── [slug]/                  # Multi-Tenant İzolasyon Katmanı (Şirkete özel çalışma alanı)
│   │   └── dashboard/
│   │       ├── admin/           # Şirket admin paneli, kullanıcı onay/limit yönetimi
│   │       ├── analyst/         # Performans analizi ve PDF rapor oluşturma
│   │       ├── developer/       # Geliştirici görev takip modülü
│   │       └── pm/              # Proje ve görev yöneticisi modülü
│   ├── api/                     # Backend API Endpoint'leri
│   │   ├── admin/               
│   │   ├── analyst/             
│   │   ├── auth/                
│   │   ├── developer/           
│   │   ├── projects/            
│   │   ├── public/              
│   │   ├── superadmin/          
│   │   ├── tasks/               
│   │   ├── tenant/              
│   │   ├── trash/               
│   │   ├── upload/              
│   │   └── users/               
│   ├── auth/                    # Merkezi Yetkilendirme Sayfaları
│   │   ├── login/               
│   │   ├── register/            
│   │   └── set-password/        
│   ├── superadmin/              # Sistem Yöneticisi Alanı
│   │   ├── dashboard/           # Şirketlerin (Tenant) yönetildiği kontrol paneli
│   │   └── login/               
│   ├── globals.css              
│   ├── layout.tsx               
│   └── page.tsx                 
├── components/                  # Modallar, Grafikler (InteractiveBarChart vb.), Navbar, Formlar
├── context/                     # Global State Yönetimi (LanguageContext, ThemeContext)
├── lib/                         # Yardımcı Servisler
│   ├── auth.ts                  # JWT ve rol/tenant kontrol fonksiyonları
│   ├── dictionaries.ts          # Dil çeviri dosyaları yönetimi
│   ├── email.ts                 # Otomatik bildirim maili gönderim servisi
│   ├── prisma.ts                # Prisma Client bağlantı havuzu
│   └── rateLimit.ts             # API hız sınırlandırma (Rate Limiting)
├── prisma/                      # Veritabanı Modelleme
│   ├── dev.db                   # Geliştirme ortamı veritabanı
│   ├── schema.prisma            # Veri modelleri (Tenant, User, Project, Task vb.)
│   └── seed.ts                  # Başlangıç verileri (SuperAdmin vb.) oluşturucu
├── public/                      # Favicon, Logolar ve statik dosyalar
├── types/                       # TypeScript global tip tanımlamaları
└── middleware.ts                # Yönlendirme ve yetki kontrol ara katmanı (Güvenlik)