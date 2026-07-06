import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useRealtimeNotifications() {
  const { user, role } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // We only subscribe to the tickets table
    const channel = supabase
      .channel('tickets-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          
          const { eventType, new: newTicket, old: oldTicket } = payload;

          // Admin / Verifikator Notifications
          if (role === 'verifikator') {
            // New ticket inserted
            if (eventType === 'INSERT') {
              toast.success(`Tiket baru masuk: ${newTicket.license_plate}`, {
                duration: 5000,
                icon: '🔔'
              });
            }
          }

          // Mechanic Notifications
          if (role === 'mechanic') {
            // Ticket updated
            if (eventType === 'UPDATE') {
              // Ensure this mechanic owns the ticket
              if (newTicket.mechanic_id === user.id) {
                // If status changed to priced (approved by admin)
                if (oldTicket.status !== 'priced' && newTicket.status === 'priced') {
                  toast.success(`Harga disetujui untuk ${newTicket.license_plate}. Silakan mulai dikerjakan!`, {
                    duration: 6000,
                    icon: '✅'
                  });
                }
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const newProfile = payload.new;
          if (newProfile.current_session_token) {
            const localToken = localStorage.getItem('ws_session_token');
            if (localToken !== newProfile.current_session_token) {
              // Token mismatch! Someone logged in elsewhere.
              toast.error('Akun Anda telah login di perangkat lain. Anda akan dikeluarkan.', {
                duration: 5000,
                icon: '⚠️'
              });
              
              // Force logout after 2 seconds
              setTimeout(() => {
                useAuthStore.getState().logout();
              }, 2000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);
}
