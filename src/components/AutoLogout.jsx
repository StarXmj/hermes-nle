// src/components/AutoLogout.jsx
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AutoLogout = () => {
  const navigate = useNavigate();
  // 30 minutes en millisecondes
  const INACTIVITY_LIMIT = 30 * 60 * 1000; 
  let logoutTimer;

  // Fonction qui déconnecte
  const handleLogout = async () => {
    console.log("Déconnexion automatique pour inactivité.");
    await supabase.auth.signOut();
    navigate('/login'); // Redirection forcée
    toast.error("Vous avez été déconnecté pour inactivité.");
  };

  // Fonction pour remettre le compteur à zéro
  const resetTimer = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // On lance le timer au démarrage
    resetTimer();

    // On écoute chaque événement pour reset le timer
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Nettoyage quand le composant est détruit (changement de page, etc)
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // Ce composant n'affiche rien visuellement
};

export default AutoLogout;