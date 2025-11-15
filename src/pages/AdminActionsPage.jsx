// src/pages/AdminActionsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom'; // On importe Link
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaArrowUp, FaArrowDown, FaEdit, FaPlusCircle } from 'react-icons/fa';
import ActionForm from '../components/ActionForm'; 
import './AdminActionsPage.css'; // CSS Renommé

function AdminActionsPage() { // Nom de fonction changé
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAction, setEditingAction] = useState(null); 

  async function fetchActions() {
    // ... (toute la logique de fetchActions, handleDelete, handleStatusToggle... reste la même)
    setLoading(true);
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('dateISO', { ascending: false }); 

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

  const handleDelete = async (actionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette action ?")) {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId);

      if (error) {
        setError(error.message);
      } else {
        await fetchActions(); 
      }
    }
  };

  const handleStatusToggle = async (action) => {
    const newStatus = action.status === 'publié' ? 'brouillon' : 'publié';
    
    const { error } = await supabase
      .from('actions')
      .update({ status: newStatus })
      .eq('id', action.id);

    if (error) {
      setError(error.message);
    } else {
      await fetchActions(); 
    }
  };

  const handleSave = async () => {
    await fetchActions(); 
    setEditingAction(null); 
  };

  // ---------------- RENDU ----------------
  
  if (editingAction) {
    return (
      <main className="page-section">
        <Helmet>
          <title>Édition - Admin Hermes</title>
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
        <title>Admin - Actions - Hermes by NLE</title>
      </Helmet>
      
      <div className="admin-header">
        {/* On ajoute un lien de retour vers le tableau de bord */}
        <Link to="/admin" className="admin-back-link">
          &larr; Retour au Tableau de bord
        </Link>
        <button 
          className="cta-button" 
          onClick={() => setEditingAction('new')} 
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
              <span className="admin-row-date">{new Date(action.dateISO).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="admin-row-controls">
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={action.status === 'publié'} 
                  onChange={() => handleStatusToggle(action)}
                />
                <span className="slider round"></span>
              </label>
              <button className="admin-btn icon-btn" title="Monter"><FaArrowUp /></button>
              <button className="admin-btn icon-btn" title="Descendre"><FaArrowDown /></button>
              <button 
                className="admin-btn icon-btn" 
                title="Modifier"
                onClick={() => setEditingAction(action)}
              >
                <FaEdit />
              </button>
              <button 
                className="admin-btn icon-btn danger" 
                title="Supprimer"
                onClick={() => handleDelete(action.id)}
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

export default AdminActionsPage; // Nom de fonction changé