import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { ArrowLeft, User, Phone, Send, Info } from 'lucide-react';

export default function VerifyTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const fetchTicketDetail = async () => {
    setLoading(true);
    // Fetch ticket and mechanic profile
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, profiles(full_name)')
      .eq('id', id)
      .single();

    if (ticketData) {
      setTicket(ticketData);
      
      // Fetch items
      const { data: itemsData, error } = await supabase
        .from('ticket_items')
        .select(`
          id, 
          estimated_price, 
          quantity,
          spareparts (
            name,
            category_id
          )
        `)
        .eq('ticket_id', id);

      if (error) console.error("Fetch items error:", error);

      if (itemsData) {
        setItems(itemsData.map(item => ({
          ...item,
          price: item.estimated_price || 0,
          quantity: item.quantity || 1
        })));
      }
    }
    setLoading(false);
  };

  const handlePriceChange = (itemId, value) => {
    const newPrice = Number(value.replace(/[^0-9]/g, ''));
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, price: newPrice } : item));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const submitVerification = async () => {
    setIsSubmitting(true);
    try {
      // Update items
      for (const item of items) {
        await supabase
          .from('ticket_items')
          .update({ estimated_price: item.price })
          .eq('id', item.id);
      }
      
      // Update ticket status
      await supabase
        .from('tickets')
        .update({ status: 'priced' })
        .eq('id', id);
        
      navigate('/dashboard');
    } catch (err) {
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
  };

  if (loading) return <VerifikatorLayout><div className="p-8">Memuat data...</div></VerifikatorLayout>;
  if (!ticket) return <VerifikatorLayout><div className="p-8">Tiket tidak ditemukan</div></VerifikatorLayout>;

  const subtotal = calculateSubtotal();
  const ppn = subtotal * 0.11;
  const total = subtotal + ppn;

  const isVerified = ticket.status !== 'pending' && ticket.status !== 'kritis';

  return (
    <VerifikatorLayout>
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Antrean
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verifikasi Harga Servis</h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider">INVOICE: #INV-{new Date(ticket.created_at).getFullYear()}{(new Date(ticket.created_at).getMonth()+1).toString().padStart(2, '0')}-{ticket.id.slice(0,4).toUpperCase()}</p>
          </div>
          <div className={`px-4 py-2 rounded flex items-center text-xs font-bold tracking-wider ${isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <WrenchIcon className="w-4 h-4 mr-2" />
            {isVerified ? 'STATUS: ESTIMASI DISETUJUI' : 'STATUS: PENGECEKAN MEKANIK SELESAI'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Car & Mechanic Info */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{ticket.car_brand} {ticket.car_year ? `(${ticket.car_year})` : ''}</h2>
              <p className="text-sm text-gray-500 mt-1">{ticket.license_plate} • Masuk: {new Date(ticket.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">MEKANIK BERTUGAS</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{ticket.profiles?.full_name || 'Mekanik'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KELUHAN PELANGGAN</p>
              <p className="text-sm text-gray-800 mt-1">{ticket.notes || 'Modifikasi / Perbaikan Kustom'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WAKTU MASUK</p>
              <p className="text-sm text-gray-800 mt-1">{new Date(ticket.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ESTIMASI SELESAI</p>
              <p className="text-sm text-gray-800 mt-1">-</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white border border-gray-200 p-6 rounded-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">INFORMASI PELANGGAN</p>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{ticket.client_name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{ticket.phone_number || 'Belum ada nomor telepon'}</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Phone className="w-4 h-4 mr-2" />
            Hubungi Pelanggan via WhatsApp
          </button>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white border border-gray-200 rounded-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#FAFAFA]">
          <h2 className="text-lg font-bold text-gray-900">Hasil Pengecekan & Estimasi Biaya</h2>
          <span className="flex items-center text-xs text-gray-500">
            <Info className="w-4 h-4 mr-1.5" />
            Input harga final sebelum konfirmasi ke pelanggan.
          </span>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FAFAFA]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAMA KOMPONEN / JASA</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">KONDISI (MEKANIK)</th>
              <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">QTY</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-40">HARGA SATUAN (RP)</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider w-40">TOTAL (RP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={item.id} className="bg-white">
                <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">{item.spareparts?.name}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">Part #: MOD-{item.id.slice(0,6)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold border border-gray-300 text-gray-600 bg-gray-50 rounded-sm">
                    Modifikasi Diminta
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-center">{item.quantity}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-end">
                    <input 
                      type="text"
                      disabled={isVerified}
                      value={item.price === 0 ? '' : formatRupiah(item.price)}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className={`w-full text-right font-bold text-gray-900 focus:outline-none border-b py-1 ${isVerified ? 'border-transparent bg-transparent' : 'border-gray-300 focus:border-black'}`}
                      placeholder="0"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {formatRupiah(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Totals */}
        <div className="border-t border-gray-200 bg-[#FAFAFA] px-6 py-6 flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal Servis & Part</span>
              <span className="font-medium text-gray-900">Rp {formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">PPN (11%)</span>
              <span className="font-medium text-gray-900">Rp {formatRupiah(ppn)}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-end">
              <div>
                <p className="text-lg font-bold text-gray-900 uppercase">TOTAL</p>
                <p className="text-lg font-bold text-gray-900 uppercase">ESTIMASI</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rp {formatRupiah(total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pb-12">
        <button disabled className="px-4 py-2.5 bg-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-sm cursor-not-allowed">
          QC Pengecekan Akhir (Coming Soon)
        </button>
        {isVerified ? (
          <div className="flex space-x-3">
            <div className="px-6 py-3 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-sm">
              Tiket Sudah Disetujui (Read-Only)
            </div>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button className="px-6 py-3 bg-white border border-gray-300 text-gray-900 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
              Simpan Draf
            </button>
            <button 
              onClick={submitVerification}
              disabled={isSubmitting}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Kirim Estimasi'}
            </button>
          </div>
        )}
      </div>
    </VerifikatorLayout>
  );
}

// Simple local icon for wrench/tool
function WrenchIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
