-- CRM fields for restaurants table
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "contract_months" INTEGER DEFAULT 0;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "contract_start_date" DATE;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "contract_status" TEXT DEFAULT 'lead';
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "contact_person" TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "monthly_fee" DECIMAL(10,2) DEFAULT 0;

-- Update existing restaurants with sample CRM data
UPDATE "restaurants" SET 
    contract_months = 12,
    contract_start_date = '2025-06-01',
    contract_status = 'active',
    contact_person = 'Ahmet Yılmaz',
    contact_phone = '0532 111 2233',
    monthly_fee = 499.00,
    notes = 'İlk anlaşmalı restoran, premium plan'
WHERE id = 'rest-001';

UPDATE "restaurants" SET 
    contract_months = 6,
    contract_start_date = '2025-11-01',
    contract_status = 'active',
    contact_person = 'Mehmet Kaya',
    contact_phone = '0533 444 5566',
    monthly_fee = 299.00,
    notes = 'Yeni katılan cafe, standart plan'
WHERE id = 'rest-002';
