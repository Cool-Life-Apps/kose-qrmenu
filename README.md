# 🍽️ Köse QR Menü Uygulaması

## ✨ Projeye Genel Bakış

Köse QR Menü Uygulaması, modern işletmeler için tasarlanmış, tamamen duyarlı ve kullanıcı dostu bir web uygulamasıdır. Müşterilerinizin QR kodunu tarayarak doğrudan menülerinize ulaşmasını sağlar ve işletmenizin dijital varlığını güçlendirir. Pastane ve Kuaför gibi farklı işletme türleri için özelleştirilebilir menü yönetimi sunar.

## 🚀 Özellikler

*   **Duyarlı Tasarım**: Mobil öncelikli yaklaşımla geliştirilmiş, tüm cihazlarda (telefon, tablet, masaüstü) harika görünen ve çalışan bir arayüz.
*   **QR Kod Entegrasyonu**: Müşteriler, tek bir QR kodu tarayarak doğrudan ana sayfaya yönlendirilir.
*   **İşletme Seçimi**: Ana sayfada "Pastane" ve "Kuaför" seçenekleri bulunur, müşterileri ilgili menüye yönlendirir.
*   **Dinamik Menü Sayfaları**: Her işletme için ayrı, kategori bazlı menü sayfaları. Menü öğeleri (ad, açıklama, fiyat, görsel) kolayca görüntülenebilir.
*   **Ürün Detay Sayfaları**: Her menü öğesi için özel bir detay sayfası, ürün hakkında daha fazla bilgi ve görsel sunar.
*   **Yönetici Paneli**: Güvenli, şifre korumalı bir yönetici arayüzü:
    *   **Güvenli Giriş**: Firebase Authentication ile e-posta/şifre tabanlı giriş.
    *   **Şifre Sıfırlama**: Yönetici şifresini unuttuğunda e-posta ile sıfırlama özelliği.
    *   **Kategori Yönetimi**: Menü kategorilerini (ekleme, silme) kolayca yönetme.
    *   **Ürün Yönetimi**: Menü öğelerini (ekleme, silme, güncelleme) yönetme.
    *   **Görsel Desteği**: Ürünler için harici görsel URL'leri ekleyebilme.
    *   **Fiyat Kontrolü**: Fiyat girişlerinin sadece sayısal olmasını sağlama ve otomatik "TL" ekleme.
*   **Türkçe Arayüz**: Tüm kullanıcı arayüzü metinleri Türkçe olarak sunulur.

## 🛠️ Teknoloji Yığını

*   **Frontend**: [Next.js](https://nextjs.org/) (React tabanlı), [Tailwind CSS](https://tailwindcss.com/) (hızlı ve duyarlı UI geliştirme için)
*   **Backend & Veritabanı**: [Firebase](https://firebase.google.com/) (Firestore NoSQL veritabanı ve Authentication hizmetleri)

## 🚀 Başlarken

Bu projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Önkoşullar

*   [Node.js](https://nodejs.org/en/) (v18.x veya üzeri önerilir)
*   [npm](https://www.npmjs.com/) veya [Yarn](https://yarnpkg.com/)

### Kurulum Adımları

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/your-username/kose-qrmenu-app.git
    cd kose-qrmenu-app
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Firebase Projesi Kurulumu:**
    *   [Firebase Konsolu](https://console.firebase.google.com/) adresine gidin ve yeni bir proje oluşturun.
    *   Projenize bir web uygulaması ekleyin ve yapılandırma bilgilerinizi alın.
    *   **Authentication**: Sol menüden "Authentication" bölümüne gidin, "Sign-in method" sekmesinde "Email/Password" sağlayıcısını etkinleştirin.
    *   **Firestore Database**: Sol menüden "Firestore Database" bölümüne gidin. Veritabanınızı oluşturun ve aşağıdaki güvenlik kurallarını "Kurallar" sekmesine ekleyin:

        ```firestore
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /menus/{business}/categories/{categoryId} {
              allow read: if true;
              allow write: if request.auth != null;
            }
          }
        }
        ```

4.  **Ortam Değişkenlerini Yapılandırın:**
    *   Projenizin kök dizininde (`kose-qrmenu-app/`) `.env.local` adında yeni bir dosya oluşturun.
    *   Firebase yapılandırma bilgilerinizi bu dosyaya aşağıdaki formatta ekleyin (kendi anahtarlarınızla değiştirin):

        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
        ```

5.  **Uygulamayı Çalıştırın:**
    ```bash
    npm run dev
    # veya
    yarn dev
    ```
    Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## 💡 Kullanım

*   **Müşteri Görünümü**: `http://localhost:3000` adresine gidin. İşletme seçimi yapın ve menüleri keşfedin. Ürün detaylarını görmek için bir ürüne tıklayın.
*   **Yönetici Görünümü**: `http://localhost:3000/admin/login` adresine gidin. Firebase'de oluşturduğunuz yönetici kullanıcı bilgileriyle giriş yapın. Kategorileri ve ürünleri ekleyebilir, silebilir ve güncelleyebilirsiniz.

## ☁️ Dağıtım (Dokploy ile)

Bu proje, [Dokploy](https://dokploy.com/) gibi bir platform kullanılarak kolayca dağıtılabilir. Dağıtım için aşağıdaki adımları izleyin:

1.  **Kodunuzu Git Deposuna Yükleyin**: Tüm değişikliklerinizin (özellikle `.env.local` dosyasının `.gitignore` içinde olduğundan emin olun) Git deponuza aktarıldığından emin olun.
2.  **Dokploy'da Yeni Uygulama Oluşturun**: Dokploy panelinizde yeni bir uygulama oluşturun ve Git deponuzu bağlayın.
3.  **Ortam Değişkenlerini Ayarlayın**: `.env.local` dosyanızdaki tüm `NEXT_PUBLIC_` ile başlayan değişkenleri Dokploy uygulamanızın ortam değişkenleri bölümüne ekleyin. Anahtarların ve değerlerin tam olarak eşleştiğinden emin olun.
4.  **Dağıtımı Başlatın**: Dokploy, Next.js projenizi otomatik olarak algılayacak ve `npm run build` ile `npm start` komutlarını kullanarak uygulamayı derleyip dağıtacaktır.
5.  **Özel Alan Adı Yapılandırması (İsteğe Bağlı)**: Uygulamanızı kendi alan adınızda yayınlamak için Dokploy'un alan adı yapılandırma adımlarını izleyin.

## 🤝 Katkıda Bulunma

Katkılarınız her zaman açıktır! Hata raporları, yeni özellik önerileri veya kod katkıları için lütfen bir "issue" açın veya bir "pull request" gönderin.

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.