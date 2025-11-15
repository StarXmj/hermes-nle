import { createClient } from '@supabase/supabase-js'

// 1. On lit les variables depuis le .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// 2. On vérifie qu'elles existent
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Clés Supabase manquantes. Assurez-vous d'avoir un fichier .env correct.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)