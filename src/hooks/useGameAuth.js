// src/hooks/useGameAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]); // ✅ MODIFIÉ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    }
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    // 1. Classement Général (Toujours Top 1000 all time)
    const { data: allTime } = await supabase
      .from('arcade_players')
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(1000);
    
    if (allTime) setLeaderboardAllTime(allTime);

    // 2. Classement Mensuel (Saison actuelle)
    try {
        // ✅ APPEL RPC MENSUEL (Il faudra créer cette fonction dans Supabase)
        const { data: monthly } = await supabase.rpc('get_monthly_leaderboard');
        if (monthly) setLeaderboardMonthly(monthly);
        else setLeaderboardMonthly(allTime || []); // Fallback
    } catch (e) {
        console.error("Erreur leaderboard mensuel:", e);
        setLeaderboardMonthly(allTime || []);
    }
  };

  const register = async (email, pseudo, password, newsletterOptin) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('arcade_players')
        .insert([{ 
          email, 
          pseudo, 
          password, 
          newsletter_optin: newsletterOptin, 
          email_verified: true, 
          best_score: 0
        }])
        .select()
        .single();

      if (error) throw error;

      saveSession(data);
      return { success: true };

    } catch (err) {
      const msg = err.message.includes('unique') 
        ? "Ce pseudo ou cet email est déjà utilisé !" 
        : err.message;
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('arcade_players')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) throw new Error("Identifiants incorrects.");
      
      saveSession(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async (newScore) => {
    if (!player) return;
    
    // On insère le score dans l'historique
    await supabase.from('arcade_scores').insert([{ 
      player_id: player.id, score: newScore, pseudo: player.pseudo 
    }]);

    // Si c'est un record personnel absolu
    if (newScore > player.best_score) {
      const updatedPlayer = { ...player, best_score: newScore };
      saveSession(updatedPlayer);
      await supabase.from('arcade_players').update({ best_score: newScore }).eq('id', player.id);
    }
    
    // On rafraîchit les classements pour voir si on est monté
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

  // ✅ On retourne leaderboardMonthly au lieu de leaderboardWeekly
  return { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading, error };
}