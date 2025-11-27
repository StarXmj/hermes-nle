// src/pages/AdminNewsletterPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaCopy, FaEnvelope, FaTrash } from 'react-icons/fa'; // 1. Import FaTrash
import './AdminActionsPage.css'; 

// Helper pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Charger les inscrits
  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setSubscribers(data);
      }
      setLoading(false);
    };

    fetchSubscribers();
  }, []);

  // Fonction pour copier tous les emails
  const handleCopyAll = () => {
    const allEmails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(allEmails).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  // 2. Fonction de suppression
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet abonné de la liste ?")) {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) {
        setError("Erreur lors de la suppression : " + error.message);
      } else {
        // On met à jour la liste locale pour retirer l'élément supprimé immédiatement
        setSubscribers(currentSubscribers => currentSubscribers.filter(sub => sub.id !== id));
      }
    }
  };

  return (
    <main className="page-section">
<Helmet>
  <title>Liste Newsletter | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour au Tableau de bord</Link>
        <h1>Inscrits Newsletter ({subscribers.length})</h1>
        
        <button 
          className="cta-button" 
          onClick={handleCopyAll}
          disabled={subscribers.length === 0}
          style={{display: 'flex', alignItems: 'center', gap: '10px'}}
        >
          <FaCopy /> {copySuccess ? 'Copié !' : 'Copier tous les emails'}
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {subscribers.length > 0 ? (
          subscribers.map(sub => (
            <div className="admin-row" key={sub.id} style={{cursor: 'default'}}>
              <div className="admin-row-info">
                <span className="admin-row-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <FaEnvelope style={{color: '#0056b3'}} />
                  {sub.email}
                </span>
                <span className="admin-row-date">
                  Inscrit le : {formatDate(sub.created_at)}
                </span>
              </div>
              
              {/* 3. Bouton Poubelle */}
              <div className="admin-row-controls">
                <button 
                  className="admin-btn icon-btn danger" 
                  onClick={() => handleDelete(sub.id)}
                  title="Supprimer cet abonné"
                >
                  <FaTrash />
                </button>
              </div>

            </div>
          ))
        ) : (
          <p style={{fontStyle: 'italic', color: '#777'}}>Aucun inscrit pour le moment.</p>
        )}
      </div>
    </main>
  );
}

export default AdminNewsletterPage;