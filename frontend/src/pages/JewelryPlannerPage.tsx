import React, { useState } from 'react';
import {
  Gem,
  Sparkles,
  Shirt,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { JewelryPlannerInput, JewelryPlannerResponse, OutfitAnalysisResponse } from '../types';
import { PlanResultView } from '../components/PlanResultView';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { OutfitUploadArea } from '../components/OutfitUploadArea';

const OCCASIONS = [
  'Wedding',
  'Engagement',
  'Festival',
  'Cocktail Party',
  'Casual Chic',
  'Office Elegance',
  'Photoshoot',
  'Reception'
];

const JEWELRY_STYLES = [
  'Traditional',
  'Modern',
  'Minimal',
  'Bridal',
  'Luxury',
  'Elegant Statement',
  'Vintage Heirloom'
];

const METALS = [
  'Gold (22K / 18K)',
  'Rose Gold',
  'Platinum',
  'White Gold',
  'Oxidized Silver',
  'Diamond & Kundan'
];

const JEWELRY_TYPES = [
  'Necklace',
  'Earrings',
  'Bangles / Bracelet',
  'Ring',
  'Maang Tikka',
  'Anklet'
];

export const JewelryPlannerPage: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState<number>(75000);
  const [occasion, setOccasion] = useState<string>('Wedding');
  const [jewelryStyle, setInteriorStyle] = useState<string>('Traditional');
  const [preferredMetal, setPreferredMetal] = useState<string>('Gold (22K / 18K)');
  const [preferredColor, setPreferredColor] = useState<string>('Ruby Red & Gold');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'Necklace',
    'Earrings',
    'Bangles / Bracelet',
    'Ring'
  ]);
  const [outfitDescription, setOutfitDescription] = useState<string>('');
  const [additionalReq, setAdditionalReq] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<JewelryPlannerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleType = (t: string) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((item) => item !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const handleAnalysisAutoFill = (analysis: OutfitAnalysisResponse) => {
    // Automatically populate outfit description and styling insights
    setOutfitDescription(
      `Primary Color: ${analysis.primary_color}; Style: ${analysis.style}; Neckline: ${analysis.neckline || 'Standard'}. Recommended: ${analysis.suggested_necklace}, ${analysis.suggested_earrings}.`
    );
    if (analysis.suitable_jewelry_colors.length > 0) {
      setPreferredColor(analysis.suitable_jewelry_colors.slice(0, 2).join(' & '));
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (totalBudget < 500) {
      setErrorMsg('Please enter a total budget of at least ₹500.');
      return;
    }

    if (selectedTypes.length === 0) {
      setErrorMsg('Please select at least one jewelry type.');
      return;
    }

    setIsGenerating(true);

    const payload: JewelryPlannerInput = {
      total_budget: Number(totalBudget),
      occasion,
      jewelry_style: jewelryStyle,
      preferred_metal: preferredMetal,
      preferred_color: preferredColor,
      jewelry_types: selectedTypes,
      outfit_description: outfitDescription,
      additional_requirements: additionalReq,
    };

    try {
      const plan = await api.generateJewelryPlan(payload);
      setGeneratedPlan(plan);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate jewelry plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <LoadingOverlay isVisible={isGenerating} title="PocketSmart AI is Curating Your Jewelry Plan" />

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Gem className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Jewelry & Outfit Match Planner</h1>
          <p className="text-xs text-gray-400">
            Harmonious jewelry sets, metal pairing, and AI vision outfit color analysis.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Plan Results View */}
      {generatedPlan ? (
        <div className="space-y-6">
          <PlanResultView
            plan={generatedPlan}
            onEdit={() => setGeneratedPlan(null)}
            onRegenerate={handleGenerate}
          />
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Section 0: Optional Outfit Vision Analysis */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-purple-950/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
                <Shirt className="w-4 h-4" />
                <span>AI Vision: Upload Outfit Photo (Optional)</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Auto-detect colors & neckline</span>
            </div>
            <p className="text-xs text-gray-400">
              Upload a picture of the saree, lehenga, gown, or suit you plan to wear. Our AI vision model will extract the palette, neckline cut, and styling tone to generate precision matching jewelry.
            </p>
            <OutfitUploadArea onAnalysisComplete={handleAnalysisAutoFill} />
          </div>

          {/* Section 1: Budget & Occasion */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Step 1: Budget & Occasion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Budget */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Jewelry Budget (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTotalBudget(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        totalBudget === amt
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-800/60 text-gray-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Color Harmony */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Target Outfit / Accent Colors
                </label>
                <input
                  type="text"
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value)}
                  placeholder="e.g. Royal Maroon, Emerald Green, Pastel Pink, Ivory"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-gray-500">
                  Our stylist matches metallic warmth and gemstone hues to these colors.
                </p>
              </div>
            </div>

            {/* Occasions */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-gray-300">Occasion Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {OCCASIONS.map((occ) => (
                  <button
                    type="button"
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      occasion === occ
                        ? 'bg-emerald-600/25 text-white border-emerald-500/50 shadow-md shadow-emerald-600/10'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Metal & Design Language */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
              <Gem className="w-4 h-4" />
              <span>Step 2: Metal Preference & Aesthetic Style</span>
            </div>

            {/* Metals */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Preferred Metal</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {METALS.map((metal) => (
                  <button
                    type="button"
                    key={metal}
                    onClick={() => setPreferredMetal(metal)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      preferredMetal === metal
                        ? 'bg-amber-600/25 text-white border-amber-500/50 shadow-md'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {metal}
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-300">Jewelry Design Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {JEWELRY_STYLES.map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setInteriorStyle(st)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      jewelryStyle === st
                        ? 'bg-purple-600/25 text-white border-purple-500/50 shadow-md'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Pieces Selection & Notes */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Step 3: Pieces Needed in Your Set</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">
                Select Pieces to Allocate Budget
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {JEWELRY_TYPES.map((type) => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-purple-600/20 text-white border-purple-500/50'
                          : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{type}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                          isChecked ? 'bg-purple-600 text-white' : 'border border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Outfit Description / Notes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-gray-300">
                Outfit Description or Specific Notes
              </label>
              <textarea
                rows={2}
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                placeholder="e.g. Deep V-neck velvet maroon blouse, floral organza dupatta, gold zardozi border"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Jewelry Budget Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
