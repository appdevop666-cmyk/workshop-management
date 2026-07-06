import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  const redirectUser = (role) => {
    if (role === 'verifikator') {
      navigate('/dashboard');
    } else {
      navigate('/select-mode');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCheckingSession(true);

    try {
      // Step 1: Cek apakah akun ini sedang aktif di tempat lain (SEBELUM login)
      const { data: hasActiveSession, error: rpcError } = await supabase
        .rpc('check_active_session', { user_email: email });

      setCheckingSession(false);

      if (rpcError) {
        console.warn('RPC check failed, proceeding with login:', rpcError.message);
      }

      // Jika ada sesi aktif di tempat lain → munculkan dialog
      if (hasActiveSession) {
        setShowConfirmModal(true);
        return;
      }

      // Tidak ada sesi aktif → langsung login
      const result = await login(email, password, false);
      redirectUser(result.role);
    } catch (err) {
      setCheckingSession(false);
      // Error ditangani di store
    }
  };

  const dismissModal = () => {
    setShowConfirmModal(false);
  };

  const isLoading = loading || checkingSession;

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
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            {checkingSession ? 'Memeriksa sesi...' : isLoading ? 'Masuk...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Dialog Informasi Sesi Aktif */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-gray-900">Sesi Sedang Aktif</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Akun <strong>{email}</strong> saat ini sedang aktif di perangkat lain.
              Silakan logout terlebih dahulu dari perangkat tersebut sebelum login di sini.
            </p>
            <div className="flex justify-end">
              <button
                onClick={dismissModal}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
