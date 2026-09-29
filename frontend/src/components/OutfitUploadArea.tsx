import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  Shirt,
  Gem
} from 'lucide-react';
import { OutfitAnalysisResponse } from '../types';
import { api } from '../services/api';

interface OutfitUploadAreaProps {
  onAnalysisComplete?: (analysis: OutfitAnalysisResponse) => void;
}

export const OutfitUploadArea: React.FC<OutfitUploadAreaProps> = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<OutfitAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    setAnalysisResult(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await api.analyzeOutfit(selectedFile);
      setAnalysisResult(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze outfit image. You can still proceed manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!previewUrl ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-purple-500/50 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-white">
            Drag & drop your outfit photo here, or <span className="text-purple-400 underline">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Supports JPG, JPEG, PNG, WEBP (Max 10MB)</p>
        </div>
      ) : (
        /* Image Preview and Analysis Trigger */
        <div className="glass-card rounded-2xl p-4 border border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                <img src={previewUrl} alt="Outfit Preview" className="w-full h-full object-cover" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{selectedFile?.name}</p>
                <p className="text-xs text-gray-400">
                  {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                </p>
                <span className="inline-block mt-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                  Ready for AI Vision
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={removeImage}
                disabled={isAnalyzing}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Analyzing with AI...' : 'Analyze Outfit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Result Box */}
      {analysisResult && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="font-bold text-sm text-white">Outfit Visual Analysis</h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                analysisResult.is_fallback
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {analysisResult.is_fallback ? 'Visual Fallback' : 'Gemini Vision AI'}
            </span>
          </div>

          {/* Extracted Color & Styling Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Primary Color</span>
              <p className="font-bold text-purple-300 mt-0.5">{analysisResult.primary_color}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Pattern / Fabric</span>
              <p className="font-bold text-white mt-0.5">{analysisResult.pattern}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Style Silhouette</span>
              <p className="font-bold text-white mt-0.5">{analysisResult.style}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Neckline / Cut</span>
              <p className="font-bold text-white mt-0.5">{analysisResult.neckline || 'Classic'}</p>
            </div>
          </div>

          {/* AI Suggested Pairings */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1">
              <Gem className="w-3 h-3" />
              <span>Recommended Jewelry Accents</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-200 pt-1">
              <div>
                <span className="text-gray-400">Necklace: </span>
                <span className="font-medium text-white">{analysisResult.suggested_necklace}</span>
              </div>
              <div>
                <span className="text-gray-400">Earrings: </span>
                <span className="font-medium text-white">{analysisResult.suggested_earrings}</span>
              </div>
              <div>
                <span className="text-gray-400">Bracelet: </span>
                <span className="font-medium text-white">{analysisResult.suggested_bracelet}</span>
              </div>
              <div>
                <span className="text-gray-400">Ring: </span>
                <span className="font-medium text-white">{analysisResult.suggested_ring}</span>
              </div>
            </div>
          </div>

          {/* Styling Rationale */}
          <p className="text-xs text-purple-200/90 italic leading-relaxed">
            "{analysisResult.explanation}"
          </p>
        </div>
      )}
    </div>
  );
};
