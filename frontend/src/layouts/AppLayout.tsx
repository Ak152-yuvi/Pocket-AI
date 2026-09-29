import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  PartyPopper,
  Gem,
  History,
  User as UserIcon,
  LogOut,
  Sparkles,
  Cpu,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout, health } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Home Planner', path: '/home-planner', icon: Home },
    { name: 'Party Planner', path: '/party-planner', icon: PartyPopper },
    { name: 'Jewelry & Outfit', path: '/jewelry-planner', icon: Gem },
    { name: 'Planning History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d121f]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">PocketSmart AI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] z-40 bg-[#0b0f1a]/95 backdrop-blur-xl border-b border-slate-800 p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full ${health?.gemini_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{health?.gemini_configured ? 'Gemini AI Connected' : 'Smart Fallback Mode'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 px-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0F1A]/80 backdrop-blur-xl border-r border-slate-800/80 shrink-0 sticky top-0 h-screen no-print">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight gradient-text">PocketSmart AI</h1>
              <p className="text-[11px] text-gray-400 font-medium">Budget & Planner Assistant</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Planners & Tools
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 text-white border border-purple-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom AI Status & User */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          {/* AI Connection Status Pill */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-300 font-medium">AI Status</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.gemini_configured ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className={`text-[11px] font-semibold ${health?.gemini_configured ? 'text-emerald-400' : 'text-amber-300'}`}>
                {health?.gemini_configured ? 'Gemini 2.5' : 'Smart Fallback'}
              </span>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'PS'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
