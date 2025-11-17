// src/pages/AdminMembersPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle, FaUser } from 'react-icons/fa';
import MemberForm from '../components/MemberForm';
import './AdminActionsPage.css'; // Réutilisation du CSS

const BUCKET_NAME = 'membres';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminMembersPage() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMembre, setEditingMembre] = useState(null);

  async function fetchMembres() {
    setLoading(true);
    const { data, error } = await supabase
      .from('membres')
      .select(`*, created_by_profile:created_by(username), modif_by_profile:modif_by(username)`)
      .order('nom', { ascending: true });

    if (error) setError(error.message);
    else setMembres(data);
    
    setLoading(false);
  }

  useEffect(() => { fetchMembres(); }, []);

  const handleDelete = async (membre) => {
    if (window.confirm(`Supprimer ${membre.nom} ?`)) {
      // Suppression photo
      try {
        const photo = membre.photo;
        if (photo && photo.startsWith(SUPABASE_URL) && photo.includes(`/${BUCKET_NAME}/`)) {
          const path = decodeURIComponent(photo.split(`/${BUCKET_NAME}/`)[1]);
          await supabase.storage.from(BUCKET_NAME).remove([path]);
        }
      } catch (e) { console.warn("Erreur suppression photo:", e); }

      const { error } = await supabase.from('membres').delete().eq('id', membre.id);
      if (error) setError(error.message);
      else await fetchMembres();
    }
  };

  const handleStatusToggle = async (membre) => {
    const newStatus = membre.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = membre.status;
    setMembres(prev => prev.map(m => m.id === membre.id ? { ...m, status: newStatus } : m));

    const { error } = await supabase.from('membres').update({ status: newStatus }).eq('id', membre.id);
    if (error) {
      setError("Erreur update statut");
      setMembres(prev => prev.map(m => m.id === membre.id ? { ...m, status: originalStatus } : m));
    } else {
      await fetchMembres();
    }
  };

  if (editingMembre) {
    return (
      <main className="page-section">
        <Helmet><title>Édition Membre - Admin</title></Helmet>
        <MemberForm 
          membre={editingMembre === 'new' ? {} : editingMembre} 
          onSave={() => { fetchMembres(); setEditingMembre(null); }} 
          onCancel={() => setEditingMembre(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet><title>Admin - Équipe</title></Helmet>
      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Gestion de l'Équipe</h1>
        <button className="cta-button" onClick={() => setEditingMembre('new')}>
          <FaPlusCircle /> Ajouter un membre
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {membres.map(membre => (
          <div className="admin-row" key={membre.id}>
            
            {/* Avatar */}
            <div style={{width:'60px', height:'60px', flexShrink:0, marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f9f9f9', borderRadius:'50%', overflow:'hidden', border:'2px solid #eee'}}>
                {membre.photo ? (
                    <img src={membre.photo} alt={membre.nom} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    <FaUser style={{fontSize:'1.5rem', color:'#ccc'}} />
                )}
            </div>

            <div className="admin-row-info">
              <span className="admin-row-title">{membre.nom}</span>
              <span className="admin-row-date" style={{color:'#0056b3', fontWeight:'500'}}>{membre.role}</span>
              
              <div className="admin-row-metadata">
                <span>Créé le: {formatFullDate(membre.date_creat)} par: <strong>{membre.created_by_profile?.username || 'Inconnu'}</strong></span>
                {membre.modif_by && <span><br/>Modifié le: {formatFullDate(membre.last_modif)} par: <strong>{membre.modif_by_profile?.username || 'Inconnu'}</strong></span>}
              </div>
            </div>

            <div className="admin-row-controls">
              <span style={{fontSize:'0.8rem', color: membre.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {membre.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              <label className="switch">
                <input type="checkbox" checked={membre.status === 'publié'} onChange={() => handleStatusToggle(membre)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingMembre(membre)}><FaEdit /></button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(membre)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminMembersPage;