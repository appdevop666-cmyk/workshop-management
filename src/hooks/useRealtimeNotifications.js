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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);
}
