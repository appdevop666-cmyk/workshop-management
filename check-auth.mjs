import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lgaecppfdcrlcfugtqiq.supabase.co',
  'sb_publishable_L-ce1QYTZRoMocmCF7EfUA_ZM7xUm7V'
);

async function check() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'manager@gmail.com',
    password: 'password123'
  });
  if (authError) {
    console.error('Login failed', authError.message);
    return;
  }
  
  const { data: tickets } = await supabase.from('tickets').select('*');
  console.log('Tickets:', tickets);
  
  if (tickets && tickets.length > 0) {
    const { data: items, error } = await supabase
      .from('ticket_items')
      .select('id, price, quantity, sparepart_id, spareparts(name)')
      .eq('ticket_id', tickets[0].id);
      
    console.log('Items for first ticket:', items);
    if (error) console.error('Items error:', error);
  }
}

check();
