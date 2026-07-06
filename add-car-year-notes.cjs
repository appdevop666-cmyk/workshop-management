const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS car_year VARCHAR(4);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
    console.log("car_year and notes columns added successfully.");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
