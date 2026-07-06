import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { Printer, Send, Wrench, ChevronRight } from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [items, setItems] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
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
        .select('*, spareparts(name)')
        .eq('ticket_id', id);
      if (itemsData) setItems(itemsData);
    }
    
    // Fetch Company Settings
    const { data: settingsData } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (settingsData) setCompanySettings(settingsData);
    
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
  };

  if (loading) {
    return (
      <VerifikatorLayout>
        <div className="p-8 text-center text-gray-500 text-sm font-medium">Memuat invoice...</div>
      </VerifikatorLayout>
    );
  }

  if (!ticket) {
    return (
      <VerifikatorLayout>
        <div className="p-8 text-center text-gray-500 text-sm font-medium">Invoice tidak ditemukan.</div>
      </VerifikatorLayout>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.estimated_price || 0) * (item.quantity || 1)), 0);
  const tax = subtotal * 0.11;
  const grandTotal = subtotal + tax;

  const dateObj = new Date(ticket.created_at);
  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNum = `#INV-${dateObj.getFullYear()}${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${ticket.id.slice(0,3).toUpperCase()}`;

  return (
    <VerifikatorLayout>
      {/* Top Bar / Breadcrumb & Actions */}
      <div className="flex justify-between items-end mb-8 print:hidden">
        <div>
          <div className="flex items-center text-xs text-gray-500 font-medium mb-2 uppercase tracking-widest">
            <span className="hover:text-black cursor-pointer" onClick={() => navigate('/report')}>Laporan</span>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="text-black font-bold">Invoice</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Detail Invoice</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handlePrint}
            className="bg-white border border-gray-300 text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak PDF
          </button>
          <button className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center hover:bg-gray-800 transition-colors">
            <Send className="w-4 h-4 mr-2" />
            Kirim ke WhatsApp
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white border border-gray-200 p-12 print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-black flex items-center justify-center mr-4">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{companySettings?.company_name || 'BengkelSync'}</h2>
              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{companySettings?.company_address || 'Jl. Sudirman No. 123, Jakarta'}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{invoiceNum}</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">{formattedDate}</p>
            <div className="mt-2">
              <span className="bg-black text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase">LUNAS</span>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="flex mb-12">
          <div className="w-1/2 pr-8 border-r border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">INFORMASI PELANGGAN</p>
            <h4 className="font-bold text-gray-900 text-lg mb-2">{ticket.client_name}</h4>
            <p className="text-sm text-gray-600 mb-1">{ticket.phone_number || '-'}</p>
            <p className="text-sm text-gray-600 lowercase">{ticket.client_name.replace(/\s+/g, '.')}@email.com</p>
          </div>
          <div className="w-1/2 pl-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">INFORMASI KENDARAAN</p>
            <div className="grid grid-cols-3 gap-y-3">
              <div className="text-sm text-gray-500">Model:</div>
              <div className="text-sm font-medium text-gray-900 col-span-2">{ticket.car_brand} {ticket.car_year ? `(${ticket.car_year})` : ''}</div>
              
              <div className="text-sm text-gray-500">Plat Nomor:</div>
              <div className="text-sm font-medium text-gray-900 col-span-2">{ticket.license_plate}</div>
              
              <div className="text-sm text-gray-500">Odometer:</div>
              <div className="text-sm font-medium text-gray-900 col-span-2">45,210 km</div>

              {ticket.notes && (
                <>
                  <div className="text-sm text-gray-500">Keluhan:</div>
                  <div className="text-sm font-medium text-gray-900 col-span-2">{ticket.notes}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="min-w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-left text-[10px] font-bold text-black uppercase tracking-wider w-12">#</th>
              <th className="py-3 text-left text-[10px] font-bold text-black uppercase tracking-wider">DESKRIPSI</th>
              <th className="py-3 text-center text-[10px] font-bold text-black uppercase tracking-wider">QTY</th>
              <th className="py-3 text-right text-[10px] font-bold text-black uppercase tracking-wider">HARGA SATUAN</th>
              <th className="py-3 text-right text-[10px] font-bold text-black uppercase tracking-wider">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                <td className="py-4 text-sm font-medium text-gray-900">{item.spareparts?.name}</td>
                <td className="py-4 text-sm text-gray-900 text-center font-medium">{item.quantity || 1} Pcs</td>
                <td className="py-4 text-sm text-gray-600 text-right">Rp {formatRupiah(item.estimated_price)}</td>
                <td className="py-4 text-sm font-bold text-gray-900 text-right">Rp {formatRupiah(item.estimated_price * (item.quantity || 1))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" className="py-8 text-center text-sm text-gray-500">Tidak ada rincian pengerjaan.</td></tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-1/3">
            <div className="flex justify-between items-center py-2 text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">Rp {formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm text-gray-600 mb-2 border-b border-gray-200 pb-4">
              <span>Pajak (11%)</span>
              <span className="font-medium text-gray-900">Rp {formatRupiah(tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-gray-900 text-base">Grand Total</span>
              <span className="font-bold text-xl text-gray-900">Rp {formatRupiah(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-900 mb-2">Metode Pembayaran: <strong className="font-bold">{companySettings?.payment_method || 'Transfer Bank'}</strong></p>
          <p className="text-xs text-gray-500 italic">Terima kasih telah mempercayakan kendaraan Anda pada {companySettings?.company_name || 'BengkelSync'}.</p>
        </div>

      </div>
    </VerifikatorLayout>
  );
}
