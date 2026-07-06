import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password, false);
      
      if (result.requireForce) {
        setShowConfirmModal(true);
        return;
      }

      redirectUser(result.role);
    } catch (err) {
      // Error is handled in the store and displayed below
    }
  };

  const handleForceLogin = async () => {
    setShowConfirmModal(false);
    try {
      const result = await login(email, password, true);
      redirectUser(result.role);
    } catch (err) {
      // Error is handled in the store
    }
  };

  const cancelLogin = async () => {
    setShowConfirmModal(false);
    await logout();
  };

  const redirectUser = (role) => {
    if (role === 'verifikator') {
      navigate('/dashboard');
    } else {
      navigate('/select-mode');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Workshop Management</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="admin@bengkel.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Masuk...' : 'Login'}
          </button>
        </form>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Sesi Sedang Aktif</h2>
            <p className="text-sm text-gray-600 mb-6">
              Akun ini terdeteksi sedang aktif/login di perangkat lain. Apakah Anda ingin melanjutkan dan memaksa keluar perangkat tersebut?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelLogin}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Batal
              </button>
              <button 
                onClick={handleForceLogin}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Ya, Paksa Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
