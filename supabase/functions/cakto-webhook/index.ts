import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Resposta para preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const event = payload.event
    const data = payload.data
    const customerEmail = data.customer?.email
    const productId = data.product?.id

    console.log(`[cakto-webhook] Recebido evento: ${event} para o email: ${customerEmail}`)

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Email não encontrado no payload' }), { status: 400, headers: corsHeaders })
    }

    // Busca o perfil do usuário pelo email
    // Nota: Como o Supabase Auth não permite busca direta por email facilmente na tabela profiles sem join,
    // idealmente o Webhook deve buscar na tabela auth.users primeiro ou garantir que o email esteja no profile.
    // Para simplificar, vamos buscar o user_id na tabela auth.users (via service_role)
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers()
    const user = userData.users.find(u => u.email === customerEmail)

    if (!user) {
      console.warn(`[cakto-webhook] Usuário ${customerEmail} não encontrado no sistema.`)
      return new Response(JSON.stringify({ message: 'Usuário não cadastrado ainda' }), { status: 200, headers: corsHeaders })
    }

    const userId = user.id

    // Lógica por tipo de evento
    if (event === 'purchase_approved' || event === 'subscription_created' || event === 'subscription_renewed') {
      // 1. Busca o plano correspondente ao product_id da Cakto
      const { data: plan } = await supabaseClient.from('plans').select('id').eq('product_id', productId).single()
      
      // 2. Atualiza o perfil: plano pro, reseta créditos e data de pagamento
      await supabaseClient.from('profiles').update({
        plan_id: plan?.id || null,
        subscription_status: 'pro',
        credits_used: 0,
        last_payment_at: new Date().toISOString()
      }).eq('id', userId)

      console.log(`[cakto-webhook] Usuário ${customerEmail} ATUALIZADO para PRO.`)
    } 
    
    else if (event === 'subscription_canceled' || event === 'subscription_renewal_refused' || event === 'refund') {
      // Rebaixa para free
      await supabaseClient.from('profiles').update({
        plan_id: null,
        subscription_status: 'free',
        // Não resetamos créditos aqui para o usuário não ganhar créditos "de graça" ao cancelar
      }).eq('id', userId)

      console.log(`[cakto-webhook] Usuário ${customerEmail} REBAIXADO para FREE.`)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error(`[cakto-webhook] Erro crítico:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})