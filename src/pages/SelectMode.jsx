import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SelectMode() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Pilih Mode Kerja</h1>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => navigate('/checklist')}
            className="w-full bg-black text-white py-6 px-4 rounded-xl shadow-md text-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📝 Buat Checklist Modifikasi</span>
          </button>
          
          <button 
            disabled
            className="w-full bg-white text-gray-400 py-6 px-4 rounded-xl shadow-sm border border-gray-200 text-xl font-bold flex flex-col items-center justify-center"
          >
            <div className="flex items-center space-x-2">
              <span>🔍 QC / Verifikasi Mobil</span>
            </div>
            <span className="mt-2 text-xs font-semibold bg-gray-200 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
          </button>

          <button 
            onClick={() => navigate('/mechanic-dashboard')}
            className="w-full bg-white text-gray-700 py-4 px-4 rounded-xl shadow-sm border border-gray-200 text-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 mt-4"
          >
            <span>📊 Riwayat Pengiriman Saya</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full bg-transparent text-red-500 py-4 px-4 rounded-xl border border-red-200 text-lg font-bold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 mt-4"
          >
            <span>🚪 Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
