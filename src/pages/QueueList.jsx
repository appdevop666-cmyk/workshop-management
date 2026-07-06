import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { Search, ChevronDown, Check, AlertTriangle, X } from 'lucide-react';

export default function QueueList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [confirmModal, setConfirmModal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
      
    if (data) setTickets(data);
    setLoading(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ticket.client_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesStatus = true;
    if (statusFilter !== 'Semua Status') {
      if (statusFilter === 'Menunggu Verifikasi') matchesStatus = ticket.status === 'pending';
      if (statusFilter === 'Dalam Pengerjaan') matchesStatus = ticket.status === 'in_progress';
      if (statusFilter === 'Selesai') matchesStatus = ticket.status === 'completed';
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Menunggu Verifikasi</span>;
      case 'priced':
        return <span className="bg-gray-200 text-gray-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Pengecekan Mekanik</span>;
      case 'in_progress':
        return <span className="bg-transparent border border-dashed border-gray-400 text-gray-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Dalam Pengerjaan</span>;
      case 'completed':
        return <span className="text-black font-bold text-[10px] uppercase tracking-wider flex items-center"><Check className="w-3 h-3 mr-1" /> Siap Diambil</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getActionBtn = (ticket) => {
    if (ticket.status === 'pending' || ticket.status === 'completed') {
      return (
        <button 
          onClick={() => navigate(`/verify/${ticket.id}`)}
          className="border border-gray-300 text-black px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
        >
          Detail
        </button>
      );
    } else {
      return (
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => navigate(`/verify/${ticket.id}`)}
            className="border border-gray-300 text-black px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            Detail
          </button>
          <button 
            onClick={() => setConfirmModal(ticket)}
            className="border border-black text-black px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            Update
          </button>
        </div>
      );
    }
  };

  const handleForceUpdate = async () => {
    if (!confirmModal) return;
    setIsUpdating(true);
    
    // Determine next status
    const nextStatus = confirmModal.status === 'priced' ? 'in_progress' : 'completed';
    
    try {
      await supabase
        .from('tickets')
        .update({ status: nextStatus })
        .eq('id', confirmModal.id);
        
      setConfirmModal(null);
      fetchTickets();
    } catch (error) {
      alert("Gagal memperbarui: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <VerifikatorLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Antrean Kendaraan</h1>
        <p className="text-gray-500 mt-1 text-sm">Kelola dan pantau status pengerjaan kendaraan secara real-time.</p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Plat Nomor atau Pelanggan..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-black text-sm"
          />
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-3 whitespace-nowrap">Filter Status:</span>
          <div className="relative flex-1 md:flex-none">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full border border-gray-200 py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-black font-medium bg-white"
            >
              <option>Semua Status</option>
              <option>Menunggu Verifikasi</option>
              <option>Dalam Pengerjaan</option>
              <option>Selesai</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-b border-gray-200 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider">PLAT NOMOR</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider">NAMA PELANGGAN</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider">TIPE MOBIL</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider">MEKANIK</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider">STATUS</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold text-gray-900 uppercase tracking-wider">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">Memuat data...</td></tr>
            ) : filteredTickets.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada antrean yang cocok.</td></tr>
            ) : (
              filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-base font-bold text-gray-900">{ticket.license_plate}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.client_name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.car_brand}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.profiles?.full_name || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {getActionBtn(ticket)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="py-4 flex justify-between items-center text-xs text-gray-500">
        <span>Menampilkan {filteredTickets.length} dari {tickets.length} kendaraan</span>
        <div className="flex space-x-2">
          <button className="p-1 hover:text-black">&lt;</button>
          <button className="p-1 hover:text-black">&gt;</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 rounded-sm shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center text-orange-600 font-bold">
                <AlertTriangle className="w-5 h-5 mr-2" />
                KONFIRMASI UPDATE MANUAL
              </div>
              <button onClick={() => setConfirmModal(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              Anda akan memaksakan pembaruan status untuk kendaraan <strong>{confirmModal.license_plate}</strong> secara manual (bypass mekanik). 
              <br/><br/>
              Status saat ini: <strong className="uppercase">{confirmModal.status === 'priced' ? 'Pengecekan Mekanik' : 'Dalam Pengerjaan'}</strong>
              <br/>
              Status baru: <strong className="uppercase">{confirmModal.status === 'priced' ? 'Dalam Pengerjaan' : 'Siap Diambil'}</strong>
            </p>

            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleForceUpdate}
                disabled={isUpdating}
                className="flex-1 bg-black text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Memproses...' : 'Ya, Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </VerifikatorLayout>
  );
}
