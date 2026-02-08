import React, { useState, useRef } from 'react';
import { X, Sprout, Camera, Loader2, Wand2 } from 'lucide-react';
import { identifyPlant, fileToBase64 } from '../services/geminiService';

interface PlantData {
  name: string;
  species: string;
  location: string;
  sunExposure: string;
  wateringFrequency: string;
  soilType: string;
}

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlantData) => void;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PlantData>({
    name: '',
    species: '',
    location: '',
    sunExposure: 'Indirect Light',
    wateringFrequency: 'Weekly',
    soilType: 'Standard Potting Mix'
  });
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setIsIdentifying(true);
      
      try {
        const base64 = await fileToBase64(file);
        const result = await identifyPlant(base64);
        
        setFormData(prev => ({
          ...prev,
          species: result.species,
          name: result.species, // Default name to species
          sunExposure: result.sunExposure,
          wateringFrequency: result.wateringFrequency,
          soilType: result.soilType
        }));
      } catch (err) {
        console.error("Failed to identify plant", err);
        alert("Could not identify plant. Please try again or enter details manually.");
      } finally {
        setIsIdentifying(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form defaults
    setFormData({
        name: '',
        species: '',
        location: '',
        sunExposure: 'Indirect Light',
        wateringFrequency: 'Weekly',
        soilType: 'Standard Potting Mix'
    });
    setPreviewImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Add New Plant</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* AI Auto-Detect Section */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${previewImage ? 'border-emerald-500 h-48' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50 p-6'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />
            
            {isIdentifying ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                 <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                 <p className="text-sm font-medium text-emerald-800">Identifying Species...</p>
                 <p className="text-xs text-slate-500">Gemini is looking at your plant</p>
               </div>
            ) : null}

            {previewImage ? (
               <img src={previewImage} alt="Plant Preview" className="w-full h-full object-cover" />
            ) : (
               <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h3 className="font-semibold text-slate-700 text-sm">Auto-detect from Photo</h3>
                 <p className="text-xs text-slate-500 mt-1">Upload a photo to automatically fill species and care details</p>
               </div>
            )}
            
            {previewImage && !isIdentifying && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> AI Identified
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plant Name</label>
            <input 
              required
              type="text" 
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Living Room Monstera"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Species</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Monstera Deliciosa"
              value={formData.species}
              onChange={e => setFormData({...formData, species: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Near Window"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sun Exposure</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                  value={formData.sunExposure}
                  onChange={e => setFormData({...formData, sunExposure: e.target.value})}
                >
                    <option>Direct Sun</option>
                    <option>Indirect Light</option>
                    <option>Low Light</option>
                    <option>Shade</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Watering</label>
                <select 
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                  value={formData.wateringFrequency}
                  onChange={e => setFormData({...formData, wateringFrequency: e.target.value})}
                >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isIdentifying}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
            >
                Add Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};