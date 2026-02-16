-- Seed Data SQL Script for Supabase
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Create Restaurant
INSERT INTO restaurants (id, name, slug, phone, address, is_active, subscription_plan, created_at, updated_at)
VALUES (
  'rest-001',
  'Köfteci Ramiz',
  'kofteci-ramiz',
  '+90 555 123 4567',
  'Kadıköy, İstanbul',
  true,
  'pro',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- 2. Create Admin User (password: 12345)
INSERT INTO users (id, restaurant_id, email, password_hash, role, full_name, is_active, created_at)
VALUES (
  'admin-user-001',
  'rest-001',
  'admin@kofteci.com',
  '$2b$10$KixgGNhF6mKdmP1rV8J3IeX7RJQoVL6hQhYq6Q6VZ6VZKj7MYVwde', -- password: 12345
  'admin',
  'Admin Kullanıcı',
  true,
  CURRENT_TIMESTAMP
);

-- 3. Create Categories
INSERT INTO categories (id, restaurant_id, name, icon, sort_order, created_at) VALUES
  ('cat-001', 'rest-001', 'İçecekler', '☕', 1, CURRENT_TIMESTAMP),
  ('cat-002', 'rest-001', 'Kahvaltı', '🍳', 2, CURRENT_TIMESTAMP),
  ('cat-003', 'rest-001', 'Ana Yemek', '🍽️', 3, CURRENT_TIMESTAMP);

-- 4. Create Products
INSERT INTO products (id, restaurant_id, category_id, name, description, price, is_available, created_at, updated_at) VALUES
  -- İçecekler
  ('prod-001', 'rest-001', 'cat-001', 'Türk Kahvesi', 'Geleneksel Türk kahvesi', 45.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prod-002', 'rest-001', 'cat-001', 'Çay', 'Demli çay', 15.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prod-003', 'rest-001', 'cat-001', 'Ayran', 'Ev yapımı ayran', 20.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Kahvaltı
  ('prod-004', 'rest-001', 'cat-002', 'Serpme Kahvaltı', '2 kişilik serpme kahvaltı', 350.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prod-005', 'rest-001', 'cat-002', 'Menemen', 'Domates, biber, yumurta', 85.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Ana Yemek
  ('prod-006', 'rest-001', 'cat-003', 'İnegöl Köfte', 'Porsiyon köfte, pilav, salata', 180.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prod-007', 'rest-001', 'cat-003', 'Adana Kebap', 'Acılı kebap, pilav, salata', 220.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prod-008', 'rest-001', 'cat-003', 'Tavuk Şiş', 'Marineli tavuk, pilav, salata', 170.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Create Tables
INSERT INTO tables (id, restaurant_id, table_number, is_active, created_at) VALUES
  ('table-001', 'rest-001', 1, true, CURRENT_TIMESTAMP),
  ('table-002', 'rest-001', 2, true, CURRENT_TIMESTAMP),
  ('table-003', 'rest-001', 3, true, CURRENT_TIMESTAMP),
  ('table-004', 'rest-001', 4, true, CURRENT_TIMESTAMP),
  ('table-005', 'rest-001', 5, true, CURRENT_TIMESTAMP);

-- Verify data
SELECT 'Restaurants' as table_name, COUNT(*) as count FROM restaurants
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Tables', COUNT(*) FROM tables;
