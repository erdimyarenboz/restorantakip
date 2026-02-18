-- Add contact_email column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS contact_email TEXT;
