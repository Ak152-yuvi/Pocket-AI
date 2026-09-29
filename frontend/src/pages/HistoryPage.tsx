import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Home,
  PartyPopper,
  Gem,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  PlusCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { HistorySummaryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistorySummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

  const loadHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await api.getHistory();
      setHistoryItems(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load planning history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const confirmDelete = async (id: number) => {
    try {
      await api.deleteHistory(id);
      setHistoryItems(historyItems.filter((item) => item.id !== id));
      setItemToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete plan: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Planning History</h1>
            <p className="text-xs text-gray-400">Review, print, and manage all your previously generated AI plans.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/home-planner')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B12]/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full glass-card rounded-3xl p-6 border border-red-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Saved Plan?</h3>
              <p className="text-xs text-gray-400">
                This will permanently delete this plan from your account history. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(itemToDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-gray-500">Loading your saved plans...</div>
      ) : historyItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-gray-500 mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Saved Plans Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Whenever you generate a budget plan using any of the three planners, it will automatically be archived here for instant review.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-purple-600/25"
            >
              Explore Planners
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.planner_type === 'home'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : item.planner_type === 'party'
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {item.planner_type === 'home' ? (
                    <Home className="w-5 h-5" />
                  ) : item.planner_type === 'party' ? (
                    <PartyPopper className="w-5 h-5" />
                  ) : (
                    <Gem className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white capitalize">
                      {item.planner_type} Planning Record #{item.id}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-xl">{item.summary}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                    Budget Ceiling
                  </span>
                  <span className="text-base font-black text-purple-300">
                    ₹{item.total_budget.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/history/${item.id}`)}
                    className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Plan</span>
                  </button>
                  <button
                    onClick={() => setItemToDelete(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
