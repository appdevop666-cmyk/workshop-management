import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  role: null, // 'mechanic', 'verifikator', 'qc'
  loading: true, // Ubah ke true agar tidak langsung redirect saat refresh
  error: null,

  login: async (email, password, force = false) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, current_session_token')
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
      
      if (!force && profileData?.current_session_token) {
        set({ loading: false });
        return { requireForce: true, user: authData.user, role };
      }

      const sessionToken = crypto.randomUUID();
      localStorage.setItem('ws_session_token', sessionToken);
      
      await supabase
        .from('profiles')
        .update({ current_session_token: sessionToken })
        .eq('id', authData.user.id);
      
      set({ user: authData.user, role, loading: false });
      return { user: authData.user, role };
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    const state = set; // Not accessible here directly, wait, we can just use the store state later, or we can assume supabase logout is enough
    localStorage.removeItem('ws_session_token');
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },

  checkSession: () => {
    set({ loading: true });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let { data: profileData } = await supabase
          .from('profiles')
          .select('role, current_session_token')
          .eq('id', session.user.id)
          .single();

        if (!profileData) {
          const assignedRole = session.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic';
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: session.user.id, full_name: session.user.email, role: assignedRole }])
            .select('role, current_session_token')
            .single();
          profileData = newProfile;
        }

        const localToken = localStorage.getItem('ws_session_token');
        if (profileData?.current_session_token && localToken !== profileData.current_session_token) {
          // Token mismatch, someone else logged in
          await supabase.auth.signOut();
          localStorage.removeItem('ws_session_token');
          set({ user: null, role: null, loading: false });
          return;
        }
          
        set({ 
          user: session.user, 
          role: profileData?.role || (session.user.email === 'manager@gmail.com' ? 'verifikator' : 'mechanic'),
          loading: false 
        });
      } else {
        set({ user: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }
}));
