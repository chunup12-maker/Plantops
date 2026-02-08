
import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { Plant, PlantEntry, AnalysisResult, PlantIdentification, GroundingSource, QuickAnalysisResult, ChatMessage } from '../types';

// Helper to get base64 from blob/file
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      }
    };
    reader.onerror = error => reject(error);
  });
};

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * GARDEN ASSISTANT: Starts a contextual chat session with Gemini 3 Flash.
 * It provides advice based on the current plant or the whole garden.
 */
export const startGardenChat = (context: { currentPlant?: Plant, allPlants: Plant[] }) => {
  const ai = getAiClient();
  
  const gardenContext = context.allPlants.map(p => 
    `- ${p.name} (${p.species}): Located in ${p.location}, Health Score: ${p.entries[p.entries.length-1]?.healthScore || 'N/A'}`
  ).join('\n');

  const plantHistory = context.currentPlant ? context.currentPlant.entries.map(e => 
    `[${new Date(e.timestamp).toLocaleDateString()}] Health: ${e.healthScore}% - Notes: ${e.userNotes}`
  ).join('\n') : '';

  const systemInstruction = `
    You are the PlantOps Orchestrator Assistant. 
    Your goal is to clear doubts, provide growth optimization methods, and analyze health trajectories.
    
    Current Garden State:
    ${gardenContext}
    
    ${context.currentPlant ? `Currently focused on: ${context.currentPlant.name} (${context.currentPlant.species})
    Health Trajectory Data:
    ${plantHistory}` : ''}
    
    Instructions:
    1. If the user asks about health trajectory, look at the health scores over time and identify trends (improving, declining, or stable).
    2. Provide specific, actionable scientific advice for growth improvement.
    3. Use Google Search to ground your answers in the latest botanical research if needed.
    4. Keep responses helpful, professional, and concise.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });
};

/**
 * TURBO ANALYZER: Uses Gemini 3 Flash for near-instant botanical insights.
 */
export const quickPlantAnalysis = async (imageBase64: string): Promise<QuickAnalysisResult> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: "Rapid Audit: ID plant, health status, and 3 key care tips. Be concise and professional." }
      ]
    },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          healthStatus: { type: Type.STRING },
          urgentCare: { type: Type.STRING },
          longTermAdvice: { type: Type.STRING },
          scientificInsight: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ['species', 'healthStatus', 'urgentCare', 'longTermAdvice', 'scientificInsight', 'confidenceScore']
      }
    }
  });

  if (response.text) {
    const result = JSON.parse(response.text) as QuickAnalysisResult;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.sources = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web!.title,
          uri: chunk.web!.uri
        }));
    }
    return result;
  }
  throw new Error("Quick analysis failed");
};

/**
 * CORE ORCHESTRATOR: Analyzes plant health using Gemini 3 Pro with Thinking.
 */
export const analyzePlantHealth = async (
  currentImageBase64: string,
  userNotes: string,
  plant: Plant,
  previousEntries: PlantEntry[]
): Promise<AnalysisResult> => {
  const ai = getAiClient();

  const historyContext = previousEntries
    .slice(-3)
    .map(e => `Date: ${new Date(e.timestamp).toLocaleDateString()}, Health: ${e.healthScore}, Notes: ${e.userNotes}`)
    .join('\n');

  const systemInstruction = `
    You are PlantOps Orchestrator. Analyze plant health using 5-Level Deep Reasoning.
    Plant: ${plant.species}
    Environment: ${plant.location}, Sun: ${plant.sunExposure}
    Memory: "${plant.thoughtSignature || "Fresh start."}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: currentImageBase64 } },
        { text: `User Observation: ${userNotes}\nRun full 5-level orchestrator analysis.` }
      ]
    },
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 16384 },
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          level1_observation: { type: Type.STRING },
          level2_hypothesis: { type: Type.STRING },
          level3_plan: { type: Type.STRING },
          level4_verification: { type: Type.STRING },
          level5_comparative_analysis: { type: Type.STRING },
          optimization_tips: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
          updatedThoughtSignature: { type: Type.STRING },
          healthScore: { type: Type.NUMBER },
          care_summary: { type: Type.STRING }
        },
        required: [
          'level1_observation', 'level2_hypothesis', 'level3_plan', 
          'level4_verification', 'level5_comparative_analysis', 
          'optimization_tips', 'updatedThoughtSignature', 'healthScore', 'care_summary'
        ]
      }
    }
  });

  if (response.text) {
    const result = JSON.parse(response.text) as AnalysisResult;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      result.sources = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web!.title,
          uri: chunk.web!.uri
        }));
    }
    return result;
  }
  throw new Error("Failed to generate analysis");
};

export const identifyPlant = async (imageBase64: string): Promise<PlantIdentification> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: "Identify this plant species and suggest settings." }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          sunExposure: { type: Type.STRING },
          wateringFrequency: { type: Type.STRING },
          soilType: { type: Type.STRING },
          care_tip: { type: Type.STRING }
        },
        required: ['species', 'sunExposure', 'wateringFrequency', 'soilType', 'care_tip']
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as PlantIdentification;
  }
  throw new Error("Failed to identify plant");
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
        { text: "Transcribe audio." }
      ]
    }
  });
  return response.text || "";
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  return await audioContext.decodeAudioData(bytes.buffer);
};

export const getQuickTip = async (species: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `One short care tip for ${species}. Max 15 words.`,
  });
  return response.text || "";
};
