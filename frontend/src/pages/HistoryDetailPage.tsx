import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  AlertCircle,
  FileText,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { HistoryDetailResponse } from '../types';
import { PlanResultView } from '../components/PlanResultView';

export const HistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historyDetail, setHistoryDetail] = useState<HistoryDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await api.getHistoryItem(id);
        setHistoryDetail(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load plan details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this saved plan?')) return;
    try {
      await api.deleteHistory(id);
      navigate('/history');
    } catch (err: any) {
      alert(`Failed to delete plan: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Loading saved plan #{id}...
      </div>
    );
  }

  if (errorMsg || !historyDetail) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg || 'Plan not found.'}</span>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center space-x-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to History</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Saved Plans</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInputs(!showInputs)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showInputs ? 'Hide Input Details' : 'View Input Parameters'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Plan</span>
          </button>
        </div>
      </div>

      {/* Expandable Input Snapshot */}
      {showInputs && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 no-print animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Inputs Used to Generate This Plan</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(historyDetail.input_data || {}).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-gray-200 font-medium truncate block mt-0.5">
                  {Array.isArray(val) ? val.join(', ') : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Plan Result Component */}
      <PlanResultView
        plan={historyDetail.result_data as any}
      />
    </div>
  );
};
