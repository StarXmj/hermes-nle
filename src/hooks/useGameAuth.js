// src/hooks/useGameAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardWeekly, setLeaderboardWeekly] = useState([]);
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
    // 1. Classement Général (Top 50 pour le menu principal)
    const { data: allTime } = await supabase
      .from('arcade_players') // Ou 'view_leaderboard' si tu as activé la sécurité SQL stricte
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(50); // <--- AUGMENTÉ À 50
    
    if (allTime) setLeaderboardAllTime(allTime);

    // 2. Classement Semaine
    try {
        const { data: weekly } = await supabase.rpc('get_weekly_leaderboard');
        if (weekly) setLeaderboardWeekly(weekly);
        else setLeaderboardWeekly(allTime || []);
    } catch (e) {
        // Fallback si la fonction RPC n'existe pas encore
        setLeaderboardWeekly(allTime || []);
    }
  };

  // --- INSCRIPTION (Directe) ---
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
          email_verified: true, // Validé d'office
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

  // --- CONNEXION ---
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('arcade_players')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

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

  // --- SCORE ---
  const saveScore = async (newScore) => {
    if (!player) return;

    await supabase.from('arcade_scores').insert([{ 
      player_id: player.id, score: newScore, pseudo: player.pseudo 
    }]);

    if (newScore > player.best_score) {
      const updatedPlayer = { ...player, best_score: newScore };
      saveSession(updatedPlayer);
      
      await supabase
        .from('arcade_players')
        .update({ best_score: newScore })
        .eq('id', player.id);
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

  return { 
    player, 
    leaderboardAllTime, 
    leaderboardWeekly, 
    login, 
    register, 
    saveScore, 
    logout, 
    loading, 
    error 
  };
}