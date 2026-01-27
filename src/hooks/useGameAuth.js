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
    let parsedPlayer = null;
    
    if (savedPlayer) {
      try {
        parsedPlayer = JSON.parse(savedPlayer);
        setPlayer(parsedPlayer);
        
        // ✅ CORRECTIF : On vérifie tout de suite en base pour avoir la VRAIE date
        refreshUserProfile(parsedPlayer.id); 
      } catch (e) {
        console.error("Erreur parsing player", e);
      }
    }
    
    // B. Premier chargement
    fetchLeaderboards();

    // C. Temps Réel (On écoute la table brute, c'est plus fiable pour le trigger)
    const channel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arcade_scores' }, () => {
          fetchLeaderboards();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
const refreshUserProfile = async (userId) => {
      const { data, error } = await supabase
          .from('arcade_players')
          .select('*')
          .eq('id', userId)
          .single();
          
      if (data && !error) {
          // On met à jour le state et le cache avec les données fraîches de la base
          saveSession(data);
      }
  };
  const fetchLeaderboards = async () => {
    // 1. CLASSEMENT ALL TIME (Vue Étendue)
    const { data: allTime } = await supabase
      .from('view_leaderboard_extended') 
      .select('*')
      .order('best_score', { ascending: false }); // Pas de limite
    
    if (allTime) setLeaderboardAllTime(allTime);

    // 2. CLASSEMENT DU MOIS (Nouvelle Vue Stats)
    const { data: monthly } = await supabase
      .from('view_monthly_stats') // ✅ On appelle la nouvelle vue mensuelle
      .select('*')
      .order('best_score', { ascending: false });

    if (monthly) setLeaderboardMonthly(monthly);
  };

  const register = async (email, pseudo, password, newsletterOptin) => {
    setLoading(true); setError(null);
    
    if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères.");
        setLoading(false); return { success: false };
    }

    try {
      const { data, error } = await supabase.rpc('register_arcade_player', {
        p_email: email, p_pseudo: pseudo, p_password: password, p_newsletter: newsletterOptin
      });

      if (error) throw error;

      saveSession(data);
      return { success: true, user: data };

    } catch (err) {
      if (err.message?.includes('déjà utilisé') || err.code === '23505') {
         setError("Ce Pseudo ou Email est déjà pris.");
      } else {
         setError("Erreur lors de l'inscription.");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.rpc('login_arcade_player', {
        p_email: email, p_password: password
      });

      if (error || !data) throw new Error("Identifiants incorrects.");
      
      saveSession(data);
      return { success: true, user: data };
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async (newScore, playerOverride = null) => {
    const targetPlayer = playerOverride || player;
    if (!targetPlayer) return;
    
    // Insertion score (le Trigger SQL s'occupera du nettoyage > 200)
    await supabase.from('arcade_scores').insert([{ 
      player_id: targetPlayer.id, 
      score: newScore 
    }]);

    // Mise à jour Record + DATE
    if (newScore > (targetPlayer.best_score || 0)) {
      const now = new Date().toISOString(); // Date actuelle
      const updatedPlayer = { ...targetPlayer, best_score: newScore, best_score_at: now };
      
      saveSession(updatedPlayer);
      
      // ✅ ON SAUVEGARDE LA DATE
      await supabase.from('arcade_players')
        .update({ best_score: newScore, best_score_at: now })
        .eq('id', targetPlayer.id);
    }
    
    fetchLeaderboards();
  };

  const saveSession = (data) => {
    setPlayer(data);
    localStorage.setItem('hermes_player', JSON.stringify(data));
  };

  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('hermes_player');
  };

  return { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading, error };
}