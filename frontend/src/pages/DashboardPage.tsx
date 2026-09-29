import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Home,
  PartyPopper,
  Gem,
  History,
  TrendingUp,
  Cpu,
  ArrowRight,
  Clock,
  Eye,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HistorySummaryItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, health } = useAuth();
  const navigate = useNavigate();

  const [historyItems, setHistoryItems] = useState<HistorySummaryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const items = await api.getHistory();
        setHistoryItems(items);
      } catch (err) {
        console.error('Failed to load history on dashboard:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const totalPlans = historyItems.length;
  const homePlans = historyItems.filter((i) => i.planner_type === 'home').length;
  const partyPlans = historyItems.filter((i) => i.planner_type === 'party').length;
  const jewelryPlans = historyItems.filter((i) => i.planner_type === 'jewelry').length;

  const recentPlans = historyItems.slice(0, 5);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border border-purple-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Budget & Smart Recommendation Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Plan smarter.{' '}
            <span className="gradient-text">Spend better.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            PocketSmart AI turns your budget into practical, personalized plans. Whether furnishing your home, organizing a memorable celebration, or selecting jewelry that matches your outfit—get precision category allocations guaranteed never to exceed your limits.
          </p>

          {/* AI Status Badge */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">AI Engine:</span>
              <span
                className={`font-semibold flex items-center space-x-1 ${
                  health?.gemini_configured ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    health?.gemini_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {health?.gemini_configured ? 'Google Gemini AI Connected' : 'Smart Fallback Mode'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Overspending Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plans */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Plans</span>
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{totalPlans}</p>
          <p className="text-[11px] text-gray-400 mt-1">Generated plans</p>
        </div>

        {/* Home Plans */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Home Interior</span>
            <Home className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-300 mt-2">{homePlans}</p>
          <p className="text-[11px] text-gray-400 mt-1">Spaces planned</p>
        </div>

        {/* Party Plans */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Parties & Events</span>
            <PartyPopper className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-pink-300 mt-2">{partyPlans}</p>
          <p className="text-[11px] text-gray-400 mt-1">Events budgeted</p>
        </div>

        {/* Jewelry Plans */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Jewelry & Outfits</span>
            <Gem className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2">{jewelryPlans}</p>
          <p className="text-[11px] text-gray-400 mt-1">Ensembles curated</p>
        </div>
      </div>

      {/* Quick Actions Header & 3 Launch Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            <span>Launch a New Budget Planner</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Home Planner Action */}
          <div
            onClick={() => navigate('/home-planner')}
            className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Plan My Home
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Smart room-by-room budgeting for furniture, lighting, modular storage, and decor.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-blue-400 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Start Planning Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Party Planner Action */}
          <div
            onClick={() => navigate('/party-planner')}
            className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                Plan My Party
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Guest-count calculations for catering, venue rental, ambience decor, and entertainment.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-pink-400 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Start Planning Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Jewelry Planner Action */}
          <div
            onClick={() => navigate('/jewelry-planner')}
            className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Plan My Jewelry
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                AI vision outfit matching with coordinated necklace, earring, bangle, and ring styling.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-bold text-emerald-400 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Start Planning Jewelry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Plans Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Recent Plans</span>
          </h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading your recent plans...</div>
        ) : recentPlans.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm text-gray-400">You haven't generated any plans yet.</p>
            <p className="text-xs text-gray-500">
              Select one of the planners above to generate your first AI-optimized budget.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentPlans.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.planner_type === 'home'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : item.planner_type === 'party'
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.planner_type === 'home' ? (
                      <Home className="w-4 h-4" />
                    ) : item.planner_type === 'party' ? (
                      <PartyPopper className="w-4 h-4" />
                    ) : (
                      <Gem className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white capitalize">
                      {item.planner_type} Plan
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.summary}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-12 sm:pl-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-300">
                      ₹{item.total_budget.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/history/${item.id}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                    title="View Saved Plan"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
