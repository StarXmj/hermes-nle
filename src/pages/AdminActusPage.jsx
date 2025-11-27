// src/pages/AdminActusPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle, FaThumbtack } from 'react-icons/fa';
import ActuForm from '../components/ActuForm';
import './AdminActionsPage.css';

// Helper formatage date liste
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

function AdminActusPage() {
  const [actus, setActus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingActu, setEditingActu] = useState(null);

  async function fetchActus() {
    setLoading(true);
    const { data, error } = await supabase
      .from('actus')
      .select(`
        *, 
        created_by_profile:created_by(username), 
        modif_by_profile:modif_by(username)
      `)
      .order('dateISO', { ascending: false });

    if (error) setError(error.message);
    else setActus(data);
    
    setLoading(false);
  }

  useEffect(() => { fetchActus(); }, []);

  const handleDelete = async (actuToDelete) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) {
      const { error } = await supabase
        .from('actus')
        .delete()
        .eq('id', actuToDelete.id);

      if (error) setError(error.message);
      else await fetchActus();
    }
  };

  // Gestion du switch "Publié/Brouillon"
  const handleStatusToggle = async (actu) => {
    const newStatus = actu.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = actu.status;

    // Optimistic UI
    setActus(prev => prev.map(a => a.id === actu.id ? { ...a, status: newStatus } : a));

    const { error } = await supabase
      .from('actus')
      .update({ status: newStatus })
      .eq('id', actu.id);

    if (error) {
      setError("Erreur lors de la mise à jour du statut");
      setActus(prev => prev.map(a => a.id === actu.id ? { ...a, status: originalStatus } : a));
    } else {
      await fetchActus(); // Refresh pour les métadonnées
    }
  };

  // Gestion de l'épingle (Optionnel : vous pouvez le garder ou l'enlever de la liste si ça fait trop)
  const handlePinToggle = async (actu) => {
     // (Logique existante si vous voulez garder le bouton épingle dans la liste)
     // Pour simplifier l'interface, on peut le laisser uniquement dans le formulaire
     // Ou le garder ici. Je le laisse pour l'instant.
     const newPinned = !actu.isPinned;
     // ... logique update ...
      const { error } = await supabase.from('actus').update({ isPinned: newPinned }).eq('id', actu.id);
      if(!error) await fetchActus();
  };

  if (editingActu) {
    return (
      <main className="page-section">
        <Helmet>
  <title>Édition Actualité | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
        <ActuForm 
          actu={editingActu === 'new' ? {} : editingActu} 
          onSave={() => { fetchActus(); setEditingActu(null); }} 
          onCancel={() => setEditingActu(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
<Helmet>
  <title>Gestion Actualités | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour au Tableau de bord</Link>
        <h1>Gestion des Actualités</h1>
        <button className="cta-button" onClick={() => setEditingActu('new')}>
          <FaPlusCircle /> Nouvelle Actu
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {actus.map(actu => (
          <div className="admin-row" key={actu.id}>
            <div className="admin-row-info">
              <span className="admin-row-title">
                {actu.isPinned && <FaThumbtack style={{color:'#e74c3c', marginRight:'8px'}} title="Épinglé" />}
                {actu.titre}
              </span>
              <span className="admin-row-date">
                {formatDate(actu.dateISO)} - 
                <span style={{color:'#0056b3', fontWeight:'500', marginLeft:'5px'}}>{actu.categorie}</span>
              </span>
              
              <div className="admin-row-metadata">
                <span>
                  Créé le: {formatFullDate(actu.date_creat)} <br/>
                  par: <strong>{actu.created_by_profile?.username || 'Inconnu'}</strong>
                </span>
                {actu.modif_by && (
                  <span>
                    <br/>
                    Modifié le: {formatFullDate(actu.last_modif)} <br/>
                    par: <strong>{actu.modif_by_profile?.username || 'Inconnu'}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="admin-row-controls">
                
              {/* Label Statut */}
              <span style={{fontSize:'0.8rem', color: actu.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {actu.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              {/* Switch Statut */}
              <label className="switch" title="Changer statut">
                <input type="checkbox" checked={actu.status === 'publié'} onChange={() => handleStatusToggle(actu)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingActu(actu)} title="Modifier">
                <FaEdit />
              </button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(actu)} title="Supprimer">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminActusPage;