// src/components/PermissionRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PermissionRoute = ({ permission }) => {
  const [hasPermission, setHasPermission] = useState(null); // null = chargement
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      // 1. On vérifie l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      // 2. On vérifie la colonne spécifique dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select(permission) // On sélectionne uniquement la colonne demandée (ex: 'can_edit_blog')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error("Erreur permission ou profil introuvable", error);
        setHasPermission(false);
      } else {
        // On vérifie si la valeur est TRUE
        setHasPermission(data[permission] === true);
      }
      setLoading(false);
    };

    checkPermission();
  }, [permission]);

  if (loading) {
    return <div className="page-section" style={{textAlign:'center'}}><p>Vérification des droits...</p></div>;
  }

  // Si autorisé : on affiche la page demandée (Outlet)
  // Si refusé : on redirige vers le tableau de bord admin
  return hasPermission ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default PermissionRoute;