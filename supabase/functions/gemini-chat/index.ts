import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { history, prompt, settings, action, audio, mimeType } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error("Configuração ausente: GEMINI_API_KEY não encontrada.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // UTILIZANDO O MODELO MAIS RECENTE: GEMINI 3 FLASH PREVIEW
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: settings?.systemInstruction 
    })

    if (action === 'transcribe') {
      const result = await model.generateContent([
        { inlineData: { data: audio, mimeType: mimeType } },
        { text: "Transcreva este áudio jurídico exatamente como falado." }
      ])
      return new Response(JSON.stringify({ text: result.response.text() }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Configuração de geração otimizada para Gemini 3
    const result = await model.generateContentStream({
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0, // Recomendado 1.0 para Gemini 3
        topP: 0.95,
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
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})