import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const getAssignedRole = (email) =>
  email === 'manager@gmail.com' ? 'verifikator' : 'mechanic';

const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, current_session_token')
    .eq('id', userId)
    .maybeSingle();
  return { profileData: data, profileError: error };
};

const createProfile = async (userId, email) => {
  const role = getAssignedRole(email);
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{ id: userId, full_name: email, role }])
    .select('role, current_session_token')
    .single();
  return { profileData: data, profileError: error };
};

const setSessionToken = async (userId) => {
  const token = crypto.randomUUID();
  localStorage.setItem('ws_session_token', token);
  await supabase
    .from('profiles')
    .update({ current_session_token: token })
    .eq('id', userId);
  return token;
};

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,
  error: null,

  login: async (email, password, force = false) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!authData.session) throw new Error('Sesi tidak valid. Pastikan email sudah dikonfirmasi.');

      // Sinkronisasi sesi agar kueri DB memakai JWT yang benar
      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      let { profileData } = await fetchProfile(authData.user.id);

      if (!profileData) {
        const result = await createProfile(authData.user.id, authData.user.email);
        profileData = result.profileData;
      }

      const role = profileData?.role || getAssignedRole(authData.user.email);
      const localToken = localStorage.getItem('ws_session_token');

      // Cek apakah ada sesi aktif di perangkat LAIN
      // (ada token di DB, tapi bukan milik browser ini)
      if (!force && profileData?.current_session_token && localToken !== profileData.current_session_token) {
        set({ loading: false });
        return { requireForce: true, user: authData.user, role };
      }

      // Buat token sesi baru untuk browser ini
      await setSessionToken(authData.user.id);

      set({ user: authData.user, role, loading: false });
      return { user: authData.user, role };
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    // Ambil sesi saat ini untuk mendapatkan user ID
    const { data: { session } } = await supabase.auth.getSession();
    
    // Hapus token dari DB agar akun bisa login bebas di perangkat lain
    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ current_session_token: null })
        .eq('id', session.user.id);
    }

    localStorage.removeItem('ws_session_token');
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },

  checkSession: () => {
    set({ loading: true });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        set({ user: null, role: null, loading: false });
        return;
      }

      if (session?.user) {
        const { profileData } = await fetchProfile(session.user.id);

        if (!profileData) {
          // Profil belum ada, buat baru
          const { profileData: newProfile } = await createProfile(session.user.id, session.user.email);
          await setSessionToken(session.user.id);
          set({
            user: session.user,
            role: newProfile?.role || getAssignedRole(session.user.email),
            loading: false,
          });
          return;
        }

        const localToken = localStorage.getItem('ws_session_token');

        // Jika DB tidak punya token → ini sesi aktif, pasangkan token baru
        if (!profileData.current_session_token) {
          await setSessionToken(session.user.id);
          set({
            user: session.user,
            role: profileData.role || getAssignedRole(session.user.email),
            loading: false,
          });
          return;
        }

        // Token ada tapi tidak cocok → ada yang login di tempat lain
        if (localToken !== profileData.current_session_token) {
          localStorage.removeItem('ws_session_token');
          await supabase.auth.signOut();
          set({ user: null, role: null, loading: false });
          return;
        }

        // Token cocok → sesi valid
        set({
          user: session.user,
          role: profileData.role || getAssignedRole(session.user.email),
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }
}));
