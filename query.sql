-- Active: 1769941984948@@127.0.0.1@5432@phone_bot

CREATE TABLE "Clients" (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,            
    name VARCHAR(255),
    tg_username VARCHAR(255),
    phone VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    advertisement_limit INTEGER DEFAULT 5,
    platform_language VARCHAR(2) CHECK (platform_language IN ('uz', 'ru')),
    client_address VARCHAR(255),
    registered_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    step VARCHAR(255) NOT NULL DEFAULT 'authentication',
    subscribed BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO "Admins" (
  tg_id,
  name,
  tg_username,
  phone,
  is_admin,
  registered_time,
  last_seen_time,
  platform_language,
  step,
  "createdAt",
  "updatedAt"
)
VALUES (
  6371895530,
  'Ogabek Norqulov',
  'n_ogabek_s',
  '+998901234567',
  true,
  NOW(),
  NOW(),
  'uz',
  'authentication',
  NOW(),
  NOW()
);