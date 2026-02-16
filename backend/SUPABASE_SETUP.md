# Supabase Database Setup

## 1. Supabase Connection Bilgilerini Al

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Project seç
3. **Settings** → **Database** → **Connection String**
4. İki farklı URL'yi kopyala:
   - **Connection pooling** (port 6543) → `DATABASE_URL`
   - **Direct connection** (port 5432) → `DIRECT_URL`

## 2. Backend .env Dosyasını Güncelle

`backend/.env` dosyasını aç ve şunları güncelle:

```bash
NODE_ENV=development
PORT=3001

# Supabase Connection Strings
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**ÖNEMLİ:** `[YOUR-PASSWORD]` kısmını Supabase database şifrenizle değiştirin!

## 3. Prisma Client Oluştur

```bash
cd backend
npm run prisma:generate
```

## 4. Database Migration (Tabloları Oluştur)

```bash
npm run prisma:migrate -- --name init
```

Bu komut 7 tabloyu oluşturacak:
- ✅ restaurants
- ✅ users
- ✅ categories
- ✅ products
- ✅ tables
- ✅ orders
- ✅ order_items
- ✅ payments

## 5. Database'i Kontrol Et

### Supabase Dashboard'dan:
1. **Table Editor** → Tabloları göreceksiniz
2. **SQL Editor** → Query çalıştırabilirsiniz

### Test Query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 6. Test Data Ekle (Opsiyonel)

Seed script çalıştır:

```bash
npm run seed
```

Bu komut örnek:
- 1 restoran (Köfteci Ramiz)
- 3 kategori (İçecekler, Kahvaltı, Ana Yemek)
- 10 ürün
- 5 masa
- 1 admin kullanıcı

## 7. Backend Server Başlat

```bash
npm run dev
```

Server http://localhost:3001 adresinde çalışacak.

## 8. Test

```bash
# Health check
curl http://localhost:3001/health

# Response: {"status":"ok","timestamp":"..."}
```

## Supabase Avantajları

✅ **Realtime Subscriptions:** WebSocket otomatik çalışıyor  
✅ **Row Level Security:** Güvenlik kuralları tanımlanabilir  
✅ **Otomatik API:** REST API otomatik oluşuyor  
✅ **Dashboard:** Kullanıcı dostu yönetim paneli  
✅ **Free Tier:** 500MB database, 2GB bandwidth

## Sorun Giderme

### Error: "Database connection failed"
- `.env` dosyasındaki şifreyi kontrol edin
- Supabase project'in aktif olduğundan emin olun

### Error: "Migration failed"
- `DIRECT_URL` doğru mu kontrol edin
- Port 5432 kullanıyor musunuz?

### Tables görünmüyor
- Migration başarılı mı? Log'ları kontrol edin
- Supabase Dashboard → Table Editor'den kontrol edin
