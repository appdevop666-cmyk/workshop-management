const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // drop all policies on tickets
    await client.query(`
      DROP POLICY IF EXISTS "Enable all access for authenticated users on tickets" ON tickets;
      DROP POLICY IF EXISTS "Tickets are viewable by everyone" ON tickets;
      DROP POLICY IF EXISTS "Tickets can be created by authenticated users" ON tickets;
      DROP POLICY IF EXISTS "Tickets can be updated by their mechanics" ON tickets;
      
      -- create a fresh, truly unrestricted policy for authenticated users
      CREATE POLICY "Enable all for tickets" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
    `);
    console.log("Policies reset successfully.");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
