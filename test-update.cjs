const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lgaecppfdcrlcfugtqiq.supabase.co',
  'sb_publishable_L-ce1QYTZRoMocmCF7EfUA_ZM7xUm7V'
);

async function testUpdate() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mekanik@gmail.com',
    password: 'password123'
  });
  
  if (authError) {
    console.error('Login error', authError);
    return;
  }
  
  // Find a priced ticket
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('status', 'priced');
    
  if (tickets && tickets.length > 0) {
    console.log('Found ticket to update:', tickets[0].id);
    const { data, error } = await supabase
      .from('tickets')
      .update({ status: 'in_progress' })
      .eq('id', tickets[0].id)
      .select();
      
    console.log('Update result:', { data, error });
  } else {
    console.log('No priced tickets found for test.');
  }
}

testUpdate();
