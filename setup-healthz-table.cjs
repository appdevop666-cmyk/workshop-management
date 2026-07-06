const { Client } = require('pg');

const client = new Client({
  // Menggunakan connection string yang sudah ada di query-db.cjs Anda
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  
  console.log('Creating healthz table...');
  
  await client.query(`
    -- 1. Buat tabel
    CREATE TABLE IF NOT EXISTS healthz (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      pinged_at timestamptz DEFAULT now()
    );

    -- 2. Aktifkan RLS
    ALTER TABLE healthz ENABLE ROW LEVEL SECURITY;

    -- 3. Hapus policy lama (jika script ini dijalankan ulang)
    DROP POLICY IF EXISTS "Allow anonymous inserts on healthz" ON healthz;
    
    -- 4. Buat policy yang mengizinkan anon (public) untuk melakukan INSERT
    CREATE POLICY "Allow anonymous inserts on healthz" ON healthz 
      FOR INSERT TO anon 
      WITH CHECK (true);
  `);
  
  console.log('✅ Table "healthz" berhasil dibuat dan disiapkan untuk auto-insert.');
  
  await client.end();
}

run().catch(console.error);
