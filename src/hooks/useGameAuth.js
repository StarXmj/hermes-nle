import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useGameAuth() {
  const [player, setPlayer] = useState(null);
  
  // ✅ 1. SÉCURITÉ : Initialisation avec des tableaux vides
  const [leaderboardAllTime, setLeaderboardAllTime] = useState([]);
  const [leaderboardMonthly, setLeaderboardMonthly] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A. Chargement du joueur depuis le stockage local
    const savedPlayer = localStorage.getItem('hermes_player');
    if (savedPlayer) {
      try {
        setPlayer(JSON.parse(savedPlayer));
      } catch (e) {
        console.error("Erreur parsing player", e);
      }
    }
    
    // B. Premier chargement des scores
    fetchLeaderboards();

    // ✅ 2. TEMPS RÉEL
    const channel = supabase
      .channel('leaderboard_updates')
      .on(
        'postgres_changes',
        { 
          event: '*', // INSERT, UPDATE, ou DELETE
          schema: 'public', 
          table: 'arcade_scores' 
        },
        (payload) => {
          console.log('⚡ Score détecté en temps réel ! Mise à jour...');
          fetchLeaderboards(); // On recharge les listes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboards = async () => {
    // 1. Classement Général
    const { data: allTime } = await supabase
      .from('arcade_players')
      .select('pseudo, best_score')
      .order('best_score', { ascending: false })
      .limit(1000);
    
    // Vérification de sécurité
    if (allTime && Array.isArray(allTime)) {
        setLeaderboardAllTime(allTime);
    } else {
        setLeaderboardAllTime([]);
    }

    // 2. Classement Mensuel (Saison)
    try {
        const { data: monthly, error: errorRPC } = await supabase.rpc('get_monthly_leaderboard');
        
        if (!errorRPC && monthly && Array.isArray(monthly)) {
            setLeaderboardMonthly(monthly);
        } else {
            // Fallback safe
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
        p_email: email,
        p_pseudo: pseudo,
        p_password: password,
        p_newsletter: newsletterOptin
      });

      if (error) throw error;

      saveSession(data);
      // ✅ RETOURNE L'UTILISATEUR (pour sauvegarde immédiate)
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
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('login_arcade_player', {
        p_email: email,
        p_password: password
      });

      if (error || !data) throw new Error("Identifiants incorrects.");
      
      saveSession(data);
      // ✅ RETOURNE L'UTILISATEUR (pour sauvegarde immédiate)
      return { success: true, user: data };
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACCEPTE "playerOverride" POUR SAUVEGARDER AVANT MAJ DU STATE
  const saveScore = async (newScore, playerOverride = null) => {
    // On prend soit le joueur qu'on force (celui qui vient de s'inscrire), soit le state actuel
    const targetPlayer = playerOverride || player;
    
    if (!targetPlayer) return;
    
    // Insertion historique
    await supabase.from('arcade_scores').insert([{ 
      player_id: targetPlayer.id, score: newScore, pseudo: targetPlayer.pseudo 
    }]);

    // Mise à jour record personnel
    if (newScore > (targetPlayer.best_score || 0)) {
      const updatedPlayer = { ...targetPlayer, best_score: newScore };
      saveSession(updatedPlayer);
      await supabase.from('arcade_players').update({ best_score: newScore }).eq('id', targetPlayer.id);
    }
    
    // Update local immédiat
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