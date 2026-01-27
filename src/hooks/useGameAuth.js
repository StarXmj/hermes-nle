import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A. Chargement du joueur local
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      try { setPlayer(JSON.parse(savedPlayer)); } catch (e) { console.error(e); }
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

  const fetchLeaderboards = async () => {
    // 1. CLASSEMENT GÉNÉRAL (TOP JOUEURS)
    // On garde arcade_players ici car c'est parfait pour avoir le "Meilleur Score Unique" par personne
    const { data: allTime } = await supabase
      .from('arcade_players')
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(50);
    
    if (allTime) setLeaderboardAllTime(allTime);

    // 2. CLASSEMENT DU MOIS (VIA VOTRE NOUVELLE VUE)
    // On calcule le 1er jour du mois actuel
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // ✅ OPTIMISATION : On interroge la vue SQL directement
    const { data: monthly } = await supabase
      .from('view_monthly_best') 
      .select('pseudo, score') // Plus besoin de filtrer la date ici, le SQL le fait
      .limit(50); // Top 50 du mois

    // Sécurité si vide
    if (monthly) {
        setLeaderboardMonthly(monthly);
    } else {
        setLeaderboardMonthly([]);
    }
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
    
    // ✅ CORRECTION CRITIQUE : 
    // On n'envoie PLUS le pseudo ici. La base le retrouvera toute seule via l'ID.
    await supabase.from('arcade_scores').insert([{ 
      player_id: targetPlayer.id, 
      score: newScore 
    }]);

    // Mise à jour du record perso (Best Score) dans la table players
    if (newScore > (targetPlayer.best_score || 0)) {
      const updatedPlayer = { ...targetPlayer, best_score: newScore };
      saveSession(updatedPlayer);
      await supabase.from('arcade_players').update({ best_score: newScore }).eq('id', targetPlayer.id);
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