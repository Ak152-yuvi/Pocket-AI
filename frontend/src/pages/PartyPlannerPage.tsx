import React, { useState } from 'react';
import {
  PartyPopper,
  Sparkles,
  Users,
  MapPin,
  Utensils,
  Music,
  Clock,
  Camera,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { PartyPlannerInput, PartyPlannerResponse } from '../types';
import { PlanResultView } from '../components/PlanResultView';
import { LoadingOverlay } from '../components/LoadingOverlay';

const EVENT_TYPES = [
  'Birthday',
  'Wedding',
  'Engagement',
  'Anniversary',
  'House Party',
  'Corporate Event',
  'College Event',
  'Cocktail Night'
];

const VENUE_TYPES = [
  'Home',
  'Banquet Hall',
  'Outdoor Lawn',
  'Restaurant',
  'Hotel Ballroom',
  'Rooftop'
];

const FOOD_PREFERENCES = [
  'Mixed Buffet',
  'Vegetarian',
  'Non-Vegetarian',
  'Appetizers & Finger Food',
  'Live Counter Barbecue',
  'Dessert & Mocktail Bar'
];

export const PartyPlannerPage: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState<number>(60000);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(50);
  const [eventType, setEventType] = useState<string>('Birthday');
  const [venueType, setVenueType] = useState<string>('Banquet Hall');
  const [foodPreference, setFoodPreference] = useState<string>('Mixed Buffet');
  const [decorationPreference, setDecorationPreference] = useState<string>('Themed balloon arch with neon LED quote sign and fairy lights');
  const [entertainmentPreference, setEntertainmentPreference] = useState<string>('Professional DJ, sound console, and party dance floor lights');
  const [eventDuration, setEventDuration] = useState<string>('4 Hours');
  const [additionalReq, setAdditionalReq] = useState<string>('Include customized 2-tier chocolate truffle cake and welcome punch');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<PartyPlannerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const estimatedPerPerson = Math.round(totalBudget / Math.max(1, numberOfGuests));

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (totalBudget < 500) {
      setErrorMsg('Please enter a total budget of at least ₹500.');
      return;
    }

    if (numberOfGuests < 1) {
      setErrorMsg('Please specify at least 1 guest.');
      return;
    }

    setIsGenerating(true);

    const payload: PartyPlannerInput = {
      total_budget: Number(totalBudget),
      number_of_guests: Number(numberOfGuests),
      event_type: eventType,
      venue_type: venueType,
      food_preference: foodPreference,
      decoration_preference: decorationPreference,
      entertainment_preference: entertainmentPreference,
      event_duration: eventDuration,
      additional_requirements: additionalReq,
    };

    try {
      const plan = await api.generatePartyPlan(payload);
      setGeneratedPlan(plan);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate event plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <LoadingOverlay isVisible={isGenerating} title="PocketSmart AI is Calculating Your Party Plan" />

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
          <PartyPopper className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Party & Event Budget Planner</h1>
          <p className="text-xs text-gray-400">
            Per-head catering calculations, venue booking, sound/lighting, and contingency management.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results View */}
      {generatedPlan ? (
        <div className="space-y-6">
          <PlanResultView
            plan={generatedPlan}
            onEdit={() => setGeneratedPlan(null)}
            onRegenerate={handleGenerate}
          />
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Section 1: Event Scope & Headcount */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-pink-400 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Step 1: Event Scope & Guest Metrics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Budget */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Total Event Budget (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[25000, 50000, 100000, 250000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTotalBudget(amt)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                        totalBudget === amt
                          ? 'bg-pink-600/30 text-pink-300 border-pink-500/50'
                          : 'bg-slate-800/60 text-gray-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Guests Count */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Number of Guests
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400">
                    <Users className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    required
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Target spend: <span className="text-pink-400 font-bold">~₹{estimatedPerPerson}</span>/guest
                </p>
              </div>

              {/* Event Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Event Duration
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    placeholder="e.g. 4 Hours / Evening"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Event Type Grid */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-gray-300">Occasion / Event Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EVENT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setEventType(type)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      eventType === type
                        ? 'bg-pink-600/25 text-white border-pink-500/50 shadow-md shadow-pink-600/10'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Venue & Culinary Setup */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Step 2: Venue & Dining Preference</span>
            </div>

            {/* Venue Types */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Select Venue Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {VENUE_TYPES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVenueType(v)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      venueType === v
                        ? 'bg-purple-600/25 text-white border-purple-500/50 shadow-md'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Preferences */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-gray-300">
                Catering & Dining Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FOOD_PREFERENCES.map((food) => (
                  <button
                    type="button"
                    key={food}
                    onClick={() => setFoodPreference(food)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                      foodPreference === food
                        ? 'bg-indigo-600/25 text-white border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/60 text-gray-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Decor, Entertainment & Special Touches */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-indigo-400 uppercase tracking-wider">
              <Music className="w-4 h-4" />
              <span>Step 3: Entertainment, Decor & Special Moments</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Decoration Preferences
                </label>
                <textarea
                  rows={2}
                  value={decorationPreference}
                  onChange={(e) => setDecorationPreference(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 leading-relaxed"
                  placeholder="e.g. Balloon arch, floral backdrop, neon quote sign"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Entertainment & Sound
                </label>
                <textarea
                  rows={2}
                  value={entertainmentPreference}
                  onChange={(e) => setEntertainmentPreference(e.target.value)}
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 leading-relaxed"
                  placeholder="e.g. DJ, live acoustic singer, karaoke setup"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-gray-300">
                Additional Requirements / Special Cake / Photography
              </label>
              <input
                type="text"
                value={additionalReq}
                onChange={(e) => setAdditionalReq(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                placeholder="e.g. Custom cake, drone video shots, return gift hampers"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Event Budget Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
