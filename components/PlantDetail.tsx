
import React, { useState } from 'react';
import { Plant, PlantEntry } from '../types';
import { ArrowLeft, Plus, Play, Calendar, Droplets, Sun, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { TrendChart } from './TrendChart';
import { ThinkingProcess } from './ThinkingProcess';
import { generateSpeech } from '../services/geminiService';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onAddEntry: () => void;
}

export const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onBack, onAddEntry }) => {
  const [selectedEntry, setSelectedEntry] = useState<PlantEntry | null>(
    plant.entries.length > 0 ? plant.entries[plant.entries.length - 1] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioBuffer = await generateSpeech(text);
      if (audioBuffer) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("TTS Error", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{plant.name}</h1>
          <p className="text-slate-500 text-sm">{plant.species} • {plant.location}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={onAddEntry}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Metadata & Memory */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Orchestrator Context</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{plant.sunExposure}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{plant.wateringFrequency}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{plant.location}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
               <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-1.5">
                 <Sparkles className="w-3 h-3" /> Local Biological Memory
               </h4>
               <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                 "{plant.thoughtSignature || 'Building autonomous patterns...'}"
               </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Observation Stream</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {plant.entries.slice().reverse().map((entry) => (
                <div 
                  key={entry.id} 
                  onClick={() => setSelectedEntry(entry)}
                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedEntry?.id === entry.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                >
                  <img src={entry.imageUrl} alt="entry" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{new Date(entry.timestamp).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${entry.healthScore > 80 ? 'bg-green-500' : entry.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${entry.healthScore}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{entry.healthScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {plant.entries.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No data streams yet.</p>}
            </div>
          </div>
        </div>

        {/* Middle/Right Col: Detailed Analysis & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Health Trajectory
                </h3>
             </div>
             <TrendChart entries={plant.entries} />
          </div>

          {selectedEntry ? (
            <div className="space-y-6">
              {/* Optimization Section */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-300" /> 
                    Growth Optimization Engine
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEntry.analysis.optimization_tips.map((tip, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/10 flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-indigo-50 leading-snug">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                   <div className="md:w-1/3 bg-slate-100 min-h-[240px] relative">
                      <img src={selectedEntry.imageUrl} alt="Scan" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        Live Frame Scan
                      </div>
                   </div>
                   <div className="p-6 md:w-2/3">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-tight">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(selectedEntry.timestamp).toLocaleString()}
                          </p>
                          <h2 className="text-xl font-bold text-slate-900 mt-1">Care Orchestration</h2>
                        </div>
                        <button 
                          onClick={() => handleSpeak(selectedEntry.analysis.care_summary)}
                          disabled={isPlaying}
                          className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                        >
                           {isPlaying ? <span className="animate-pulse px-1">•••</span> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                      </div>
                      
                      <p className="text-slate-700 leading-relaxed text-sm mb-4">
                        {selectedEntry.analysis.care_summary}
                      </p>

                      {selectedEntry.userNotes && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Human Notes</p>
                          <p className="text-sm text-slate-600 italic">"{selectedEntry.userNotes}"</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
              
              <ThinkingProcess analysis={selectedEntry.analysis} loading={false} />
            </div>
          ) : (
             <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-16 text-center">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Select a scan to view the orchestrator's growth strategy.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
