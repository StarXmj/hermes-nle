// supabase/functions/add_knowledge/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { titre, contenu, categorie, source_url } = body
    if (!titre || !contenu) throw new Error("Le titre et le contenu sont obligatoires.")

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 🧠 VECTORISATION SÉCURISÉE
    console.log(`Vectorisation manuelle de : ${titre}...`);
    const embedResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${mistralApiKey}` 
      },
      body: JSON.stringify({ 
        model: 'mistral-embed', 
        input: [`Titre: ${titre}\nContenu: ${contenu}`] 
      })
    })

    const embedData = await embedResponse.json()

    // 🛡️ FILET DE SÉCURITÉ
    if (!embedResponse.ok || !embedData.data) {
      console.error("❌ ERREUR VECTEUR MISTRAL :", embedData);
      throw new Error(`Mistral Error: ${embedData.message || JSON.stringify(embedData)}`);
    }

    const embeddingVector = embedData.data[0].embedding

    // 💾 SAUVEGARDE SUPABASE
    const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!)
    const { error: dbError } = await supabaseAdmin
      .from('knowledge_base')
      .insert([{ titre, contenu, categorie, source_url, embedding: embeddingVector }])

    if (dbError) throw new Error(`Erreur SQL : ${dbError.message}`)

    console.log("✅ Ajout manuel réussi !");
    return new Response(
      JSON.stringify({ success: true, message: "Connaissance ajoutée avec succès !" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: `Plantage : ${error.message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } 
    )
  }
})