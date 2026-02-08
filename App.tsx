
import React, { useState, useEffect } from 'react';
import { Plant, AppView, PlantEntry } from './types';
import { Dashboard } from './components/Dashboard';
import { PlantDetail } from './components/PlantDetail';
import { AddEntryModal } from './components/AddEntryModal';
import { AddPlantModal } from './components/AddPlantModal';
import { QuickScanModal } from './components/QuickScanModal';
import { ChatWidget } from './components/ChatWidget';
import { getPlants, savePlant, addEntryToPlant } from './services/storageService';
import { analyzePlantHealth, fileToBase64 } from './services/geminiService';
import { Sprout, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  
  // Modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isProcessingEntry, setIsProcessingEntry] = useState(false);
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    setPlants(getPlants());
  }, []);

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlantId(plant.id);
    setView(AppView.PLANT_DETAIL);
  };

  const handleBackToDashboard = () => {
    setSelectedPlantId(null);
    setView(AppView.DASHBOARD);
    setPlants(getPlants()); // Refresh data
  };

  const handleCreatePlant = (plantData: any) => {
    const newPlant: Plant = {
      id: Date.now().toString(),
      ...plantData,
      createdAt: Date.now(),
      thoughtSignature: '',
      entries: []
    };
    
    savePlant(newPlant);
    setPlants(getPlants());
    setIsNewPlantModalOpen(false);
  };

  const handleAddEntry = async (imageFile: File, notes: string) => {
    if (!selectedPlantId) return;
    
    setIsProcessingEntry(true);
    try {
      const plant = plants.find(p => p.id === selectedPlantId);
      if (!plant) throw new Error("Plant not found");

      const imageBase64 = await fileToBase64(imageFile);
      
      // CALL GEMINI SERVICE - The Thinking Core
      const analysis = await analyzePlantHealth(
        imageBase64, 
        notes, 
        plant, 
        plant.entries
      );

      const newEntry: PlantEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: URL.createObjectURL(imageFile), 
        userNotes: notes,
        healthScore: analysis.healthScore,
        analysis: analysis
      };

      addEntryToPlant(plant.id, newEntry, analysis.updatedThoughtSignature);
      
      // Update local state to reflect changes immediately
      setPlants(getPlants());
      setIsEntryModalOpen(false);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsProcessingEntry(false);
    }
  };

  const selectedPlant = plants.find(p => p.id === selectedPlantId);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-emerald-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToDashboard}>
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-100">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tighter">PlantOps</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:block text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
               Gemini 3 Pro Core
             </span>
             <button 
              onClick={() => setIsQuickScanOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              title="Quick Audit"
             >
               <Sparkles className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-10">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            plants={plants} 
            onSelectPlant={handleSelectPlant} 
            onAddPlant={() => setIsNewPlantModalOpen(true)} 
            onQuickScan={() => setIsQuickScanOpen(true)}
          />
        )}
        
        {view === AppView.PLANT_DETAIL && selectedPlant && (
          <PlantDetail 
            plant={selectedPlant} 
            onBack={handleBackToDashboard}
            onAddEntry={() => setIsEntryModalOpen(true)}
          />
        )}
      </main>

      {/* Chat Widget */}
      <ChatWidget 
        currentPlant={selectedPlant} 
        allPlants={plants} 
      />

      {/* Modals */}
      <AddEntryModal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)} 
        onSubmit={handleAddEntry}
        isProcessing={isProcessingEntry}
      />

      <AddPlantModal 
        isOpen={isNewPlantModalOpen}
        onClose={() => setIsNewPlantModalOpen(false)}
        onSubmit={handleCreatePlant}
      />

      <QuickScanModal 
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
      />
    </div>
  );
}
