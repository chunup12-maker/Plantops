import React, { useState, useRef } from 'react';
import { Mic, Upload, X, Loader2, Volume2, StopCircle } from 'lucide-react';
import { fileToBase64, transcribeAudio } from '../services/geminiService';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (image: File, notes: string) => Promise<void>;
  isProcessing: boolean;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const text = await transcribeAudio(base64Audio);
        setNotes(prev => (prev ? prev + ' ' + text : text));
        setIsTranscribing(false);
      };
    } catch (e) {
      console.error("Transcription failed", e);
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    await onSubmit(imageFile, notes);
    // Cleanup
    setImageFile(null);
    setPreviewUrl(null);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">New Observation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Plant Photo</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${previewUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-600">Click to upload image</p>
                </>
              )}
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          {/* Notes & Audio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">Observations</label>
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <StopCircle className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? 'Stop Recording' : 'Voice Note'}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any changes (e.g. drooping, yellow spots)..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px]"
              />
              {isTranscribing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing with Gemini Flash...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imageFile || isProcessing || isTranscribing}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Orchestrating...
              </>
            ) : (
              'Analyze Plant'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};