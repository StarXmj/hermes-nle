import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  // ✅ INITIALISATION SÉCURISÉE AVEC TABLEAUX VIDES
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      try {
        setPlayer(JSON.parse(savedPlayer));
      } catch (e) {
        console.error("Erreur parsing player", e);
      }
    }
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    // 1. Classement Général
    const { data: allTime, error: errorAllTime } = await supabase
      .from('arcade_players')
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(1000);
    
    // ✅ SÉCURITÉ : On s'assure que c'est un tableau
    if (allTime && Array.isArray(allTime)) {
        setLeaderboardAllTime(allTime);
    } else {
        setLeaderboardAllTime([]); // Jamais undefined
    }

    // 2. Classement Mensuel
    try {
        const { data: monthly, error: errorRPC } = await supabase.rpc('get_monthly_leaderboard');
        
        if (!errorRPC && monthly && Array.isArray(monthly)) {
            setLeaderboardMonthly(monthly);
        } else {
            // Fallback sur le général (ou vide) si le RPC échoue
            setLeaderboardMonthly(Array.isArray(allTime) ? allTime.slice(0, 50) : []);
        }
    } catch (e) {
        console.warn("Leaderboard mensuel indisponible, fallback.", e);
        setLeaderboardMonthly(Array.isArray(allTime) ? allTime.slice(0, 50) : []);
    }
  };

  const register = async (email, pseudo, password, newsletterOptin) => {
    setLoading(true);
    setError(null);
    if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères.");
        setLoading(false);
        return { success: false };
    }
    try {
      const { data, error } = await supabase.rpc('register_arcade_player', {
        p_email: email, p_pseudo: pseudo, p_password: password, p_newsletter: newsletterOptin
      });
      if (error) throw error;
      saveSession(data);
      return { success: true };
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
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('login_arcade_player', { p_email: email, p_password: password });
      if (error || !data) throw new Error("Identifiants incorrects.");
      saveSession(data);
      return { success: true };
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async (newScore) => {
    if (!player) return;
    await supabase.from('arcade_scores').insert([{ player_id: player.id, score: newScore, pseudo: player.pseudo }]);
    if (newScore > (player.best_score || 0)) {
      const updatedPlayer = { ...player, best_score: newScore };
      saveSession(updatedPlayer);
      await supabase.from('arcade_players').update({ best_score: newScore }).eq('id', player.id);
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