// src/pages/AdminDashboard.jsx
import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaEdit, FaPlusCircle, FaUsers, FaHandshake, FaBullhorn, FaBloggerB, FaQuestionCircle } from 'react-icons/fa';
import './AdminDashboard.css'; // Nouveau CSS

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion', error);
    } else {
      navigate('/');
    }
  };

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
      
      <p>Bienvenue sur le panneau de gestion. Choisissez une section à modifier.</p>
      
      {/* Grille de navigation pour l'admin */}
      <div className="admin-nav-grid">
        
        <Link to="/admin/actions" className="admin-nav-card">
          <FaEdit size={30} />
          <h3>Gérer les Actions</h3>
          <p>Modifier, publier ou supprimer des événements.</p>
        </Link>
        
        <Link to="/admin/partenaires" className="admin-nav-card disabled">
          <FaHandshake size={30} />
          <h3>Gérer les Partenaires</h3>
          <p>(Bientôt disponible)</p>
        </Link>
        
        <Link to="/admin/actus" className="admin-nav-card disabled">
          <FaBullhorn size={30} />
          <h3>Gérer les Actualités</h3>
          <p>(Bientôt disponible)</p>
        </Link>
        
        <Link to="/admin/membres" className="admin-nav-card disabled">
          <FaUsers size={30} />
          <h3>Gérer les Membres</h3>
          <p>(Bientôt disponible)</p>
        </Link>

        <Link to="/admin/faq" className="admin-nav-card disabled">
          <FaQuestionCircle size={30} />
          <h3>Gérer la FAQ</h3>
          <p>(Bientôt disponible)</p>
        </Link>
        
        <Link to="/admin/blog" className="admin-nav-card disabled">
          <FaBloggerB size={30} />
          <h3>Gérer le Blog</h3>
          <p>(Bientôt disponible)</p>
        </Link>

      </div>
    </main>
  );
}

export default AdminDashboard;