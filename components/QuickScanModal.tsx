
import React, { useState, useRef } from 'react';
import { X, Camera, Loader2, Sparkles, CheckCircle, ExternalLink, Activity, Zap } from 'lucide-react';
import { fileToBase64, quickPlantAnalysis } from '../services/geminiService';
import { QuickAnalysisResult } from '../types';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<QuickAnalysisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setIsProcessing(true);
      
      try {
        const base64 = await fileToBase64(file);
        const analysis = await quickPlantAnalysis(base64);
        setResult(analysis);
      } catch (err) {
        console.error(err);
        alert("Quick analysis failed. Please try a clearer photo.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setPreviewImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-emerald-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Turbo Growth Audit</h2>
              <p className="text-xs text-emerald-600 font-medium">Flash-Speed Botanical Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {!previewImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-emerald-100 rounded-3xl p-12 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Instant Analysis</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Powered by Gemini 3 Flash for zero-wait botanical insights.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-square relative">
                    <img src={previewImage} alt="Plant" className="w-full h-full object-cover" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="font-bold tracking-widest text-sm animate-pulse uppercase">Flash Audit Active...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                  {result ? (
                    <div className="animate-in slide-in-from-right duration-500">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded uppercase tracking-widest">Detected Species</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4">{result.species}</h3>
                      
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Health Status</p>
                           <p className="text-sm font-semibold text-slate-700">{result.healthStatus}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                           <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Urgent Advice</p>
                           <p className="text-sm font-medium text-amber-800 leading-snug">{result.urgentCare}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8">
                       <p className="text-slate-400 italic text-center text-sm">Turbo core processing...</p>
                    </div>
                  )}
                </div>
              </div>

              {result && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-700">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Scientific Insight</h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      {result.scientificInsight}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Long-Term Growth Strategy</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.longTermAdvice}
                    </p>
                  </div>
                  
                  {result.sources && result.sources.length > 0 && (
                    <div className="pt-2">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Research Grounding</h4>
                       <div className="flex flex-wrap gap-2">
                          {result.sources.map((s, i) => (
                            <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full text-slate-600 transition-all font-medium">
                              <ExternalLink className="w-2.5 h-2.5" />
                              {s.title}
                            </a>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={handleReset}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                    >
                      New Audit
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
