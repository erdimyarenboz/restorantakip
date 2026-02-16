# 🛒 Sipariş Sistemi - MVP Demo

Tamamen lokal çalışan, responsive bir sipariş yönetim sistemi. Dış API, database veya harici servis kullanılmadan, localStorage tabanlı veri yönetimi ile çalışır.

## ✨ Özellikler

### 📦 Ürün Yönetimi
- 18 örnek ürün (4 kategori)
- Kategori bazlı filtreleme
- Ürün arama
- Responsive grid görünüm (mobil: 2 kolon, desktop: 4 kolon)

### 🛒 Sepet Yönetimi
- Ürün ekleme/çıkarma
- Miktar güncelleme
- Ara toplam, kargo (49₺), toplam hesaplama
- Minimum sipariş tutarı kontrolü (200₺)
- localStorage ile kalıcı veri

### 💳 Sipariş Oluşturma (Checkout)
- Teslimat bilgileri formu
- Form validasyonu:
  - Ad Soyad: min 3 karakter
  - Telefon: 10-11 hane
  - Adres: min 10 karakter
- Benzersiz sipariş ID oluşturma (ORD-2026-XXXX)
- Sipariş özeti görüntüleme

### 📋 Sipariş Geçmişi
- Tüm siparişleri listeleme
- Detaylı sipariş görünümü
- Durum takibi (Yeni, Hazırlanıyor, Teslim edildi, İptal)
- localStorage ile kalıcı veri

### ⚙️ Admin Paneli
- Sipariş istatistikleri (toplam, bugün, ciro)
- Sipariş durumu güncelleme
- Durum bazlı filtreleme
- **Not:** Demo amaçlı, authentication yok

### 🎨 UI/UX Özellikleri
- Mobile-first responsive design
- Modern, temiz tasarım (Inter font)
- Micro-animations ve hover effects
- Bottom navigation (mobil)
- Empty state gösterimleri
- Türkçe dil desteği
- ₺ TL para birimi formatı

## 🚀 Kurulum ve Çalıştırma

```bash
# Projeyi klonlayın veya indirin
cd siparis-sistemi

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:5174](http://localhost:5174) adresini açın.

## 🏗️ Teknoloji Stack

- **Framework:** Vite + React 18
- **Dil:** TypeScript (strict mode)
- **Routing:** React Router v6
- **State Management:** React Context API + useReducer
- **Styling:** CSS Modules
- **Storage:** localStorage
- **Para Formatı:** Intl.NumberFormat (tr-TR)

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   ├── OrderCard.tsx
│   └── EmptyState.tsx
├── pages/               # Sayfa bileşenleri
│   ├── ProductsPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   └── AdminPage.tsx
├── store/               # State yönetimi
│   ├── CartContext.tsx
│   └── OrdersContext.tsx
├── data/                # Statik veri
│   └── products.ts
├── types/               # TypeScript tipleri
│   └── index.ts
├── utils/               # Yardımcı fonksiyonlar
│   ├── format.ts
│   └── storage.ts
├── styles/              # CSS Modules
│   └── *.module.css
├── App.tsx              # Ana uygulama
└── main.tsx             # Entry point
```

## 🧪 Manual Test Checklist

### ✅ Ürün Browsing
- [ ] Ana sayfada ürünler yükleniyor
- [ ] Kategori filtresi çalışıyor
- [ ] Arama fonksiyonu çalışıyor
- [ ] "Sepete Ekle" butonu çalışıyor
- [ ] Grid layout responsive (mobil/desktop)

### ✅ Sepet İşlemleri
- [ ] Ürün sepete ekleniyor
- [ ] Miktar artırma/azaltma çalışıyor
- [ ] Ürün silme çalışıyor
- [ ] Ara toplam doğru hesaplanıyor
- [ ] Kargo ücreti ekleniyor (49₺)
- [ ] Sepet badge güncelleniyor

### ✅ Minimum Sipariş Kontrolü
- [ ] 200₺ altında "Sipariş Ver" butonu pasif
- [ ] Uyarı mesajı gösteriliyor
- [ ] 200₺ üzerinde buton aktif

### ✅ Checkout (Sipariş Oluşturma)
- [ ] Form validasyonu çalışıyor
- [ ] Eksik bilgi uyarıları gösteriliyor
- [ ] Sipariş başarıyla oluşturuluyor
- [ ] Sipariş detay sayfasına yönlendiriliyor
- [ ] Sepet temizleniyor

### ✅ Sipariş Geçmişi
- [ ] Siparişler listeleniyor
- [ ] Sipariş detayı görüntüleniyor
- [ ] Müşteri bilgileri doğru
- [ ] Ürünler ve tutarlar doğru
- [ ] Durum badge'i doğru renkte

### ✅ Admin Paneli
- [ ] İstatistikler doğru hesaplanıyor
- [ ] Siparişler listeleniyor
- [ ] Durum filtresi çalışıyor
- [ ] Durum güncelleme çalışıyor
- [ ] Değişiklik kaydediliyor

### ✅ Kalıcılık (localStorage)
- [ ] Sepet sayfa yenilemede korunuyor
- [ ] Siparişler sayfa yenilemede korunuyor
- [ ] Durum değişiklikleri korunuyor

### ✅ Responsive Design
- [ ] Mobil (375px) düzgün görünüyor
- [ ] Tablet (768px) düzgün görünüyor
- [ ] Desktop (1440px) düzgün görünüyor
- [ ] Bottom nav mobilde görünür
- [ ] Bottom nav desktop'ta gizli

## 🔧 Build Komutu

```bash
npm run build
```

Production build oluşturur. Çıktı `dist/` klasöründe.

## ⚠️ Önemli Notlar

### Demo/Test Amaçlı
Bu proje **sadece demo ve test amaçlıdır**. Production kullanımı için:

- ✋ Backend API entegrasyonu gerekir
- ✋ Gerçek veritabanı kullanılmalıdır
- ✋ Ödeme sistemi entegre edilmelidir
- ✋ Authentication/Authorization eklenmeli
- ✋ Admin paneline güvenlik katmanı gereklidir

### Kısıtlamalar
- ❌ Dış API çağrısı yok
- ❌ Database bağlantısı yok
- ❌ Ödeme entegrasyonu yok
- ❌ SMS/Email bildirimi yok
- ❌ Harita/Konum servisi yok
- ❌ Authentication yok

### Veri Kaynakları
- **Ürünler:** `src/data/products.ts` (statik JSON)
- **Sepet:** `localStorage.cart_v1`
- **Siparişler:** `localStorage.orders_v1`
- **Görseller:** SVG placeholders (data URI)

## 📝 Lisans

Bu proje MIT lisansı altındadır. Eğitim ve demo amaçlı kullanım için serbesttir.

## 🙋 Destek

Sorularınız için issue açabilirsiniz.

---

**Geliştirici Notu:** Bu proje, modern web teknolojileri kullanarak basit bir e-ticaret akışını göstermek amacıyla oluşturulmuştur. Gerçek production uygulamalarında ek güvenlik, performans ve ölçeklenebilirlik önlemleri alınmalıdır.
