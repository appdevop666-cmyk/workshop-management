import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) fetchMyTickets();
  }, [user]);

  const fetchMyTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('mechanic_id', user.id)
      .order('created_at', { ascending: false });
      
    if (data) setTickets(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pengiriman Saya</h1>
          <Link to="/select-mode" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            &larr; Kembali
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 text-center border-b border-gray-200">
            <p className="text-gray-500 text-sm">Total Checklist Terkirim</p>
            <p className="text-4xl font-bold mt-2 text-black">{tickets.length}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Daftar Tiket Terakhir</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari plat, pelanggan, merek..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
        
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : tickets.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl border border-gray-200 text-gray-500">
            Belum ada checklist yang Anda kirimkan.
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            {tickets.filter(ticket => {
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                (ticket.license_plate && ticket.license_plate.toLowerCase().includes(term)) ||
                (ticket.client_name && ticket.client_name.toLowerCase().includes(term)) ||
                (ticket.car_brand && ticket.car_brand.toLowerCase().includes(term))
              );
            }).map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => navigate(`/mechanic/ticket/${ticket.id}`)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-black transition-colors"
              >
                <div>
                  <p className="font-bold text-lg text-gray-900">{ticket.license_plate}</p>
                  <p className="text-sm text-gray-500">{ticket.client_name} - {ticket.car_brand} {ticket.car_year ? `(${ticket.car_year})` : ''}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'priced' ? 'bg-green-100 text-green-800 border border-green-200' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status === 'priced' ? 'DISETUJUI' : ticket.status}
                  </span>
                </div>
              </div>
            ))}
            
            {tickets.length > 0 && tickets.filter(ticket => {
              const term = searchTerm.toLowerCase();
              return (
                (ticket.license_plate && ticket.license_plate.toLowerCase().includes(term)) ||
                (ticket.client_name && ticket.client_name.toLowerCase().includes(term)) ||
                (ticket.car_brand && ticket.car_brand.toLowerCase().includes(term))
              );
            }).length === 0 && (
              <div className="text-center bg-gray-50 p-8 rounded-xl border border-gray-200 text-gray-500">
                Tiket tidak ditemukan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
