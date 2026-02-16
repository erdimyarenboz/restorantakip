# Backend Kurulum ve Çalıştırma

## 1. Dependencies Yükle

```bash
cd backend
npm install
```

## 2. PostgreSQL Database Oluştur

### Option A: Local PostgreSQL
```bash
# PostgreSQL yükle (Mac)
brew install postgresql@15
brew services start postgresql@15

# Database oluştur
createdb siparis_db
```

### Option B: Railway.app (Önerilen)
1. https://railway.app'e git
2. "New Project" → "Provision PostgreSQL"
3. Connection URL'yi kopyala
4. `.env` dosyasına yapıştır

## 3. Environment Variables

`.env` dosyasını düzenle:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/siparis_db
```

## 4. Prisma Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 5. Seed Data (Opsiyonel)

Test için örnek restoran ve ürünler ekle:
```bash
npm run seed
```

## 6. Server'ı Başlat

```bash
npm run dev
```

Server `http://localhost:3001` adresinde çalışacak.

## 7. Test

```bash
curl http://localhost:3001/health
```

Yanıt: `{"status":"ok","timestamp":"..."}`

---

# Frontend Kurulum

## 1. Environment Variables

Ana dizinde `.env.local` dosyası oluştur:
```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=ws://localhost:3001
```

## 2. Axios Yükle

```bash
npm install axios
```

## 3. Frontend'i Başlat

```bash
npm run dev
```

---

# Sonraki Adımlar

Backend API hazır! Şimdi:
1. ✅ Backend dependencies yükle
2. ✅ PostgreSQL setup
3. ✅ Prisma migrate
4. ⏳ Frontend Context'leri API'ye bağla
5. ⏳ Test et
