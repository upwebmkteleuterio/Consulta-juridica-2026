import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const event = payload.event
    const data = payload.data
    const customerEmail = data.customer?.email?.toLowerCase().trim()
    const productId = data.product?.id

    if (!customerEmail) return new Response('Email missing', { status: 400 })

    const { data: userData } = await supabaseClient.auth.admin.listUsers()
    const user = userData.users.find(u => u.email?.toLowerCase() === customerEmail)

    if (!user) return new Response(JSON.stringify({ message: 'User not found' }), { status: 200 })

    const userId = user.id

    if (['purchase_approved', 'subscription_created', 'subscription_renewed'].includes(event)) {
      const { data: plan } = await supabaseClient
        .from('plans')
        .select('id, name, monthly_limit, price')
        .eq('product_id', productId)
        .single()
      
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('total_purchased_credits')
        .eq('id', userId)
        .single()

      const currentPurchased = profile?.total_purchased_credits || 0
      const planCredits = plan?.monthly_limit || 0
      const newPurchased = currentPurchased + planCredits

      // 1. Atualiza Perfil adicionando os créditos de forma acumulativa (Recarga)
      await supabaseClient.from('profiles').update({
        plan_id: plan?.id || null,
        subscription_status: 'pro',
        total_purchased_credits: newPurchased,
        monthly_limit_snapshot: newPurchased, // Mantém compatibilidade com lógicas legadas
        last_payment_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', userId)

      // 2. Registra no Histórico (Orders)
      await supabaseClient.from('orders').insert({
        user_id: userId,
        amount: plan?.price || '---',
        status: 'approved',
        plan_name: plan?.name || 'Recarga de Créditos',
        event_type: event
      });

      console.log(`[cakto-webhook] Recarga de ${planCredits} créditos aprovada para ${customerEmail}. Novo saldo de créditos comprados: ${newPurchased}`);
    } 
    else if (['refund'].includes(event)) {
      // Se houver reembolso, remove os créditos comprados para evitar fraudes
      const { data: plan } = await supabaseClient
        .from('plans')
        .select('monthly_limit')
        .eq('product_id', productId)
        .single()
      
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('total_purchased_credits')
        .eq('id', userId)
        .single()
      
      const planCredits = plan?.monthly_limit || 0
      const currentPurchased = profile?.total_purchased_credits || 0
      const newPurchased = Math.max(0, currentPurchased - planCredits)

      await supabaseClient.from('profiles').update({
        plan_id: null,
        subscription_status: 'free',
        total_purchased_credits: newPurchased,
        monthly_limit_snapshot: newPurchased,
        updated_at: new Date().toISOString()
      }).eq('id', userId)

      console.log(`[cakto-webhook] Reembolso processado para ${customerEmail}. Créditos reduzidos de ${currentPurchased} para ${newPurchased}.`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})