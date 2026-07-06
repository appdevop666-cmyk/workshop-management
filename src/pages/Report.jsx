import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { FileText, Search } from 'lucide-react';

export default function Report() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('daily'); // 'daily', 'monthly', 'yearly'
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    // Fetch only completed tickets for invoices
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
      
    if (data) setInvoices(data);
    setLoading(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (filterValue) {
      const invDate = new Date(inv.created_at);
      
      if (filterType === 'daily') {
        const dateStr = invDate.toISOString().split('T')[0]; // YYYY-MM-DD
        matchesDate = dateStr === filterValue;
      } else if (filterType === 'monthly') {
        const monthStr = invDate.toISOString().slice(0, 7); // YYYY-MM
        matchesDate = monthStr === filterValue;
      } else if (filterType === 'yearly') {
        const yearStr = invDate.getFullYear().toString(); // YYYY
        matchesDate = yearStr === filterValue;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  return (
    <VerifikatorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laporan & Invoice</h1>
        <p className="text-gray-500 mt-1">Daftar riwayat pengerjaan yang sudah selesai (LUNAS).</p>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#FAFAFA]">
          <div className="flex space-x-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Plat Nomor atau Nama..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
              />
            </div>
            
            <div className="flex space-x-2">
              <select 
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterValue('');
                }}
                className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm text-gray-700 bg-white"
              >
                <option value="daily">Harian</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
              
              {filterType === 'daily' && (
                <input 
                  type="date" 
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm text-gray-700"
                />
              )}
              
              {filterType === 'monthly' && (
                <input 
                  type="month" 
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm text-gray-700"
                />
              )}
              
              {filterType === 'yearly' && (
                <input 
                  type="number" 
                  min="2020" max="2100"
                  placeholder="Contoh: 2026"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm text-gray-700"
                />
              )}
            </div>
          </div>
          
          {filterValue && (
            <button 
              onClick={() => setFilterValue('')}
              className="text-xs text-gray-500 hover:text-black font-medium underline"
            >
              Reset Filter
            </button>
          )}
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">NO. INVOICE</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">TANGGAL</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">PELANGGAN</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">PLAT NOMOR</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Memuat data...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Belum ada invoice/laporan.</td></tr>
            ) : (
              filteredInvoices.map(inv => {
                const dateObj = new Date(inv.created_at);
                const invNum = `#INV-${dateObj.getFullYear()}${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${inv.id.slice(0,3).toUpperCase()}`;
                
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-gray-900">{invNum}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{inv.client_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inv.license_plate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => navigate(`/report/${inv.id}`)}
                        className="inline-flex items-center text-xs font-bold uppercase tracking-wider border border-gray-300 px-4 py-1.5 hover:bg-gray-50"
                      >
                        <FileText className="w-3 h-3 mr-2" />
                        Buka Invoice
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </VerifikatorLayout>
  );
}
