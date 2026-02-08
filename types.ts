
export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  sunExposure: string;
  wateringFrequency: string;
  soilType: string;
  createdAt: number;
  // The "Thought Signature" - long term memory of the plant's state quirks
  thoughtSignature: string; 
  entries: PlantEntry[];
}

export interface PlantEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  userNotes: string; // Transcribed or typed
  healthScore: number; // 0-100
  
  // The structured output from Gemini's Thinking Process
  analysis: AnalysisResult;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  level1_observation: string;
  level2_hypothesis: string;
  level3_plan: string;
  level4_verification: string;
  level5_comparative_analysis: string;
  optimization_tips: string[];
  updatedThoughtSignature: string;
  healthScore: number;
  care_summary: string;
  sources?: GroundingSource[];
}

export interface QuickAnalysisResult {
  species: string;
  healthStatus: string;
  urgentCare: string;
  longTermAdvice: string;
  scientificInsight: string;
  confidenceScore: number;
  sources?: GroundingSource[];
}

export interface PlantIdentification {
  species: string;
  sunExposure: string;
  wateringFrequency: string;
  soilType: string;
  care_tip: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PLANT_DETAIL = 'PLANT_DETAIL',
}
