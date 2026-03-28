
import { GoogleGenAI } from "@google/genai";
import { generateSystemInstruction } from "../constants";
import { Message, AdminSettings } from "../types";

export const getGeminiStreamResponse = async (history: Message[], prompt: string, settings: AdminSettings) => {
  // Instancia o cliente diretamente com a chave de ambiente conforme diretrizes
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

export const summarizeConversation = async (history: Message[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyText = history.map(m => `${m.role === 'user' ? 'Cliente' : 'IA'}: ${m.content}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{ 
          text: `Resuma a seguinte conversa jurídica em no máximo 3 parágrafos curtos para que um advogado possa entender o caso rapidamente:\n\n${historyText}` 
        }]
      }]
    });
    return response.text || "Resumo não disponível.";
  } catch (error) {
    console.error("Summary Error:", error);
    return "Houve um erro ao gerar o resumo da conversa.";
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = "audio/webm") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
