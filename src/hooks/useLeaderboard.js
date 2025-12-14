// src/hooks/useLeaderboard.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  // Récupérer le TOP 10
  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10); // On prend les 10 meilleurs
    
    if (!error && data) {
      setLeaderboard(data);
    }
  };

  // Sauvegarder un score
  const saveScore = async (pseudo, score) => {
    setLoading(true);
    try {
      // 1. On regarde si le pseudo existe déjà
      const { data: existingUser } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('pseudo', pseudo)
        .single();

      if (existingUser) {
        // 2. S'il existe, on met à jour SEULEMENT si le nouveau score est meilleur
        if (score > existingUser.score) {
          await supabase
            .from('leaderboard')
            .update({ score: score })
            .eq('pseudo', pseudo);
        }
      } else {
        // 3. S'il n'existe pas, on le crée
        await supabase
          .from('leaderboard')
          .insert([{ pseudo: pseudo, score: score }]);
      }
      
      // On rafraîchit la liste
      await fetchLeaderboard();
      return { success: true };
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Charger le classement au démarrage
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return { leaderboard, saveScore, fetchLeaderboard, loading };
}