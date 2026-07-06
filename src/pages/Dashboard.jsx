import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { ClipboardCheck, CheckCircle2, Banknote, Filter, Check, Wrench } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, done: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketItems, setTicketItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tickets')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
      
    if (data) {
      setTickets(data);
      const pending = data.filter(t => t.status === 'pending' || t.status === 'kritis').length;
      const inProgress = data.filter(t => t.status === 'in_progress' || t.status === 'priced').length;
      const completedTickets = data.filter(t => t.status === 'completed');
      const done = completedTickets.length;
      
      let totalRevenue = 0;
      if (completedTickets.length > 0) {
        const ticketIds = completedTickets.map(t => t.id);
        const { data: items } = await supabase
          .from('ticket_items')
          .select('estimated_price, quantity')
          .in('ticket_id', ticketIds);
          
        if (items) {
          const subtotal = items.reduce((sum, item) => sum + ((item.estimated_price || 0) * (item.quantity || 1)), 0);
          const tax = subtotal * 0.11;
          totalRevenue = subtotal + tax; // Grand total of all completed tickets
        }
      }
      
      setStats({ pending, inProgress, done, revenue: totalRevenue });
    }
    setLoading(false);
  };

  const openVerifyModal = (ticket) => {
    navigate(`/verify/${ticket.id}`);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // Pagination Logic
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const currentTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <VerifikatorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Verifikator</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas operasional bengkel hari ini.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menunggu Verifikasi</p>
            <ClipboardCheck className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dalam Pengerjaan</p>
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selesai Hari Ini</p>
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.done}</p>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Pendapatan</p>
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(stats.revenue)}</p>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white border border-gray-200 mb-8">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-[#FAFAFA]">
          <h2 className="text-lg font-bold text-gray-900">Antrean Kendaraan</h2>
          <button className="flex items-center px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Plat Nomor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Klien</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Mobil</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Mekanik</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">Memuat data...</td></tr>
              ) : currentTickets.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">Belum ada tiket modifikasi.</td></tr>
              ) : (
                currentTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">{ticket.license_plate}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{ticket.client_name}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{ticket.car_brand}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{ticket.profiles?.full_name || '-'}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {ticket.status === 'pending' ? (
                        <span className="px-3 py-1 inline-flex text-xs font-bold border border-gray-900 text-gray-900 uppercase tracking-wider">
                          Menunggu
                        </span>
                      ) : ticket.status === 'kritis' ? (
                        <span className="px-3 py-1 inline-flex text-xs font-bold bg-black text-white uppercase tracking-wider">
                          Kritis
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                          <Check className="w-4 h-4 mr-1" /> Selesai
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      {ticket.status === 'pending' || ticket.status === 'kritis' ? (
                        <button 
                          onClick={() => openVerifyModal(ticket)}
                          className="bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                        >
                          Verifikasi
                        </button>
                      ) : (
                        <button 
                          onClick={() => openVerifyModal(ticket)}
                          className="bg-white text-black border border-black px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                        >
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        {totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-[#FAFAFA] flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} hingga {Math.min(currentPage * itemsPerPage, tickets.length)} dari {tickets.length} antrean
            </p>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm font-bold border ${isActive ? 'bg-black text-white border-black' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

    </VerifikatorLayout>
  );
}
