import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Database, BarChart2, User, Settings as SettingsIcon, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function VerifikatorLayout({ children }) {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Antrean', path: '/queue', icon: ClipboardList },
    { name: 'Master Data', path: '/master-data', icon: Database },
    { name: 'Laporan', path: '/report', icon: BarChart2 },
    { name: 'Pengaturan', path: '/settings', icon: SettingsIcon },
  ];

  const NavLink = ({ item, onClick }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={onClick}
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
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-gray-900 print:bg-white">

      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside className="hidden md:flex w-64 bg-[#F8F9FA] border-r border-gray-200 flex-col print:hidden">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-black">Workshop Management</h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Panel Manager</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-bold text-gray-900">Manager</p>
                <p className="text-xs text-gray-500 truncate max-w-[110px]">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-black font-semibold">
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ============ MOBILE OVERLAY ============ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ MOBILE DRAWER SIDEBAR ============ */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-40 flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out md:hidden print:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-black">Workshop Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Panel Manager</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Manager</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ============ MOBILE TOP BAR ============ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 print:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-sm font-bold text-gray-900">Workshop Management</span>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 overflow-y-auto print:p-0 print:overflow-visible print:w-full">
        {/* Spacer untuk mobile top bar */}
        <div className="md:hidden h-14" />
        <div className="p-4 md:p-8 max-w-6xl mx-auto print:max-w-none print:m-0">
          {children}
        </div>
        {/* Spacer untuk mobile bottom nav */}
        <div className="md:hidden h-16" />
      </main>

      {/* ============ MOBILE BOTTOM NAVIGATION ============ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex print:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
              <span className="truncate">{item.name}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-black" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
