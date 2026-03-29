import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { history, prompt, settings, action, audio, mimeType } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error("Configuração ausente: GEMINI_API_KEY não encontrada nos Secrets do Supabase.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Mantendo a versão mais recente e performática (1.5 Flash)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: settings?.systemInstruction 
    })

    // Caso de transcrição de áudio
    if (action === 'transcribe') {
      const result = await model.generateContent([
        { inlineData: { data: audio, mimeType: mimeType } },
        { text: "Transcreva este áudio jurídico exatamente como falado, sem comentários adicionais. Se não houver fala, retorne vazio." }
      ])
      return new Response(JSON.stringify({ text: result.response.text() }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Fluxo de Chat com Streaming
    const result = await model.generateContentStream({
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          if (chunkText) {
            controller.enqueue(encoder.encode(chunkText))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' } 
    })

  } catch (error) {
    console.error("[gemini-chat] Erro:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})