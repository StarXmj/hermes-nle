// supabase/functions/sync_to_ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🧠 LOGIQUE "SUBSTANCE PURE" : On ne prend que ce qui est utile à l'IA
// 🧠 LOGIQUE "SUBSTANCE PURE" AVEC GESTION DES LIENS
function extraireInfos(table: string, record: any) {
  if (!record) return null;
  let titre = ""; let contenu = ""; let source_url = "";
  const aujourdhui = new Date();

  // 🕰️ Marquage temporel
  const dateDoc = record.dateISO ? new Date(record.dateISO) : (record.date_publication ? new Date(record.date_publication) : null);
  const isPasse = dateDoc && dateDoc < aujourdhui;
  const prefix = isPasse ? "[ARCHIVE PASSÉE] " : "";

  if (table === 'membres') {
    const nomComplet = [record.prenom, record.nom].filter(Boolean).join(' ').trim() || 'Membre de l\'asso';
    let roles = 'Membre de l\'association';
    if (record.role && typeof record.role === 'string' && record.role.trim() !== '') {
      roles = record.role.replace(/:/g, ' du pôle ');
    } else if (record.equipes && Array.isArray(record.equipes) && record.equipes.length > 0) {
      const equipesClean = record.equipes.map((e: string) => e.replace(/:/g, ' ')).join(', ');
      roles = `Membre (Pôle(s) : ${equipesClean})`;
    } else if (record.equipe && typeof record.equipe === 'string' && record.equipe.trim() !== '') {
      roles = `Membre du pôle ${record.equipe.replace(/:/g, ' ')}`;
    }
    const bioTexte = (record.bio && record.bio.trim() !== '') ? ` Bio : ${record.bio.trim()}` : '';

    titre = `Membre Hermès : ${nomComplet}`;
    contenu = `${nomComplet} fait partie de l'association. Son rôle : ${roles}.${bioTexte}`;
    source_url = "/about"; // Pas de lien spécifique pour les membres
    
  } else if (table === 'actions' || table === 'evenements') {
    titre = `${prefix}Événement : ${record.titre || record.nom || 'Sans nom'}`;
    // 🔗 Récupération du lien d'inscription/programme
    const lien = record.lienProgramme || record.lienLieu || "";
    const phraseLien = lien ? ` Lien d'inscription ou d'information : ${lien}.` : "";
    
    contenu = `L'événement "${record.titre || record.nom || 'Sans nom'}" aura lieu à ${record.lieu || 'Lieu à définir'}. Description : ${record.description || 'Pas de description'}. Date : ${record.infoDate || record.date || 'À définir'}.${phraseLien}`;
    source_url = lien || "/actions"; // Si on a un lien, on l'utilise comme source principale
    
  } else if (table === 'actus' || table === 'actu') {
    titre = `${prefix}Actualité : ${record.titre || 'News'}`;
    const lien = record.lien || "";
    const phraseLien = lien ? ` Lien pour en savoir plus : ${lien}.` : "";
    
    contenu = `News (${record.categorie || 'Général'}) : ${record.description || record.contenu || ''}.${phraseLien}`;
    source_url = lien || "/actualites";
    
  } else if (table === 'articles' || table === 'publications') {
    titre = `${prefix}Publication / Article : ${record.titre || 'Document'}`;
    const lien = record.fichier_url || "";
    const phraseLien = lien ? ` Lien du document/PDF : ${lien}.` : "";
    
    contenu = `Résumé : ${record.resume || ''}. Contenu complet : ${record.contenu || record.description || ''}.${phraseLien}`;
    source_url = lien || (table === 'articles' ? "/blog" : "/publication");
    
  } else if (table === 'partenaires') {
    titre = `Partenaire : ${record.nom || 'Inconnu'}`;
    const lien = record.lienSite || record.lienAdresse || "";
    const phraseLien = lien ? ` Site web du partenaire : ${lien}.` : "";
    
    contenu = `Nous sommes partenaires avec ${record.nom || 'Inconnu'}. Description : ${record.description || ''}. Histoire : ${record.histoire || ''}.${phraseLien}`;
    source_url = lien || "/partenaires";
    
  } else {
    return null;
  }
  return { titre, contenu, source_url, originalData: record };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    const { type, table, record, old_record } = payload;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!)

    // 🧽 ÉTAPE 1 : LA GOMME (Nettoyer l'ancienne version)
    if (type === 'UPDATE' || type === 'DELETE') {
      const oldInfo = extraireInfos(table, old_record);
      if (oldInfo) {
        console.log(`🧽 Nettoyage de l'ancienne version : ${oldInfo.titre}`);
        if (table === 'membres') {
          await supabaseAdmin.from('knowledge_base').delete().eq('categorie', 'membres').ilike('titre', `%${oldInfo.titre}%`);
        } else {
          await supabaseAdmin.from('knowledge_base').delete().ilike('titre', `%${oldInfo.titre}%`);
        }
      }
    }

    // 🛑 ÉTAPE 2 : LA DOUANE 
    if (type === 'DELETE') {
      return new Response(JSON.stringify({ success: true, message: "Suppression confirmée" }), { status: 200, headers: corsHeaders })
    }

    if (record && record.status && record.status.toLowerCase() === 'brouillon') {
      console.log("🛑 Brouillon détecté : On l'ignore.");
      return new Response(JSON.stringify({ success: true, message: "Brouillon ignoré" }), { status: 200, headers: corsHeaders })
    }

    // ✍️ ÉTAPE 3 : LE STYLO
    const newInfo = extraireInfos(table, record);
    if (!newInfo) return new Response("Table non gérée", { status: 200, headers: corsHeaders });

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY')
    console.log(`🚀 Vectorisation en cours : ${newInfo.titre}...`);
    
    const embedResponse = await fetch('https://api.mistral.ai/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mistralApiKey}` },
      body: JSON.stringify({ model: 'mistral-embed', input: [`Titre: ${newInfo.titre}\nContenu: ${newInfo.contenu}`] })
    })
    
    const embedData = await embedResponse.json()
    if (!embedResponse.ok || !embedData.data) throw new Error(`Mistral Error: ${JSON.stringify(embedData)}`);

    const { error } = await supabaseAdmin.from('knowledge_base').insert([{ 
      titre: newInfo.titre, 
      contenu: newInfo.contenu, 
      categorie: table, 
      source_url: newInfo.source_url, 
      embedding: embedData.data[0].embedding 
    }])
    if (error) throw new Error(`Erreur SQL : ${error.message}`);

    console.log("✅ Synchronisation réussie !");
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error("❌ ERREUR CAPTURÉE :", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})