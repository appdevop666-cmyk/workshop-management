const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INT PRIMARY KEY DEFAULT 1,
        company_name VARCHAR(255) NOT NULL,
        company_address TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- Ensure only one row exists (id = 1)
      INSERT INTO company_settings (id, company_name, company_address, payment_method)
      VALUES (1, 'BengkelSync', 'Jl. Sudirman No. 123, Jakarta', 'Transfer Bank BCA')
      ON CONFLICT (id) DO NOTHING;

      -- Set up RLS
      ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
      
      -- Allow everyone to read
      DROP POLICY IF EXISTS "Enable read access for all users" ON company_settings;
      CREATE POLICY "Enable read access for all users" ON company_settings FOR SELECT USING (true);
      
      -- Allow authenticated users to update
      DROP POLICY IF EXISTS "Enable update for authenticated users" ON company_settings;
      CREATE POLICY "Enable update for authenticated users" ON company_settings FOR UPDATE USING (auth.role() = 'authenticated');
      
    `);
    console.log("company_settings table created successfully with RLS.");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
