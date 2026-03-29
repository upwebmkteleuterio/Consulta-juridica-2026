import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { history, prompt, settings, action, audio, mimeType } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no Supabase.")

    // Endpoint v1beta para modelos Gemini 3 Preview
    const API_VERSION = "v1beta";
    const MODEL = "gemini-3-flash-preview";
    const BASE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL}`;

    // Ação de Transcrição
    if (action === 'transcribe') {
      const response = await fetch(`${BASE_URL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { data: audio, mimeType: mimeType } },
              { text: "Transcreva este áudio jurídico exatamente como falado." }
            ]
          }]
        })
      });
      const data = await response.json();
      return new Response(JSON.stringify({ text: data.candidates?.[0]?.content?.parts?.[0]?.text }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Chat com Streaming
    const response = await fetch(`${BASE_URL}:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: settings?.systemInstruction }] },
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0, // Recomendado para Gemini 3
          topP: 0.95,
          topK: 40,
          thinkingConfig: {
            include_thoughts: false // Mantemos apenas a resposta final por enquanto
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Erro Google API: ${response.status}`);
    }

    // Repassa o stream para o frontend
    return new Response(response.body, { 
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } 
    });

  } catch (error) {
    console.error(`[gemini-chat] Erro: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})