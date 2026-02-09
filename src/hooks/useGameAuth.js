import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A. Chargement du joueur local (Cache)
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      try {
        const parsed = JSON.parse(savedPlayer);
        setPlayer(parsed);
        // On rafraichit les données (Score, Skins) silencieusement
        refreshUserProfile(parsed.id);
      } catch (e) {
        console.error("Erreur parsing player", e);
      }
    }
    
    // B. Premier chargement
    fetchLeaderboards();

    // C. Temps Réel
    const channel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arcade_scores' }, () => {
          fetchLeaderboards();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const refreshUserProfile = async (userId) => {
      // Pour la lecture simple, on peut utiliser .from() si la RLS 'SELECT' est ouverte (public)
      // Sinon, il faudrait aussi une RPC 'get_player_profile'
      const { data, error } = await supabase
          .from('arcade_players')
          .select('*')
          .eq('id', userId)
          .single();
          
      if (data && !error) {
          saveSession(data);
      }
  };

  const fetchLeaderboards = async () => {
    // Si vos vues SQL existent, c'est parfait. Sinon utilisez .from('arcade_players')
    const { data: allTime } = await supabase
      .from('arcade_players') 
      .select('*')
      .order('best_score', { ascending: false })
      .limit(10);
    
    if (allTime) setLeaderboardAllTime(allTime);
    setLeaderboardMonthly(allTime); // Simplifié pour l'exemple
  };

  // --- INSCRIPTION VIA RPC ---
  const register = async (email, pseudo, password, newsletterOptin) => {
    setLoading(true); setError(null);
    
    if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères.");
        setLoading(false); return { success: false };
    }

    try {
      // Appel à la fonction SQL sécurisée
      const { data, error } = await supabase.rpc('register_arcade_player', {
        p_email: email, 
        p_pseudo: pseudo, 
        p_password: password, 
        p_newsletter: newsletterOptin
      });

      if (error) throw error;

      saveSession(data);
      return { success: true, user: data };

    } catch (err) {
      console.error(err);
      if (err.message?.includes('déjà utilisé') || err.message?.includes('violates unique')) {
         setError("Ce Pseudo ou Email est déjà pris.");
      } else {
         setError("Erreur lors de l'inscription.");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- CONNEXION VIA RPC ---
  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      // Appel à la fonction SQL sécurisée
      const { data, error } = await supabase.rpc('login_arcade_player', {
        p_email: email, 
        p_password: password
      });

      if (error) throw error;
      
      saveSession(data);
      return { success: true, user: data };
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- SAUVEGARDE SCORE VIA RPC (CORRECTION RLS) ---
  const saveScore = async (newScore, playerOverride = null) => {
    const targetPlayer = playerOverride || player;
    if (!targetPlayer) return;
    
    // On met à jour l'interface locale immédiatement
    if (newScore > (targetPlayer.best_score || 0)) {
        const updatedPlayer = { 
            ...targetPlayer, 
            best_score: newScore, 
            best_score_at: new Date().toISOString() 
        };
        saveSession(updatedPlayer);
    }

    // Appel à la fonction SQL sécurisée pour l'écriture en base
    // Cela évite l'erreur RLS car la fonction est SECURITY DEFINER
    const { error } = await supabase.rpc('save_arcade_score', {
        p_player_id: targetPlayer.id,
        p_score: newScore
    });

    if (error) console.error("Erreur sauvegarde score:", error);
    
    fetchLeaderboards();
  };

  const saveSession = (data) => {
    // Sécurité : On retire le mot de passe (même haché) de la session locale
    const safeData = { ...data };
    delete safeData.password;
    
    setPlayer(safeData);
    localStorage.setItem('hermes_player', JSON.stringify(safeData));
  };

  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('hermes_player');
  };

  return {
    player,
    setPlayer, // 👈 AJOUTEZ CETTE LIGNE ICI ! (C'est ça qui manquait)
    loading,
    error,
    leaderboardAllTime,
    leaderboardMonthly,
    register,
    login,
    logout,
    saveScore
  };
}