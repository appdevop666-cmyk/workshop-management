const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // Buat fungsi RPC untuk mengecek sesi aktif berdasarkan email
    // Security definer agar bisa dipanggil tanpa autentikasi (anon key)
    await client.query(`
      CREATE OR REPLACE FUNCTION public.check_active_session(user_email TEXT)
      RETURNS BOOLEAN AS $$
      DECLARE
        token TEXT;
      BEGIN
        SELECT p.current_session_token INTO token
        FROM profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE u.email = user_email;
        
        RETURN token IS NOT NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log("RPC function 'check_active_session' created successfully.");

    // Grant execute permission ke anon dan authenticated role
    await client.query(`
      GRANT EXECUTE ON FUNCTION public.check_active_session(TEXT) TO anon, authenticated;
    `);
    console.log("Granted execute permissions.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
run();
