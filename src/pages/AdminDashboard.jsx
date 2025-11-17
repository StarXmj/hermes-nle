// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEdit, FaUsers, FaHandshake, FaBullhorn, FaBloggerB, FaQuestionCircle } from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. On récupère l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Si pas connecté, on redirige (sécurité supplémentaire)
        navigate('/login');
        return;
      }

      // 2. On récupère son profil pour avoir les permissions (can_edit_...)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion', error);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <main className="page-section">
        <p>Chargement du tableau de bord...</p>
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet>
        <title>Tableau de bord - Admin Hermes</title>
      </Helmet>
      
      <div className="admin-header">
        <h1>Tableau de bord</h1>
        <button onClick={handleLogout} className="cta-button secondary">
          Se déconnecter
        </button>
      </div>
      
      <p>
        Bienvenue <strong>{profile?.username || 'Admin'}</strong>. 
        
      </p>
      
      {/* Grille de navigation filtrée par permissions */}
      <div className="admin-nav-grid">
        
        {/* Gestion des Actions */}
        {profile?.can_edit_actions && (
          <Link to="/admin/actions" className="admin-nav-card">
            <FaEdit size={30} />
            <h3>Gérer les Actions</h3>
            <p>Modifier, publier ou supprimer des actions.</p>
          </Link>
        )}
        
        {/* Gestion des Partenaires */}
        {profile?.can_edit_partenaires && (
          <Link to="/admin/partenaires" className="admin-nav-card">
            <FaHandshake size={30} />
            <h3>Gérer les Partenaires</h3>
            <p>Modifier, publier ou supprimer des partenaires.</p>
          </Link>
        )}
        
        {/* Gestion des Actualités */}
        {profile?.can_edit_actus && (
          <Link to="/admin/actus" className="admin-nav-card">
            <FaBullhorn size={30} />
            <h3>Gérer les Actualités</h3>
            <p>Modifier, publier ou supprimer des actualités.</p>
          </Link>
        )}
        
        {/* Gestion des Membres */}
        {profile?.can_edit_membres && (
          <Link to="/admin/membres" className="admin-nav-card">
            <FaUsers size={30} />
            <h3>Gérer les Membres</h3>
            <p>Modifier, publier ou supprimer des membres.</p>
          </Link>
        )}

        {/* Gestion de la FAQ */}
        {profile?.can_edit_faq && (
          <Link to="/admin/faq" className="admin-nav-card">
            <FaQuestionCircle size={30} />
            <h3>Gérer la FAQ</h3>
            <p>Modifier, publier ou supprimer des FAQ.</p>
          </Link>
        )}

        {/* Gestion Newsletter */}
        {profile?.can_edit_newsletter && (
          <Link to="/admin/newsletter" className="admin-nav-card">
            <h3>Newsletter</h3>
            <p>Voir et copier la liste des abonnés.</p>
          </Link>
        )}
        
        {/* Gestion du Blog */}
        {profile?.can_edit_blog && (
          <Link to="/admin/blog" className="admin-nav-card">
            <FaBloggerB size={30} />
            <h3>Gérer le Blog</h3>
            <p>Rédiger et publier des articles.</p>
          </Link>
        )}

      </div>

      {/* Message si l'utilisateur n'a aucun droit */}
      {!loading && profile && 
       !profile.can_edit_actions && 
       !profile.can_edit_partenaires && 
       !profile.can_edit_actus && 
       !profile.can_edit_membres && 
       !profile.can_edit_faq && 
       !profile.can_edit_blog && (
        <div style={{marginTop: '3rem', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
          <p style={{color: '#777', fontStyle: 'italic', margin: 0}}>
            Vous êtes connecté, mais vous n'avez aucun droit d'administration assigné pour le moment.
            <br/>
            Veuillez contacter le président de l'association pour débloquer vos accès.
          </p>
        </div>
      )}

    </main>
  );
}

export default AdminDashboard;