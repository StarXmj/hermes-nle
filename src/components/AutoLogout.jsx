import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Attention à bien importer 'toast' pour l'utiliser

const AutoLogout = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const timerRef = useRef(null); // Utilisation de useRef pour stocker l'ID du timer sans re-render
  
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

  // 1. On écoute si l'utilisateur est connecté ou non
  useEffect(() => {
    // Vérification initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écoute des changements (Connexion / Déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Gestion du Timer d'inactivité
  useEffect(() => {
    // 🛑 SI PAS DE SESSION : ON NE FAIT RIEN (et on nettoie si besoin)
    if (!session) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return; 
    }

    // ✅ SI SESSION ACTIVE : ON LANCE LA SURVEILLANCE
    
    const handleLogout = async () => {
      console.log("Déconnexion automatique pour inactivité.");
      
      // On vérifie une dernière fois si la session est toujours là pour éviter les bugs
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
          await supabase.auth.signOut();
          navigate('/login');
          toast.error("Vous avez été déconnecté pour inactivité.");
      }
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    // Liste des événements qui prouvent que l'utilisateur est actif
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Démarrage initial
    resetTimer();

    // Ajout des écouteurs
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Nettoyage quand le composant est démonté ou si la session change (déconnexion)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session, navigate]); // Ce useEffect se relance à chaque changement d'état de session

  return null;
};

export default AutoLogout;