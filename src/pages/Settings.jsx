import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { Building2, MapPin, CreditCard, Save } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    payment_method: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setFormData({
        company_name: data.company_name || '',
        company_address: data.company_address || '',
        payment_method: data.payment_method || ''
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('company_settings')
        .update(formData)
        .eq('id', 1);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan pengaturan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <VerifikatorLayout>
        <div className="p-8 text-center text-gray-500 text-sm font-medium">Memuat pengaturan...</div>
      </VerifikatorLayout>
    );
  }

  return (
    <VerifikatorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Perusahaan</h1>
        <p className="text-gray-500 mt-2">Kelola informasi bengkel yang akan tampil di struk dan invoice pelanggan.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-black text-white text-sm font-bold tracking-wider rounded-sm flex items-center">
          <Save className="w-5 h-5 mr-3" />
          PENGATURAN BERHASIL DISIMPAN
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#FAFAFA]">
          <h2 className="text-lg font-bold text-gray-900">Profil Bengkel</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-1.5" /> Nama Perusahaan
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                  placeholder="Contoh: Bengkel Utama Motor"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1.5" /> Metode Pembayaran Utama
                </label>
                <input
                  type="text"
                  name="payment_method"
                  required
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                  placeholder="Contoh: Transfer Bank BCA"
                />
                <p className="text-[10px] text-gray-400 mt-2">Info ini akan dicetak di bagian bawah invoice.</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5" /> Alamat Lengkap
              </label>
              <textarea
                name="company_address"
                required
                rows="5"
                value={formData.company_address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                placeholder="Alamat bengkel secara detail..."
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </form>
      </div>
    </VerifikatorLayout>
  );
}
