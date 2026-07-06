import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VerifikatorLayout from '../components/VerifikatorLayout';
import { Plus, Search, Filter, X } from 'lucide-react';

export default function MasterData() {
  const [categories, setCategories] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setLoading(true);
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
      
    const { data: partData } = await supabase
      .from('spareparts')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (catData) {
      setCategories(catData);
      if (catData.length > 0 && !activeCategory) setActiveCategory(catData[0].id);
    }
    if (partData) setSpareparts(partData);
    setLoading(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      await supabase.from('categories').insert([{ name: newCategoryName }]);
      setNewCategoryName('');
      setShowCategoryModal(false);
      fetchMasterData();
    } catch (error) {
      alert("Gagal menambahkan kategori: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeCategory) return;
    setIsSubmitting(true);
    try {
      await supabase.from('spareparts').insert([{ 
        category_id: activeCategory,
        name: newItemName 
      }]);
      setNewItemName('');
      setShowItemModal(false);
      fetchMasterData();
    } catch (error) {
      alert("Gagal menambahkan item: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || '';
  const filteredParts = spareparts.filter(p => 
    p.category_id === activeCategory && 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryPrefix = (name) => {
    if (!name) return 'PRT';
    return name.substring(0, 3).toUpperCase();
  };

  const categoryPrefix = getCategoryPrefix(activeCategoryName);

  return (
    <VerifikatorLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Master Data</h1>
          <p className="text-gray-500 mt-1">Kelola kategori dan item sparepart bengkel.</p>
        </div>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Kategori Baru
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left Column: Categories */}
        <div className="w-1/3">
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#FAFAFA]">
              <h2 className="text-lg font-bold text-gray-900">Kategori</h2>
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-100 p-2 space-y-2">
              {loading ? (
                <div className="p-4 text-sm text-gray-500">Memuat kategori...</div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">Belum ada kategori.</div>
              ) : (
                categories.map((cat) => {
                  const itemCount = spareparts.filter(p => p.category_id === cat.id).length;
                  const isActive = activeCategory === cat.id;
                  
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => setActiveCategory(cat.id)}
                      className={`p-4 border cursor-pointer transition-all ${
                        isActive 
                          ? 'border-black border-2 bg-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Modifikasi & Kustomisasi</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-sm ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {itemCount} Items
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Items */}
        <div className="w-2/3">
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Item Sparepart: {activeCategoryName}</h2>
                  <p className="text-sm text-gray-500 mt-1">Menampilkan {filteredParts.length} item</p>
                </div>
                <button 
                  onClick={() => setShowItemModal(true)}
                  disabled={!activeCategory}
                  className="bg-white border border-black text-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </button>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode part, nama barang..." 
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black text-sm"
                />
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">KODE</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">NAMA BARANG</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">STOK</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">HARGA (IDR)</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Memuat item...</td>
                  </tr>
                ) : filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Tidak ada item dalam kategori ini.</td>
                  </tr>
                ) : (
                  filteredParts.map((part, idx) => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {categoryPrefix}-{String(idx + 1).padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-gray-900">{part.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Modifikasi Kustom</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">-</span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-bold text-gray-900">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-black">
                          •••
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {filteredParts.length > 0 && (
              <div className="p-6 text-center border-t border-gray-200">
                <p className="text-xs text-gray-400">Akhir dari daftar. Menampilkan {filteredParts.length} dari {filteredParts.length} item.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-sm shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Tambah Kategori Baru</h3>
              <button onClick={() => setShowCategoryModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-black" /></button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Kategori</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Misal: Suspension Parts"
                  className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white font-bold py-3 uppercase tracking-wider text-xs hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-sm shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Tambah Item Sparepart</h3>
              <button onClick={() => setShowItemModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-black" /></button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori Saat Ini</label>
                <input 
                  type="text" 
                  value={activeCategoryName}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 p-3 text-gray-500 font-bold"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Item</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Misal: Shockbreaker OHLINS"
                  className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white font-bold py-3 uppercase tracking-wider text-xs hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </VerifikatorLayout>
  );
}
