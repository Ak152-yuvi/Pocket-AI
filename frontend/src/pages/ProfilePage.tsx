import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Settings,
  Coins,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('₹');
  const [preferredStyle, setPreferredStyle] = useState('Modern');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProfile();
        setProfile(data);
        setName(data.name);
        setPreferredCurrency(data.preferred_currency || '₹');
        setPreferredStyle(data.preferred_style || 'Modern');
        setPreferredLanguage(data.preferred_language || 'English');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to fetch user profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await api.updateProfile({
        name,
        preferred_currency: preferredCurrency,
        preferred_style: preferredStyle,
        preferred_language: preferredLanguage,
      });
      setProfile(updated);
      setSuccessMsg('Your preferences have been saved successfully.');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Account & Personal Preferences</h1>
          <p className="text-xs text-gray-400">Configure your default currencies, aesthetic style, and assistant personalization.</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading your profile...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-400" />
              <span>Identity & Account Info</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-400">
                  Email Address (Primary Login)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Member Since info */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Account created on{' '}
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>

          {/* Assistant Defaults & Preferences */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>AI Assistant Personalization</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Preferred Currency */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Default Currency</span>
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                  <option value="AED">AED (Emirati Dirham)</option>
                </select>
              </div>

              {/* Preferred Style */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  <span>Aesthetic Style Bias</span>
                </label>
                <select
                  value={preferredStyle}
                  onChange={(e) => setPreferredStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Modern">Modern Minimalist</option>
                  <option value="Luxury">Luxury Glamour</option>
                  <option value="Scandinavian">Scandinavian Clean</option>
                  <option value="Traditional">Royal Traditional</option>
                  <option value="Contemporary">Contemporary Bold</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Language</span>
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Spanish">Spanish (Español)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
