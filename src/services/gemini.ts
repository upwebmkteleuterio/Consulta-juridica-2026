import { GoogleGenAI } from "@google/genai";
import { generateSystemInstruction } from "../constants";
import { Message, AdminSettings } from "../types";

// Tenta ler de todas as fontes possíveis no frontend
const GEMINI_KEY = 
  (import.meta.env.VITE_GEMINI_API_KEY) || 
  (process.env.GEMINI_API_KEY) || 
  (process.env.API_KEY) || 
  "";

export const getGeminiStreamResponse = async (history: Message[], prompt: string, settings: AdminSettings) => {
  if (!GEMINI_KEY) {
    throw new Error("API Key do Gemini não detectada no ambiente. Verifique seu arquivo .env");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  contents.push({ role: 'user', parts: [{ text: prompt }] });

  try {
    return await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: generateSystemInstruction(settings, history),
        temperature: 0.7,
      }
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = "audio/webm") => {
  if (!GEMINI_KEY) return null;
  
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: mimeType } },
          { text: "Transcreva este áudio jurídico exatamente como falado, sem comentários adicionais. Se não houver fala, retorne vazio." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Transcription Error:", error);
    return null;
  }
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};