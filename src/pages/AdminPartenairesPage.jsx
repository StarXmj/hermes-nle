// src/pages/AdminPartenairesPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle } from 'react-icons/fa';
import PartnerForm from '../components/PartnerForm';
import './AdminActionsPage.css'; // On réutilise le CSS

const BUCKET_NAME = 'partenaires';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper date
const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminPartenairesPage() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPartenaire, setEditingPartenaire] = useState(null);

  async function fetchPartenaires() {
    setLoading(true);
    const { data, error } = await supabase
      .from('partenaires')
      .select(`
        *, 
        created_by_profile:created_by(username), 
        modif_by_profile:modif_by(username)
      `)
      .order('nom', { ascending: true }); // Tri alphabétique par nom

    if (error) setError(error.message);
    else setPartenaires(data);
    
    setLoading(false);
  }

  useEffect(() => { fetchPartenaires(); }, []);

  const handleDelete = async (partenaire) => {
    if (window.confirm(`Supprimer le partenaire "${partenaire.nom}" ?`)) {
      // Suppression logo du storage
      try {
        const logo = partenaire.logo;
        if (logo && logo.startsWith(SUPABASE_URL) && logo.includes(`/${BUCKET_NAME}/`)) {
          const path = decodeURIComponent(logo.split(`/${BUCKET_NAME}/`)[1]);
          await supabase.storage.from(BUCKET_NAME).remove([path]);
        }
      } catch (e) { console.warn("Erreur suppression logo:", e); }

      // Suppression BDD
      const { error } = await supabase.from('partenaires').delete().eq('id', partenaire.id);
      if (error) setError(error.message);
      else await fetchPartenaires();
    }
  };

  const handleStatusToggle = async (partenaire) => {
    const newStatus = partenaire.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = partenaire.status;

    // Optimistic UI
    setPartenaires(prev => prev.map(p => p.id === partenaire.id ? { ...p, status: newStatus } : p));

    const { error } = await supabase
      .from('partenaires')
      .update({ status: newStatus })
      .eq('id', partenaire.id);

    if (error) {
      setError("Erreur update statut");
      setPartenaires(prev => prev.map(p => p.id === partenaire.id ? { ...p, status: originalStatus } : p));
    } else {
      await fetchPartenaires();
    }
  };

  if (editingPartenaire) {
    return (
      <main className="page-section">
        <Helmet><title>Édition Partenaire - Admin</title></Helmet>
        <PartnerForm 
          partenaire={editingPartenaire === 'new' ? {} : editingPartenaire} 
          onSave={() => { fetchPartenaires(); setEditingPartenaire(null); }} 
          onCancel={() => setEditingPartenaire(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet><title>Admin - Partenaires</title></Helmet>
      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Gestion des Partenaires</h1>
        <button className="cta-button" onClick={() => setEditingPartenaire('new')}>
          <FaPlusCircle /> Ajouter
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {partenaires.map(partenaire => (
          <div className="admin-row" key={partenaire.id}>
            
            {/* Image Miniature */}
            <div style={{width:'60px', height:'60px', flexShrink:0, marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f9f9f9', borderRadius:'5px', overflow:'hidden'}}>
                {partenaire.logo ? (
                    <img src={partenaire.logo} alt="logo" style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} />
                ) : (
                    <span style={{fontSize:'0.7rem', color:'#ccc'}}>No logo</span>
                )}
            </div>

            <div className="admin-row-info">
              <span className="admin-row-title">{partenaire.nom}</span>
              
              <div className="admin-row-metadata">
                <span>
                    Créé le: {formatFullDate(partenaire.date_creat)}<br/>
                    par: <strong>{partenaire.created_by_profile?.username || 'Inconnu'}</strong>
                </span>
                {partenaire.modif_by && (
                    <span>
                        <br/>Modifié le: {formatFullDate(partenaire.last_modif)}<br/>
                        par: <strong>{partenaire.modif_by_profile?.username || 'Inconnu'}</strong>
                    </span>
                )}
              </div>
            </div>

            <div className="admin-row-controls">
              <span style={{fontSize:'0.8rem', color: partenaire.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {partenaire.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              <label className="switch">
                <input type="checkbox" checked={partenaire.status === 'publié'} onChange={() => handleStatusToggle(partenaire)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingPartenaire(partenaire)}><FaEdit /></button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(partenaire)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminPartenairesPage;