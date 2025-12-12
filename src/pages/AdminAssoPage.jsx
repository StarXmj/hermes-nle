// src/pages/AdminAssoPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle, FaUsers } from 'react-icons/fa';
import AssoForm from '../components/AssoForm';
import './AdminActionsPage.css'; 

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminAssoPage() {
  const [assos, setAssos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAsso, setEditingAsso] = useState(null);

  async function fetchAssos() {
    setLoading(true);
    // REQUÊTE SÉCURISÉE AVEC JOINTURES EXPLICITES
    const { data, error } = await supabase
      .from('asso')
      .select(`
        *,
        created_by_profile:profiles!asso_created_by_fkey(username),
        modif_by_profile:profiles!asso_modif_by_fkey(username)
      `)
      .order('nom', { ascending: true });

    if (error) setError(error.message);
    else setAssos(data);
    
    setLoading(false);
  }

  useEffect(() => { fetchAssos(); }, []);

  const handleDelete = async (asso) => {
    if (window.confirm(`Supprimer l'association "${asso.nom}" ?`)) {
      // Supprimer le logo s'il existe
      if (asso.logo) {
         try {
            const path = decodeURIComponent(asso.logo.split('/assos/')[1]);
            await supabase.storage.from('assos').remove([path]);
         } catch(e) { console.warn("Erreur suppression image", e); }
      }

      const { error } = await supabase.from('asso').delete().eq('id', asso.id);
      if (error) setError(error.message);
      else await fetchAssos();
    }
  };

  const handleStatusToggle = async (asso) => {
    const newStatus = asso.status === 'publié' ? 'brouillon' : 'publié';
    setAssos(prev => prev.map(a => a.id === asso.id ? { ...a, status: newStatus } : a));
    await supabase.from('asso').update({ status: newStatus }).eq('id', asso.id);
    await fetchAssos(); 
  };

  if (editingAsso) {
    return (
      <main className="page-section">
        <Helmet><title>Édition Asso - Admin</title></Helmet>
        <AssoForm 
          asso={editingAsso === 'new' ? {} : editingAsso} 
          onSave={() => { fetchAssos(); setEditingAsso(null); }} 
          onCancel={() => setEditingAsso(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet><title>Admin - Associations</title></Helmet>
      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Gestion des Associations</h1>
        <button className="cta-button" onClick={() => setEditingAsso('new')}>
          <FaPlusCircle /> Ajouter une asso
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {assos.map(asso => (
          // On ajoute une bordure gauche colorée selon la couleur de l'asso
          <div className="admin-row" key={asso.id} style={{ borderLeft: `6px solid ${asso.color || '#ccc'}` }}>
            
            {/* Affichage du Logo ou Icône par défaut */}
            <div style={{width:'50px', height:'50px', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f0f0', borderRadius:'50%', overflow:'hidden', border:'1px solid #ddd'}}>
                {asso.logo ? (
                    <img src={asso.logo} alt={asso.nom} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    <FaUsers style={{color:'#aaa'}} />
                )}
            </div>

            <div className="admin-row-info">
              <span className="admin-row-title">{asso.nom}</span>
              
              <div style={{fontSize:'0.85rem', color:'#555', marginTop:'5px'}}>
                {Array.isArray(asso.mots_cles) && asso.mots_cles.map((tag, i) => (
                  <span key={i} style={{background:'#eef', padding:'2px 6px', borderRadius:'4px', marginRight:'5px'}}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="admin-row-metadata">
                {/* Utilisation sécurisée des données jointes */}
                <span>Créé le: {formatFullDate(asso.date_creat)} par <strong>{asso.created_by_profile?.username || 'Inconnu'}</strong></span>
                {asso.modif_by && <span> | Modifié par <strong>{asso.modif_by_profile?.username || 'Inconnu'}</strong></span>}
              </div>
            </div>

            <div className="admin-row-controls">
              <span style={{fontSize:'0.8rem', color: asso.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {asso.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              <label className="switch">
                <input type="checkbox" checked={asso.status === 'publié'} onChange={() => handleStatusToggle(asso)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingAsso(asso)}><FaEdit /></button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(asso)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminAssoPage;