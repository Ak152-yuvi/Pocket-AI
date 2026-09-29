import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  PieChart as PieIcon,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Download,
  RotateCcw,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Zap,
  Layers,
  Users,
  Clock,
  Shirt,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import {
  HomePlannerResponse,
  PartyPlannerResponse,
  JewelryPlannerResponse
} from '../types';

interface PlanResultViewProps {
  plan: HomePlannerResponse | PartyPlannerResponse | JewelryPlannerResponse;
  currencySymbol?: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
}

const COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export const PlanResultView: React.FC<PlanResultViewProps> = ({
  plan,
  currencySymbol = '₹',
  onEdit,
  onRegenerate,
}) => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const chartData = plan.categories.map((c) => ({
    name: c.name,
    value: c.allocated_amount,
    percentage: c.percentage,
  }));

  const handlePrint = () => {
    window.print();
  };

  const isHome = plan.planner_type === 'home';
  const isParty = plan.planner_type === 'party';
  const isJewelry = plan.planner_type === 'jewelry';

  const homePlan = isHome ? (plan as HomePlannerResponse) : null;
  const partyPlan = isParty ? (plan as PartyPlannerResponse) : null;
  const jewelryPlan = isJewelry ? (plan as JewelryPlannerResponse) : null;

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Banner & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                plan.is_fallback
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}
            >
              {plan.is_fallback ? '⚡ Smart Fallback Mode' : '✨ Gemini AI Optimized'}
            </span>
            <span className="text-xs text-gray-500">
              {plan.ai_model || 'PocketSmart Budget Engine'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            {plan.summary || `${plan.planner_type.toUpperCase()} Master Allocation Plan`}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-gray-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Modify Inputs</span>
            </button>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Print Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {currencySymbol}
            {plan.total_budget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">User requested ceiling</p>
        </div>

        {/* Allocated Budget */}
        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Allocated Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-200 mt-2">
            {currencySymbol}
            {plan.allocated_budget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            {((plan.allocated_budget / plan.total_budget) * 100).toFixed(1)}% of total budget
          </p>
        </div>

        {/* Remaining / Cushion Budget */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {isParty ? 'Contingency / Buffer' : 'Savings Cushion'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2">
            {currencySymbol}
            {plan.remaining_budget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-emerald-400 mt-1">Protected unallocated buffer</p>
        </div>
      </div>

      {/* Special Highlights for Party or Jewelry */}
      {isParty && partyPlan && (
        <div className="glass-card rounded-2xl p-4 border border-blue-500/20 bg-blue-950/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-300 uppercase tracking-wider font-semibold">
                Per-Person Spend Economics
              </p>
              <p className="text-xl font-bold text-white">
                {currencySymbol}
                {partyPlan.per_person_cost.toLocaleString('en-IN')} / Guest
              </p>
            </div>
          </div>
          {partyPlan.complete_event_plan && (
            <div className="hidden sm:block text-right text-xs text-gray-400">
              <span>Event Timeline Included Below</span>
            </div>
          )}
        </div>
      )}

      {isJewelry && jewelryPlan && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-slate-900/50">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Curated Ensemble Highlights</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {jewelryPlan.necklace_recommendation && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                  Necklace
                </span>
                <p className="text-xs font-semibold text-gray-200 mt-1">
                  {jewelryPlan.necklace_recommendation}
                </p>
              </div>
            )}
            {jewelryPlan.earrings_recommendation && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                  Earrings
                </span>
                <p className="text-xs font-semibold text-gray-200 mt-1">
                  {jewelryPlan.earrings_recommendation}
                </p>
              </div>
            )}
            {jewelryPlan.bracelet_recommendation && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                  Bracelet / Bangles
                </span>
                <p className="text-xs font-semibold text-gray-200 mt-1">
                  {jewelryPlan.bracelet_recommendation}
                </p>
              </div>
            )}
            {jewelryPlan.ring_recommendation && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                  Ring
                </span>
                <p className="text-xs font-semibold text-gray-200 mt-1">
                  {jewelryPlan.ring_recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Charts & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recharts Chart */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Budget Distribution</span>
            </h3>
            <div className="flex space-x-1 bg-slate-800/60 p-1 rounded-lg no-print">
              <button
                onClick={() => setChartType('pie')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'pie' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  chartType === 'bar' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${currencySymbol}${Number(value).toLocaleString('en-IN')}`,
                      'Amount',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                </PieChart>
              ) : (
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `${currencySymbol}${Number(value).toLocaleString('en-IN')}`,
                      'Amount',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart Legend list */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            {plan.categories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-300 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">
                    {currencySymbol}
                    {cat.allocated_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">({cat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category Details Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-lg text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Category Allocations</span>
          </h3>

          <div className="grid grid-cols-1 gap-3.5">
            {plan.categories.map((cat, idx) => (
              <div
                key={cat.name}
                className="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-purple-300">
                      {currencySymbol}
                      {cat.allocated_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-500 ml-1.5 font-medium">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-gray-400 pl-5">{cat.description}</p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, cat.percentage)}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Room Breakdown for Home Planner */}
          {isHome && homePlan && homePlan.rooms && homePlan.rooms.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                <span>Room-by-Room Allocation</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {homePlan.rooms.map((rm) => (
                  <div
                    key={rm.room_name}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-white">{rm.room_name}</span>
                      <span className="font-extrabold text-xs text-indigo-300">
                        {currencySymbol}
                        {rm.allocated_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {rm.breakdown && (
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400 pt-1 border-t border-slate-800">
                        {Object.entries(rm.breakdown).map(([k, v]) => (
                          <div key={k} className="flex justify-between pr-2">
                            <span>{k}:</span>
                            <span className="text-gray-300">
                              {currencySymbol}
                              {Number(v).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Timeline for Party Planner */}
          {isParty && partyPlan?.complete_event_plan && (
            <div className="mt-8 space-y-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Event Execution Timeline</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                {partyPlan.complete_event_plan}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Items Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-xl text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Curated Recommendations & Budget Ranges</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.recommendations.map((rec, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.priority.toLowerCase() === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : rec.priority.toLowerCase() === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                  <span className="font-bold text-sm text-purple-300">
                    {currencySymbol}
                    {rec.estimated_price_min.toLocaleString('en-IN')} – {currencySymbol}
                    {rec.estimated_price_max.toLocaleString('en-IN')}
                  </span>
                </div>
                <h4 className="font-bold text-base text-white mt-2">{rec.item_name}</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{rec.reason}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                {rec.alternative && (
                  <div className="text-gray-400">
                    <span className="text-emerald-400 font-semibold">Value Alternative: </span>
                    {rec.alternative}
                  </div>
                )}
                {rec.premium_option && (
                  <div className="text-gray-400">
                    <span className="text-purple-400 font-semibold">Premium Upgrade: </span>
                    {rec.premium_option}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Explanation Callout */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 space-y-2">
        <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>Allocation Rationale & Methodology</span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{plan.explanation}</p>
      </div>

      {/* Savings Tips & Premium Upgrades 2-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money Saving Tips */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/5 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
            <Lightbulb className="w-5 h-5" />
            <span>Money-Saving Strategies</span>
          </div>
          <ul className="space-y-3">
            {plan.saving_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Upgrade Suggestions */}
        <div className="glass-card rounded-2xl p-6 border border-purple-500/20 bg-purple-950/5 space-y-4">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-base">
            <Zap className="w-5 h-5" />
            <span>Premium Upgrade Options</span>
          </div>
          <ul className="space-y-3">
            {plan.premium_upgrades.map((upg, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{upg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Back to History Link */}
      <div className="flex justify-center pt-4 no-print">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View All Saved Plans in History</span>
        </button>
      </div>
    </div>
  );
};
