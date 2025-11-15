// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. On vérifie la session actuelle
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // 2. On écoute les changements (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // On nettoie l'écouteur
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <main className="page-section"><p>Chargement...</p></main>;
  }

  // Si pas de session, on redirige vers /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si on a une session, on affiche la page enfant (AdminPage)
  return <Outlet />;
}

export default ProtectedRoute;