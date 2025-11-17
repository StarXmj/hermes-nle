import { createClient } from '@supabase/supabase-js'

// 1. On récupère les clés
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Clés Supabase manquantes.")
}

// 2. Création d'un stockage personnalisé basé sur les Cookies de Session
// (C'est ce qui permet de rester connecté tant que le navigateur est ouvert)
const SessionCookieStorage = {
  getItem: (key) => {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },
  setItem: (key, value) => {
    // IMPORTANT : Pas de "expires" = Cookie de session (meurt à la fermeture du navigateur)
    // "path=/" permet d'être accessible sur tout le site
    // "SameSite=Lax" et "Secure" pour la sécurité moderne
    document.cookie = `${key}=${value}; path=/; SameSite=Lax; Secure`;
  },
  removeItem: (key) => {
    // Pour supprimer, on met une date passée
    document.cookie = `${key}=; Max-Age=-99999999; path=/; SameSite=Lax; Secure`;
  }
};

// 3. Configuration du client avec ce stockage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: SessionCookieStorage, // On utilise nos cookies
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});