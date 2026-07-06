const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // We add 'in_progress' and 'completed' to the enum
    await client.query(`
      ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'in_progress';
      ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'completed';
    `);
    console.log("Enum updated successfully.");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
