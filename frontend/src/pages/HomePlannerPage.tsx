import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Layers,
  Palette,
  Armchair,
  Lamp,
  Archive,
  Brush,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { HomePlannerInput, HomePlannerResponse } from '../types';
import { PlanResultView } from '../components/PlanResultView';
import { LoadingOverlay } from '../components/LoadingOverlay';

const AVAILABLE_ROOM_TYPES = [
  'Living Room',
  'Master Bedroom',
  'Kitchen',
  'Dining Room',
  'Study Room',
  'Guest Bedroom',
  'Bathroom',
  'Balcony'
];

const AVAILABLE_STYLES = [
  'Modern',
  'Minimal',
  'Luxury',
  'Scandinavian',
  'Contemporary',
  'Traditional',
  'Industrial'
];

const AVAILABLE_COLORS = [
  'Warm White',
  'Muted Beige',
  'Charcoal Grey',
  'Navy Blue',
  'Sage Green',
  'Terracotta',
  'Earthy Brown',
  'Gold Accents'
];

export const HomePlannerPage: React.FC = () => {
  // Form State
  const [totalBudget, setTotalBudget] = useState<number>(150000);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(3);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['Living Room', 'Master Bedroom', 'Kitchen']);
  const [interiorStyle, setInteriorStyle] = useState<string>('Modern');
  const [selectedColors, setSelectedColors] = useState<string[]>(['Warm White', 'Muted Beige']);

  const [furnitureReq, setFurnitureReq] = useState<string>('L-shape 3-seater sofa, queen bed with hydraulics, dining table for 4');
  const [lightingReq, setLightingReq] = useState<string>('Warm ambient LED false ceiling profiles, pendant light over dining table');
  const [storageReq, setStorageReq] = useState<string>('Floor to ceiling master wardrobe with sliding doors, shoe rack');
  const [decorReq, setDecorReq] = useState<string>('Geometric woven rug, blackout linen curtains, indoor planters');
  const [additionalReq, setAdditionalReq] = useState<string>('Prioritize scratch-resistant and durable materials for family with pets');

  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<HomePlannerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      if (selectedRooms.length > 1) {
        setSelectedRooms(selectedRooms.filter((r) => r !== room));
      }
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (totalBudget < 1000) {
      setErrorMsg('Please enter a realistic total budget of at least ₹1,000.');
      return;
    }

    if (selectedRooms.length === 0) {
      setErrorMsg('Please select at least one room.');
      return;
    }

    setIsGenerating(true);

    const payload: HomePlannerInput = {
      total_budget: Number(totalBudget),
      number_of_rooms: Number(numberOfRooms),
      room_types: selectedRooms,
      interior_style: interiorStyle,
      preferred_colors: selectedColors,
      furniture_requirements: furnitureReq,
      lighting_requirements: lightingReq,
      storage_requirements: storageReq,
      decoration_requirements: decorReq,
      additional_requirements: additionalReq,
    };

    try {
      const plan = await api.generateHomePlan(payload);
      setGeneratedPlan(plan);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate home interior plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <LoadingOverlay isVisible={isGenerating} title="PocketSmart AI is Designing Your Home Budget" />

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Home Interior Budget Planner</h1>
          <p className="text-xs text-gray-400">Intelligent room-by-room allocation, furniture breakdown, and decor optimization.</p>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* If Plan is Generated, Show PlanResultView */}
      {generatedPlan ? (
        <div className="space-y-6">
          <PlanResultView
            plan={generatedPlan}
            onEdit={() => setGeneratedPlan(null)}
            onRegenerate={handleGenerate}
          />
        </div>
      ) : (
        /* Multi-Section Form */
        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Section 1: Budget & Room Count */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Step 1: Budget & Space Scope</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Budget */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Total Interior Budget (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    required
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Quick select:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[50000, 100000, 200000, 500000, 1000000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTotalBudget(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        totalBudget === amt
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                          : 'bg-slate-800/60 text-gray-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Rooms */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-gray-300">
                    Number of Rooms: <span className="text-blue-400 font-bold">{numberOfRooms}</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numberOfRooms}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setNumberOfRooms(count);
                    // Automatically adjust selected rooms if fewer
                    if (selectedRooms.length > count) {
                      setSelectedRooms(selectedRooms.slice(0, count));
                    }
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>1 Room</span>
                  <span>5 Rooms</span>
                  <span>10 Rooms</span>
                </div>
              </div>
            </div>

            {/* Room Types Tag Selector */}
            <div className="space-y-2 pt-4 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-gray-300">
                Select Room Types Included in This Project
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROOM_TYPES.map((room) => {
                  const isSelected = selectedRooms.includes(room);
                  return (
                    <button
                      type="button"
                      key={room}
                      onClick={() => toggleRoom(room)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-blue-600/25 text-blue-300 border-blue-500/40 shadow-sm'
                          : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {room}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Aesthetics & Colors */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>Step 2: Aesthetic Style & Color Harmony</span>
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">
                Choose Interior Design Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_STYLES.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setInteriorStyle(style)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      interiorStyle === style
                        ? 'bg-purple-600/25 text-white border-purple-500/50 shadow-md shadow-purple-600/10'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-300">
                Preferred Color Tones
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col);
                  return (
                    <button
                      type="button"
                      key={col}
                      onClick={() => toggleColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-purple-600/25 text-purple-200 border-purple-500/40 shadow-sm'
                          : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {isSelected ? '● ' : '○ '}
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Category Requirements */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-pink-400 uppercase tracking-wider">
              <Armchair className="w-4 h-4" />
              <span>Step 3: Specific Room & Item Requirements</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Furniture */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Armchair className="w-3.5 h-3.5 text-blue-400" />
                  <span>Furniture Requirements</span>
                </label>
                <textarea
                  rows={2}
                  value={furnitureReq}
                  onChange={(e) => setFurnitureReq(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  placeholder="e.g. 3-seater sofa, queen bed, dining table"
                />
              </div>

              {/* Lighting */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Lamp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lighting Requirements</span>
                </label>
                <textarea
                  rows={2}
                  value={lightingReq}
                  onChange={(e) => setLightingReq(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  placeholder="e.g. Warm LED ambient lights, chandelier, track lights"
                />
              </div>

              {/* Storage */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Archive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Storage & Wardrobes</span>
                </label>
                <textarea
                  rows={2}
                  value={storageReq}
                  onChange={(e) => setStorageReq(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  placeholder="e.g. Sliding wardrobe, kitchen cabinets, bookshelves"
                />
              </div>

              {/* Decoration */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Brush className="w-3.5 h-3.5 text-pink-400" />
                  <span>Decoration & Soft Furnishings</span>
                </label>
                <textarea
                  rows={2}
                  value={decorReq}
                  onChange={(e) => setDecorReq(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  placeholder="e.g. Rugs, linen blackout drapes, wall mirrors"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-gray-300">
                Additional Preferences or Special Requirements
              </label>
              <input
                type="text"
                value={additionalReq}
                onChange={(e) => setAdditionalReq(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. Pet-friendly fabrics, child safety locks, eco-friendly finishes"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Home Interior Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
