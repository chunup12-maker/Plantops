
import React, { useEffect, useState } from 'react';
import { Plant, AppView } from '../types';
import { Leaf, Plus, MoreVertical, ArrowRight, Sparkles } from 'lucide-react';
import { getQuickTip } from '../services/geminiService';

interface DashboardProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onAddPlant: () => void;
  onQuickScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ plants, onSelectPlant, onAddPlant, onQuickScan }) => {
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    // Fetch a random tip using Gemini Flash Lite on mount
    const fetchTip = async () => {
      try {
        const t = await getQuickTip('Houseplant');
        setTip(t);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTip();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Garden</h1>
          <p className="text-slate-500 mt-1">Orchestrating care for {plants.length} botanical units</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onQuickScan}
            className="bg-white border-2 border-emerald-100 text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-50 transition-all group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Quick Audit
          </button>
          <button 
            onClick={onAddPlant}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Plant
          </button>
        </div>
      </header>

      {/* AI Insight Card */}
      {tip && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Leaf className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
               <Sparkles className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-black text-lg mb-1 flex items-center gap-2 uppercase tracking-tighter">
                Orchestrator Directive
              </h3>
              <p className="text-indigo-100 max-w-2xl leading-relaxed font-medium">"{tip}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-10 h-10 text-emerald-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Your Garden is Empty</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Initialize your botanical network or run a Quick Audit for immediate insight.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plants.map(plant => {
             const lastEntry = plant.entries.length > 0 ? plant.entries[plant.entries.length - 1] : null;
             const statusColor = lastEntry 
                ? (lastEntry.healthScore > 80 ? 'bg-green-500 shadow-green-200' : lastEntry.healthScore > 50 ? 'bg-yellow-500 shadow-yellow-200' : 'bg-red-500 shadow-red-200')
                : 'bg-slate-300';

             return (
              <div 
                key={plant.id}
                onClick={() => onSelectPlant(plant)}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group border-b-4 border-b-slate-100 hover:border-b-emerald-500"
              >
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  {lastEntry ? (
                    <img src={lastEntry.imageUrl} alt={plant.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Leaf className="w-16 h-16 opacity-10" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm flex items-center gap-2 uppercase tracking-widest text-slate-700">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-lg`} />
                    {lastEntry ? `${lastEntry.healthScore}% Vitality` : 'Off-Grid'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{plant.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plant.species}</p>
                    </div>
                    <div className="p-2 rounded-full bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-all" />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">{plant.location}</span>
                    <span>{lastEntry ? new Date(lastEntry.timestamp).toLocaleDateString() : 'New Connection'}</span>
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
};
