-- Platform Integrations table
-- Stores API credentials for third-party delivery platforms
-- (Trendyol Go, Getir, Migros Yemek, Yemek Sepeti)

CREATE TABLE "platform_integrations" (
    "id"              TEXT NOT NULL,
    "restaurant_id"   TEXT NOT NULL,
    "platform"        TEXT NOT NULL,
    "seller_id"       TEXT,
    "store_name"      TEXT,
    "store_link"      TEXT,
    "api_key"         TEXT,
    "api_secret"      TEXT,
    "token"           TEXT,
    "is_active"       BOOLEAN NOT NULL DEFAULT true,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_integrations_pkey" PRIMARY KEY ("id")
);

-- Each restaurant can have at most one integration per platform
CREATE UNIQUE INDEX "platform_integrations_restaurant_platform_key"
    ON "platform_integrations"("restaurant_id", "platform");

-- Foreign key to restaurants
ALTER TABLE "platform_integrations"
    ADD CONSTRAINT "platform_integrations_restaurant_id_fkey"
    FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
