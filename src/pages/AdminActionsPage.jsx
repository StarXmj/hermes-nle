// src/pages/AdminActionsPage.jsx
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle } from 'react-icons/fa'; // J'ai retiré les flèches des imports
import ActionForm from '../components/ActionForm'; 
import './AdminActionsPage.css';
import { useAdminData } from '../hooks/useAdminData';
import React, { useState, useEffect } from 'react';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = 'programmes';

// Fonction pour formater les dates
const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function AdminActionsPage() {
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAction, setEditingAction] = useState(null); 

  async function fetchActions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('actions')
      .select(`
        *, 
        created_by_profile:created_by(username), 
        modif_by_profile:modif_by(username)
      `)
      .order('dateISO', { ascending: true }); 

    if (error) {
      setError(error.message);
    } else {
      setActions(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchActions();
  }, []);

  const handleDelete = async (actionToDelete) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette action ?")) {
      setError(null);
      try {
        const lien = actionToDelete.lienProgramme;
        if (lien && lien.startsWith(SUPABASE_URL) && lien.includes(`/${BUCKET_NAME}/`)) {
          const urlParts = lien.split(`/${BUCKET_NAME}/`);
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1]);
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          }
        }
      } catch (storageException) {
        console.warn("Erreur suppression storage:", storageException);
      }
      
      const { error: dbError } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionToDelete.id); 

      if (dbError) {
        setError(dbError.message);
      } else {
        await fetchActions(); 
      }
    }
  };

  const handleStatusToggle = async (actionToToggle) => {
    const newStatus = actionToToggle.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = actionToToggle.status; 

    setActions(currentActions =>
      currentActions.map(action =>
        action.id === actionToToggle.id
          ? { ...action, status: newStatus }
          : action
      )
    );

    const { error } = await supabase
      .from('actions')
      .update({ status: newStatus })
      .eq('id', actionToToggle.id);

    if (error) {
      setError(`Erreur lors de la mise à jour : ${error.message}`);
      setActions(currentActions =>
        currentActions.map(action =>
          action.id === actionToToggle.id
            ? { ...action, status: originalStatus } 
            : action
        )
      );
    } else {
      setError(null);
      await fetchActions();
    }
  };

  const handleSave = async () => {
    await fetchActions(); 
    setEditingAction(null); 
  };
  
  if (editingAction) {
    return (
      <main className="page-section">
        <Helmet>
        <title>Édition Action | Admin - Hermes by NLE</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
        <ActionForm 
          action={editingAction === 'new' ? {} : editingAction} 
          onSave={handleSave}
          onCancel={() => setEditingAction(null)}
        />
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet>
      <title>Gestion Actions | Admin - Hermes by NLE</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">
          &larr; Retour au Tableau de bord
        </Link>
        <button 
          className="cta-button" 
          onClick={() => setEditingAction('new')} 
          aria-label="Retour au Tableau de bord" // Indispensable pour les lecteurs d'écran et le score SEO
        title="Retour"
        >
          <FaPlusCircle /> Ajouter une action
        </button>
      </div>
      
      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="admin-list">
        {actions.map(action => (
          <div className="admin-row" key={action.id}>
            
            <div className="admin-row-info">
              <span className="admin-row-title">{action.titre}</span>
              <span className="admin-row-date">
                {new Date(action.dateISO).toLocaleDateString('fr-FR')}
              </span>
              
              <div className="admin-row-metadata">
                <span>
                  Créé le: {formatFullDate(action.date_creat)} 
                  <br/>
                  {/* Affiche l'email (username) */}
                  par: <strong>{action.created_by_profile?.username || 'Inconnu'}</strong>
                </span>
                
                {action.modif_by && (
                  <span>
                    <br/>
                    Modifié le: {formatFullDate(action.last_modif)} 
                    <br/>
                    par: <strong>{action.modif_by_profile?.username || 'Inconnu'}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="admin-row-controls">

               <span style={{fontSize:'0.8rem', color: action.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {action.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={action.status === 'publié'} 
                  onChange={() => handleStatusToggle(action)}
                />
                <span className="slider round"></span>
              </label>
              
              {/* FLÈCHES SUPPRIMÉES ICI */}
              
              <button 
                className="admin-btn icon-btn" 
                title="Modifier"
                ria-label="Modifier l'action"
                onClick={() => setEditingAction(action)} 
              >
                <FaEdit />
              </button>
              <button 
                className="admin-btn icon-btn danger" 
                title="Supprimer"
                aria-label="Supprimer l'action"
                onClick={() => handleDelete(action)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminActionsPage;