import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function MechanicTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketData) {
      setTicket(ticketData);
      
      const { data: itemsData } = await supabase
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

      if (itemsData) {
        setItems(itemsData);
      }
    }
    setLoading(false);
  };

  const handleStartWork = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'in_progress' })
        .eq('id', id);
        
      if (error) throw error;
        
      setConfirmAction(null);
      fetchDetail(); // Refresh data to show the new button instead of navigating away
    } catch (error) {
      alert("Gagal memperbarui status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinishWork = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) throw error;
        
      setConfirmAction(null);
      navigate('/mechanic-dashboard');
    } catch (error) {
      alert("Gagal memperbarui status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
  };

  if (loading) return <div className="p-8 text-center bg-[#F9F9F9] min-h-screen">Memuat data...</div>;
  if (!ticket) return <div className="p-8 text-center bg-[#F9F9F9] min-h-screen">Tiket tidak ditemukan</div>;

  const subtotal = items.reduce((sum, item) => sum + (Number(item.estimated_price || 0) * (item.quantity || 1)), 0);
  const tax = subtotal * 0.11;
  const grandTotal = subtotal + tax;

  const isApproved = ticket.status === 'priced' || ticket.status === 'in_progress';

  return (
    <div className="max-w-md mx-auto bg-[#F9F9F9] min-h-screen pb-24 font-serif text-gray-900 relative">
      {/* Header */}
      <div className="bg-[#F9F9F9] px-4 py-5 flex justify-center items-center relative border-b border-gray-200">
        <button onClick={() => navigate('/mechanic-dashboard')} className="absolute left-4">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-lg font-bold tracking-wide">Detail Estimasi</h1>
      </div>

      <div className="p-4">
        {/* Vehicle Info Box */}
        <div className="bg-[#F9F9F9] border border-gray-300 p-4 mb-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">VEHICLE</p>
            {isApproved && (
              <span className="bg-black text-white px-2 py-1 text-[9px] font-bold tracking-widest uppercase flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                DISETUJUI
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{ticket.car_brand} {ticket.car_year ? `(${ticket.car_year})` : ''}</h2>
          <p className="text-sm text-gray-600 mb-4">{ticket.license_plate} {ticket.client_name ? `• ${ticket.client_name}` : ''}</p>
          
          {ticket.notes && (
            <div className="bg-gray-50 border border-gray-200 p-3 mb-4 rounded-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">CATATAN KELUHAN</p>
              <p className="text-sm text-gray-800">{ticket.notes}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3">
            <p className="text-[10px] text-gray-500 font-medium">Ref: EST-{new Date(ticket.created_at).getFullYear()}-{(new Date(ticket.created_at).getMonth()+1).toString().padStart(2, '0')}-{ticket.id.slice(0,3).toUpperCase()}</p>
          </div>
        </div>

        {/* Approved Items */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">APPROVED ITEMS</p>
          
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.spareparts?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity || 1} Pcs</p>
                </div>
                <p className="font-bold text-sm text-gray-900">Rp {formatRupiah(item.estimated_price * (item.quantity || 1))}</p>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-gray-500 italic py-2">Belum ada item modifikasi.</p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-[#F2F2F2] p-4 mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-3">
            <span>Subtotal</span>
            <span>Rp {formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mb-4 border-b border-gray-300 pb-3">
            <span>Tax (11%)</span>
            <span>Rp {formatRupiah(tax)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-900">GRAND TOTAL</span>
            <span className="text-xl font-bold text-gray-900">Rp {formatRupiah(grandTotal)}</span>
          </div>
        </div>

        {/* Info Box */}
        {ticket.status === 'priced' && (
          <div className="bg-[#F9F9F9] border border-gray-300 p-4 flex items-start mb-6">
            <Info className="w-5 h-5 text-black mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Silakan lanjut ke proses pengerjaan dan pengambilan sparepart di gudang.
            </p>
          </div>
        )}
        
        {ticket.status === 'in_progress' && (
          <div className="bg-blue-50 border border-blue-200 p-4 flex items-start mb-6">
            <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed font-medium">
              Kendaraan sedang dalam proses pengerjaan. Tekan tombol selesai jika sudah siap diambil.
            </p>
          </div>
        )}

      </div>

      {/* Action Button */}
      {(ticket.status === 'priced' || ticket.status === 'in_progress') && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#333333] p-4 flex justify-center">
          <div className="max-w-md w-full">
            {ticket.status === 'priced' ? (
              <button 
                onClick={() => setConfirmAction('start')}
                disabled={isUpdating}
                className="w-full bg-black text-white font-bold text-xs uppercase tracking-widest py-4 transition-colors disabled:opacity-50 hover:bg-gray-800"
              >
                MULAI PENGERJAAN
              </button>
            ) : (
              <button 
                onClick={() => setConfirmAction('finish')}
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white font-bold text-xs uppercase tracking-widest py-4 transition-colors disabled:opacity-50 hover:bg-blue-700"
              >
                SELESAIKAN PENGERJAAN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-sm shadow-xl font-sans">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center text-gray-900 font-bold text-lg">
                <Info className="w-5 h-5 mr-2" />
                Konfirmasi
              </div>
              <button onClick={() => setConfirmAction(null)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              {confirmAction === 'start' 
                ? "Anda yakin ingin mulai mengerjakan kendaraan ini?"
                : "Anda yakin kendaraan ini sudah selesai dikerjakan dan siap untuk diserahkan/diambil?"}
            </p>

            <div className="flex space-x-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmAction === 'start' ? handleStartWork : handleFinishWork}
                disabled={isUpdating}
                className={`flex-1 text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${confirmAction === 'start' ? 'bg-black hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isUpdating ? 'Memproses...' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
