import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // C'est ici que le message d'erreur est stocké

  // ... (Le useEffect et le Realtime restent inchangés) ...
  useEffect(() => {
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    }
    fetchLeaderboards();

    const channel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arcade_scores' }, () => {
          fetchLeaderboards();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
  
  const fetchLeaderboards = async () => {
      // ... (Code existant inchangé) ...
      const { data: allTime } = await supabase
      .from('arcade_players')
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(1000);
    if (allTime) setLeaderboardAllTime(allTime);

    try {
        const { data: monthly } = await supabase.rpc('get_monthly_leaderboard');
        if (monthly) setLeaderboardMonthly(monthly);
        else setLeaderboardMonthly(allTime ? allTime.slice(0, 50) : []);
    } catch (e) {
        setLeaderboardMonthly(allTime ? allTime.slice(0, 50) : []);
    }
  };

  // --- INSCRIPTION AMÉLIORÉE ---
  const register = async (email, pseudo, password, newsletterOptin) => {
    setLoading(true);
    setError(null); // On efface les anciennes erreurs
    
    // Validation basique avant d'envoyer
    if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères.");
        setLoading(false);
        return { success: false };
    }

    try {
      const { data, error } = await supabase.rpc('register_arcade_player', {
        p_email: email,
        p_pseudo: pseudo,
        p_password: password,
        p_newsletter: newsletterOptin
      });

      if (error) throw error;

      saveSession(data);
      return { success: true };

    } catch (err) {
      console.warn("Erreur inscription:", err);
      
      // Détection précise des erreurs SQL
      if (err.message && err.message.includes('déjà utilisé')) {
         setError("Ce Pseudo ou cet Email existe déjà. Essayez de vous connecter !");
      } else if (err.code === '23505') { // Code Postgres pour 'Unique Violation'
         setError("Ce Pseudo ou Email est déjà pris.");
      } else {
         setError("Une erreur est survenue. Vérifiez votre connexion.");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN AMÉLIORÉ ---
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('login_arcade_player', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;
      if (!data) throw new Error("Identifiants incorrects."); // Cas théorique
      
      saveSession(data);
      return { success: true };
    } catch (err) {
      console.error("Erreur login:", err);
      // On reste vague pour la sécurité, ou précis selon le besoin
      setError("Email inconnu ou mot de passe incorrect.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ... (Reste du fichier: saveScore, saveSession, logout inchangés) ...
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