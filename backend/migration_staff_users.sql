-- =================== STAFF USERS TABLE ===================
-- Stores login credentials for restaurant staff (admin/waiter/kitchen)

CREATE TABLE IF NOT EXISTS staff_users (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'waiter', 'kitchen')),
    display_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Each username must be globally unique (across all restaurants)
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_users_username ON staff_users(username);

-- Index for quick lookups by restaurant
CREATE INDEX IF NOT EXISTS idx_staff_users_restaurant ON staff_users(restaurant_id);
