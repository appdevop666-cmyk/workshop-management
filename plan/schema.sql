-- Skema Database untuk BengkelSync (PostgreSQL / Supabase)

-- 1. Tabel Profil Pengguna (Ekstensi dari Supabase Auth)
CREATE TYPE user_role AS ENUM ('mechanic', 'verifikator', 'qc');

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'mechanic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Tabel Master Data Kategori (Exterior, Interior, dll)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Tabel Master Data Sparepart / Part Modifikasi
CREATE TABLE spareparts (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Tabel Tiket (Data mobil klien yang masuk)
CREATE TYPE ticket_status AS ENUM ('pending', 'priced', 'qc_passed', 'done');

CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mechanic_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    car_brand VARCHAR(100) NOT NULL,
    mechanic_notes TEXT,
    status ticket_status NOT NULL DEFAULT 'pending',
    total_price DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Tabel Detail Item Tiket (Sparepart yang di-checklist)
CREATE TABLE ticket_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sparepart_id INTEGER REFERENCES spareparts(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    estimated_price DECIMAL(15, 2), -- Harga diinput oleh Verifikator nanti
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Mengaktifkan Row Level Security (RLS) di Supabase (Opsional tapi disarankan)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE spareparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_items ENABLE ROW LEVEL SECURITY;

-- Contoh Insert Master Data Awal (Data Dummy MVP)
INSERT INTO categories (name) VALUES ('Exterior'), ('Interior');

-- Insert Sparepart Exterior (Category ID 1)
INSERT INTO spareparts (category_id, name) VALUES 
(1, 'Cat Body Full'),
(1, 'Custom Bumper Depan'),
(1, 'Custom Bumper Belakang'),
(1, 'Kaca Film'),
(1, 'Lampu LED Projie');

-- Insert Sparepart Interior (Category ID 2)
INSERT INTO spareparts (category_id, name) VALUES 
(2, 'Custom Audio System'),
(2, 'Retrim Jok Kulit'),
(2, 'Karpet Dasar'),
(2, 'Dashboard Panel Carbon');
