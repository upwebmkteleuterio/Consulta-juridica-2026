import { generateSystemInstruction } from "../constants";
import { Message, AdminSettings } from "../types";

const FUNCTION_URL = "https://roqhysljzhzcsyuiumpw.supabase.co/functions/v1/gemini-chat";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWh5c2xqemh6Y3N5dWl1bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzE3NzgsImV4cCI6MjA4NTkwNzc3OH0.AyFrLp0tQq0w8tQC-zLselO_UomIZYAbEBQqCGSq9y0";

export const getGeminiStreamResponse = async (history: Message[], prompt: string, settings: AdminSettings) => {
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`
    },
    body: JSON.stringify({
      history: formattedHistory,
      prompt,
      settings: {
        ...settings,
        systemInstruction: generateSystemInstruction(settings, history)
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro na conexão com Gemini 3.");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream não suportado.");

  return (async function* () {
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield { text: decoder.decode(value) };
    }
  })();
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = "audio/webm") => {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'transcribe',
        audio: base64Audio,
        mimeType: mimeType
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.text;
  } catch (error) {
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