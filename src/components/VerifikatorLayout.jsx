import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Database, BarChart2, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function VerifikatorLayout({ children }) {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Antrean', path: '/queue', icon: ClipboardList },
    { name: 'Master Data', path: '/master-data', icon: Database },
    { name: 'Laporan', path: '/report', icon: BarChart2 },
    { name: 'Pengaturan', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-gray-900 print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F8F9FA] border-r border-gray-200 flex flex-col print:hidden">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-black">Workshop Management</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Workshop Management</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-md transition-colors ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-bold text-gray-900">Manager Profile</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-black font-semibold">
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible print:w-full">
        <div className="max-w-6xl mx-auto print:max-w-none print:m-0">
          {children}
        </div>
      </main>
    </div>
  );
}
