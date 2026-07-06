import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ChevronDown, CarFront, Armchair, Wrench } from 'lucide-react';

export default function Checklist() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  
  const [platNomor, setPlatNomor] = useState('');
  const [namaKlien, setNamaKlien] = useState('');
  const [merekMobil, setMerekMobil] = useState('');
  const [tahunMobil, setTahunMobil] = useState('');
  const [catatan, setCatatan] = useState('');
  
  const [phone, setPhone] = useState('');
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [isSearchingBrand, setIsSearchingBrand] = useState(false);
  
  const [selectedParts, setSelectedParts] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    const { data: catData } = await supabase.from('categories').select('*');
    const { data: partData } = await supabase.from('spareparts').select('*');
    if (catData) setCategories(catData);
    if (partData) setSpareparts(partData);
  };

  useEffect(() => {
    const searchClient = async () => {
      // Hanya mulai mencari jika diketik minimal 3 angka
      if (phone.length < 3) {
        setPhoneSuggestions([]);
        return;
      }
      setIsSearchingPhone(true);
      
      const { data } = await supabase
        .from('tickets')
        .select('client_name, license_plate, car_brand, phone_number')
        .ilike('phone_number', `%${phone}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        // Hilangkan duplikasi nomor telepon yang sama
        const uniqueData = data.filter((v, i, a) => a.findIndex(t => (t.phone_number === v.phone_number)) === i);
        setPhoneSuggestions(uniqueData);
        setShowSuggestions(true);
      } else {
        setPhoneSuggestions([]);
      }
      setIsSearchingPhone(false);
    };

    const delayDebounce = setTimeout(() => {
      searchClient();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [phone]);

  useEffect(() => {
    const searchBrand = async () => {
      if (merekMobil.length < 2) {
        setBrandSuggestions([]);
        return;
      }
      setIsSearchingBrand(true);
      
      const { data } = await supabase
        .from('tickets')
        .select('car_brand')
        .ilike('car_brand', `%${merekMobil}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        // Hilangkan duplikasi merek mobil
        const uniqueData = data.filter((v, i, a) => a.findIndex(t => (t.car_brand.toLowerCase() === v.car_brand.toLowerCase())) === i);
        setBrandSuggestions(uniqueData);
        setShowBrandSuggestions(true);
      } else {
        setBrandSuggestions([]);
      }
      setIsSearchingBrand(false);
    };

    const delayDebounce = setTimeout(() => {
      searchBrand();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [merekMobil]);

  const handleSelectSuggestion = (client) => {
    setPhone(client.phone_number || '');
    setNamaKlien(client.client_name || '');
    setPlatNomor(client.license_plate || '');
    setMerekMobil(client.car_brand || '');
    setShowSuggestions(false);
  };

  const handleTogglePart = (partId) => {
    setSelectedParts(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedParts.length === 0) {
      alert('Pilih minimal satu modifikasi (checklist)!');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          mechanic_id: user?.id,
          client_name: namaKlien,
          license_plate: platNomor,
          car_brand: merekMobil,
          car_year: tahunMobil,
          notes: catatan,
          phone_number: phone,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (ticketError) throw ticketError;

      const itemsToInsert = selectedParts.map(partId => ({
        ticket_id: ticket.id,
        sparepart_id: partId,
        quantity: 1
      }));
      
      const { error: itemsError } = await supabase
        .from('ticket_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;
      
      setSuccess(true);
      setPlatNomor('');
      setNamaKlien('');
      setMerekMobil('');
      setTahunMobil('');
      setCatatan('');
      setPhone('');
      setSelectedParts([]);
      
      setTimeout(() => {
        setSuccess(false);
        navigate('/mechanic-dashboard');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper for dynamic icon based on category name
  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('exterior')) return <CarFront className="w-5 h-5 mr-3" />;
    if (lowerName.includes('interior')) return <Armchair className="w-5 h-5 mr-3" />;
    if (lowerName.includes('mesin') || lowerName.includes('underhood')) return <Wrench className="w-5 h-5 mr-3" />;
    return <CarFront className="w-5 h-5 mr-3" />;
  };

  return (
    <div className="max-w-md mx-auto bg-[#FAFAFA] min-h-screen pb-24 font-sans text-gray-900 relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => navigate('/select-mode')} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Buat Tiket Baru</h1>
      </div>
      
      {success && (
        <div className="m-4 p-3 bg-black text-white text-sm font-medium rounded text-center">
          Berhasil Terkirim!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div className="p-4 space-y-4">
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">No. Telepon Klien</label>
              {isSearchingPhone && <span className="text-[10px] text-gray-400 italic">Mencari...</span>}
            </div>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => { if(phoneSuggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="0812xxxxxx" 
            />
            {/* Dropdown Suggestions */}
            {showSuggestions && phoneSuggestions.length > 0 && (
              <ul className="absolute z-30 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto shadow-lg">
                {phoneSuggestions.map((client, idx) => (
                  <li 
                    key={idx} 
                    onMouseDown={() => handleSelectSuggestion(client)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-bold text-gray-900">{client.phone_number}</div>
                    <div className="text-xs text-gray-500">{client.client_name} - {client.license_plate}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Plat Nomor</label>
            <input 
              type="text" 
              required
              value={platNomor}
              onChange={(e) => setPlatNomor(e.target.value)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="B 1234 XYZ" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Nama</label>
            <input 
              type="text" 
              required
              value={namaKlien}
              onChange={(e) => setNamaKlien(e.target.value)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="Nama Pelanggan" 
            />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">Merek & Model Mobil</label>
              {isSearchingBrand && <span className="text-[10px] text-gray-400 italic">Mencari...</span>}
            </div>
            <input 
              type="text" 
              required
              value={merekMobil}
              onChange={(e) => {
                setMerekMobil(e.target.value);
                setShowBrandSuggestions(true);
              }}
              onFocus={() => { if(brandSuggestions.length > 0) setShowBrandSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="Contoh: Honda Civic" 
            />
            {/* Dropdown Suggestions Merek */}
            {showBrandSuggestions && brandSuggestions.length > 0 && (
              <ul className="absolute z-30 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto shadow-lg">
                {brandSuggestions.map((brandObj, idx) => (
                  <li 
                    key={idx} 
                    onMouseDown={() => {
                      setMerekMobil(brandObj.car_brand);
                      setShowBrandSuggestions(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-gray-900">{brandObj.car_brand}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Tahun Mobil</label>
            <input 
              type="number" 
              value={tahunMobil}
              onChange={(e) => setTahunMobil(e.target.value)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="Contoh: 2022" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Catatan / Keluhan (Opsional)</label>
            <textarea 
              rows="3"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors" 
              placeholder="Pelanggan mengeluh soal rem blong, dll..." 
            ></textarea>
          </div>
        </div>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px w-full bg-gray-200 my-2"></div>
        </div>

        {/* Checklist Kondisi */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 tracking-tight">Checklist Kondisi</h2>
          
          <div className="space-y-3">
            {categories.map((category) => (
              <details key={category.id} className="group bg-white border border-gray-300" open={category.name.toLowerCase().includes('exterior')}>
                <summary className="flex justify-between items-center cursor-pointer list-none p-4">
                  <div className="flex items-center font-bold text-base">
                    {getCategoryIcon(category.name)}
                    <span>{category.name}</span>
                  </div>
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </span>
                </summary>
                
                <div className="border-t border-gray-200">
                  <div className="flex flex-col px-4 divide-y divide-gray-100">
                    {spareparts
                      .filter(part => part.category_id === category.id)
                      .map(part => (
                        <label key={part.id} className="flex justify-between items-center py-4 cursor-pointer">
                          <span className="text-sm text-gray-800">{part.name}</span>
                          <input 
                            type="checkbox" 
                            checked={selectedParts.includes(part.id)}
                            onChange={() => handleTogglePart(part.id)}
                            className="w-5 h-5 border-gray-300 rounded-sm text-black focus:ring-black focus:ring-offset-0" 
                          />
                        </label>
                    ))}
                    {spareparts.filter(part => part.category_id === category.id).length === 0 && (
                      <p className="py-4 text-xs text-gray-400">Belum ada data.</p>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#FAFAFA] p-4 flex justify-center z-20">
          <div className="max-w-md w-full">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 text-lg font-bold text-white bg-black hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5 mr-2" />
              {loading ? 'MENGIRIM...' : 'Kirim'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
