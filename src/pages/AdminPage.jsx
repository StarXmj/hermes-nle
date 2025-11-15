// src/pages/AdminPage.jsx
import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion', error);
    } else {
      // On redirige vers la page d'accueil
      navigate('/');
    }
  };

  return (
    <main className="page-section">
      <div className="section-content">
        <h1>Panneau d'Administration</h1>
        <p>Bienvenue, Admin. C'est ici que vous gérerez le contenu.</p>
        
        {/* C'est ici que vous ajouterez vos formulaires pour gérer
            les actions, partenaires, etc. en utilisant les booléens
            de la table 'profiles'
        */}
        
        <button onClick={handleLogout} className="cta-button secondary">
          Se déconnecter
        </button>
      </div>
    </main>
  );
}

export default AdminPage;