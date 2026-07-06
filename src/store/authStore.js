import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  role: null, // 'mechanic', 'verifikator', 'qc'
  loading: true, // Ubah ke true agar tidak langsung redirect saat refresh
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        console.warn('Profile not found, creating default profile...');
        const assignedRole = authData.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic';
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: authData.user.id, full_name: authData.user.email, role: assignedRole }])
          .select('role')
          .single();
        
        if (!insertError && newProfile) {
          profileData = newProfile;
        }
      }

      const role = profileData?.role || (authData.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic');
      
      set({ user: authData.user, role, loading: false });
      return { user: authData.user, role };
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },

  checkSession: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      let { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profileData) {
        const assignedRole = session.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic';
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ id: session.user.id, full_name: session.user.email, role: assignedRole }])
          .select('role')
          .single();
        profileData = newProfile;
      }
        
      set({ 
        user: session.user, 
        role: profileData?.role || (session.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic'),
        loading: false 
      });
    } else {
      set({ user: null, role: null, loading: false });
    }
  }
}));
