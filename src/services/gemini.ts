import { generateSystemInstruction } from "../constants";
import { Message, AdminSettings } from "../types";

// Armazenamento global de logs para o Inspetor
(window as any).__GEMINI_DEBUG_LOGS = {
  lastRequest: null,
  lastResponse: null,
  lastError: null,
  env: {
    url: "https://roqhysljzhzcsyuiumpw.supabase.co/functions/v1/gemini-chat",
    hasKey: true
  }
};

const FUNCTION_URL = "https://roqhysljzhzcsyuiumpw.supabase.co/functions/v1/gemini-chat";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWh5c2xqemh6Y3N5dWl1bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzE3NzgsImV4cCI6MjA4NTkwNzc3OH0.AyFrLp0tQq0w8tQC-zLselO_UomIZYAbEBQqCGSq9y0";

export const getGeminiStreamResponse = async (history: Message[], prompt: string, settings: AdminSettings) => {
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    history: formattedHistory,
    prompt,
    settings: {
      ...settings,
      systemInstruction: generateSystemInstruction(settings, history)
    }
  };

  (window as any).__GEMINI_DEBUG_LOGS.lastRequest = payload;

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      (window as any).__GEMINI_DEBUG_LOGS.lastError = errorData;
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Stream não suportado pelo navegador.");

    return (async function* () {
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Acumula o chunk no buffer e decodifica
        buffer += decoder.decode(value, { stream: true });
        
        // Divide o buffer por linhas (padrão SSE separa eventos por \n\n ou \n)
        const lines = buffer.split('\n');
        
        // Mantém a última linha no buffer caso esteja incompleta
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          
          // Ignora linhas vazias ou que não começam com "data: "
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          try {
            // Remove o prefixo "data: " e tenta parsear o JSON
            const jsonStr = trimmed.replace('data: ', '');
            const data = JSON.parse(jsonStr);
            
            // Extrai o texto conforme a estrutura do Gemini 3
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
              (window as any).__GEMINI_DEBUG_LOGS.lastResponse = text;
              yield { text };
            }
          } catch (e) {
            // Se o JSON estiver incompleto em um chunk, ele será processado no próximo
            continue;
          }
        }
      }
    })();
  } catch (err: any) {
    (window as any).__GEMINI_DEBUG_LOGS.lastError = {
      message: err.message,
      stack: err.stack,
      type: "Network/Runtime Error"
    };
    throw err;
  }
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