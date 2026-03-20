// src/pages/AdminNewsletterPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaCopy, FaEnvelope, FaTrash, FaPlus, FaFilePdf, FaUpload, FaSpinner, FaEdit } from 'react-icons/fa';
import './AdminActionsPage.css';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Formateur spécifique pour n'afficher que le jour/mois/année (pour la chronologie)
const formatSimpleDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState('inscrits');
  const [error, setError] = useState(null);

  // States: Inscrits
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // States: Publications
  const [publications, setPublications] = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State: Édition
  const [editingId, setEditingId] = useState(null);
  
  // NOUVEAU : On initialise la date de parution à la date d'aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    titre: '',
    type_publi: 'newsletter',
    status: 'brouillon',
    date_publication: today, // 👈 Ajout du champ date
    file: null,
    existing_url: '' 
  });

  useEffect(() => {
    if (activeTab === 'inscrits') fetchSubscribers();
    if (activeTab === 'publications') fetchPublications();
  }, [activeTab]);

  // --- LOGIQUE INSCRITS ---
  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setSubscribers(data);
    setLoadingSubs(false);
  };

  const handleCopyAll = () => {
    const allEmails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(allEmails).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm("Supprimer cet abonné ?")) return;
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) setError("Erreur : " + error.message);
    else setSubscribers(subs => subs.filter(sub => sub.id !== id));
  };

  // --- LOGIQUE PUBLICATIONS ---
  const fetchPublications = async () => {
    setLoadingPubs(true);
    // On trie par date de publication (chronologie) plutôt que date_creat
    const { data, error } = await supabase
      .from('publications')
      .select(`
        *,
        creator:profiles!created_by(username),
        modifier:profiles!modif_by(username)
      `)
      .order('date_publication', { ascending: false }); 
      
    if (error) setError(error.message);
    else setPublications(data);
    setLoadingPubs(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('publications')
        .update({ 
          status: newStatus,
          last_modif: new Date().toISOString(),
          modif_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;
      fetchPublications();
    } catch (err) {
      setError("Erreur modification statut : " + err.message);
    }
  };

  const handleEdit = (pub) => {
    setEditingId(pub.id);
    
    // NOUVEAU : Extraire la date au format YYYY-MM-DD pour l'input HTML
    const pubDate = pub.date_publication ? pub.date_publication.substring(0, 10) : today;

    setFormData({
      titre: pub.titre,
      type_publi: pub.type_publi,
      status: pub.status,
      date_publication: pubDate, // 👈 On charge la date existante
      file: null, 
      existing_url: pub.fichier_url
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ titre: '', type_publi: 'newsletter', status: 'brouillon', date_publication: today, file: null, existing_url: '' });
    setShowForm(false);
  };

  // ⚡ LA FONCTION MANQUANTE RÉINTÉGRÉE ICI
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmitPubli = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!editingId && !formData.file) return setError("Veuillez sélectionner un fichier.");

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let publicUrl = formData.existing_url;

      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${formData.type_publi}s/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('publications')
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('publications')
          .getPublicUrl(filePath);
          
        publicUrl = publicUrlData.publicUrl;

        if (editingId && formData.existing_url) {
          const oldPathMatch = formData.existing_url.match(/\/storage\/v1\/object\/public\/publications\/(.+)$/);
          if (oldPathMatch && oldPathMatch[1]) {
            await supabase.storage.from('publications').remove([oldPathMatch[1]]);
          }
        }
      }

      // Payload avec la DATE DE PARUTION choisie par l'admin
      const payload = {
        titre: formData.titre,
        type_publi: formData.type_publi,
        status: formData.status,
        date_publication: new Date(formData.date_publication).toISOString(), // 👈 Envoi de la date
        fichier_url: publicUrl,
        last_modif: new Date().toISOString(),
        modif_by: user?.id
      };

      if (editingId) {
        const { error: dbError } = await supabase.from('publications').update(payload).eq('id', editingId);
        if (dbError) throw dbError;
      } else {
        payload.created_by = user?.id;
        const { error: dbError } = await supabase.from('publications').insert([payload]);
        if (dbError) throw dbError;
      }

      cancelEdit();
      fetchPublications();

    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePubli = async (id, fileUrl) => {
    if (!window.confirm("Supprimer DÉFINITIVEMENT cette publication et son fichier ?")) return;
    
    const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/publications\/(.+)$/);
    if (filePathMatch && filePathMatch[1]) {
      await supabase.storage.from('publications').remove([filePathMatch[1]]);
    }

    const { error } = await supabase.from('publications').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchPublications();
  };

  return (
    <main className="page-section">
      <Helmet>
        <title>Gestion Newsletter & Médias | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour au Tableau de bord</Link>
        <h1>Newsletter & Publications</h1>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        <button className={`tab-button ${activeTab === 'inscrits' ? 'active' : ''}`} onClick={() => setActiveTab('inscrits')}>
          Abonnés Newsletter
        </button>
        <button className={`tab-button ${activeTab === 'publications' ? 'active' : ''}`} onClick={() => setActiveTab('publications')}>
          Journaux & Médias
        </button>
      </div>

      {error && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}

      {/* --- ONGLET: INSCRITS --- */}
      {activeTab === 'inscrits' && (
        <section>
           <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <h2>Inscrits ({subscribers.length})</h2>
            <button className="cta-button" onClick={handleCopyAll} disabled={subscribers.length === 0}>
              <FaCopy /> {copySuccess ? 'Copié !' : 'Copier emails'}
            </button>
          </div>
          {loadingSubs ? <p>Chargement...</p> : (
            <div className="admin-list">
              {subscribers.length > 0 ? subscribers.map(sub => (
                <div className="admin-row" key={sub.id}>
                  <div className="admin-row-info">
                    <span className="admin-row-title"><FaEnvelope style={{color: '#0056b3', marginRight: '8px'}} />{sub.email}</span>
                    <span className="admin-row-date">Inscrit le : {formatDate(sub.created_at)}</span>
                  </div>
                  <div className="admin-row-controls">
                    <button className="admin-btn icon-btn danger" onClick={() => handleDeleteSub(sub.id)}><FaTrash /></button>
                  </div>
                </div>
              )) : <p>Aucun inscrit.</p>}
            </div>
          )}
        </section>
      )}

      {/* --- ONGLET: PUBLICATIONS --- */}
      {activeTab === 'publications' && (
        <section>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center'}}>
            <h2>Publications & Journaux</h2>
            {!showForm && (
              <button className="cta-button" onClick={() => setShowForm(true)}>
                <FaPlus /> Nouvelle Publication
              </button>
            )}
          </div>

          {/* FORMULAIRE (AJOUT / MODIFICATION) */}
          {showForm && (
            <form onSubmit={handleSubmitPubli} className="admin-form" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ddd' }}>
              <h3 style={{marginTop: 0, color: '#333'}}>{editingId ? "✏️ Modifier la publication" : "📄 Nouvelle publication"}</h3>
              
              <div className="form-group">
                <label>Titre *</label>
                <input type="text" required value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Ex: Journal de Mars" />
              </div>
              
              {/* NOUVEAU GRID à 3 colonnes pour inclure la Date */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={formData.type_publi} onChange={e => setFormData({...formData, type_publi: e.target.value})}>
                    <option value="newsletter">Newsletter (PDF/Image)</option>
                    <option value="journal">Journal Asso</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date de parution *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date_publication} 
                    onChange={e => setFormData({...formData, date_publication: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label>Statut initial *</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Fichier (PDF, PNG, JPEG) {editingId && "- Optionnel (laisser vide pour conserver l'actuel)"}</label>
                <input type="file" accept=".pdf,image/*" required={!editingId} onChange={handleFileChange} />
                {editingId && formData.existing_url && <small style={{display: 'block', marginTop: '5px', color: '#666'}}>Fichier actuel : <a href={formData.existing_url} target="_blank" rel="noopener noreferrer">Voir le fichier</a></small>}
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="cta-button" disabled={uploading}>
                  {uploading ? <><FaSpinner className="spin" /> Enregistrement...</> : <><FaUpload /> {editingId ? "Mettre à jour" : "Publier"}</>}
                </button>
                <button type="button" className="admin-btn" onClick={cancelEdit} disabled={uploading}>Annuler</button>
              </div>
            </form>
          )}

          {/* LISTE DES PUBLICATIONS AVEC TRAÇABILITÉ */}
          {loadingPubs ? <p>Chargement...</p> : (
            <div className="admin-list">
              {publications.length > 0 ? publications.map(pub => (
                <div className="admin-row" key={pub.id} style={{ alignItems: 'flex-start' }}>
                  
                  {/* INFOS PRINCIPALES + AUDIT TRAIL */}
                  <div className="admin-row-info" style={{ flex: 1 }}>
                    <span className="admin-row-title" style={{display: 'flex', alignItems: 'center'}}>
                      <FaFilePdf style={{color: '#d32f2f', marginRight: '8px'}} />
                      {pub.titre} 
                      <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: '#eee', marginLeft: '10px', color: '#555' }}>
                        {pub.type_publi}
                      </span>
                    </span>
                    
                    {/* 📅 Mise en avant de la Date de Parution */}
                    <div style={{ color: '#0056b3', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '6px' }}>
                      📅 Parution : {formatSimpleDate(pub.date_publication)}
                    </div>

                    {/* Bloc Audit Trail (Créé / Modifié par) */}
                    <div className="admin-row-metadata" style={{ marginTop: '8px' }}>
                      <div>
                        <strong>Créé le :</strong> {formatDate(pub.date_creat)} 
                        <span style={{marginLeft: '5px'}}><strong>par :</strong> {pub.creator?.username || 'Inconnu'}</span>
                      </div>
                      <div>
                        <strong>Modifié le :</strong> {formatDate(pub.last_modif)} 
                        <span style={{marginLeft: '5px'}}><strong>par :</strong> {pub.modifier?.username || 'Inconnu'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CONTRÔLES : SELECT STATUT + BOUTONS */}
                  <div className="admin-row-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select 
                      value={pub.status} 
                      onChange={(e) => handleStatusChange(pub.id, e.target.value)}
                      className={`status-select ${pub.status === 'publie' ? 'status-publie' : 'status-brouillon'}`}
                      style={{ padding: '6px', borderRadius: '4px' }}
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="publie">Publié</option>
                    </select>

                    <a href={pub.fichier_url} target="_blank" rel="noopener noreferrer" className="admin-btn" title="Voir le fichier">Voir</a>
                    <button className="admin-btn icon-btn" onClick={() => handleEdit(pub)} title="Modifier" style={{color: '#0056b3'}}><FaEdit /></button>
                    <button className="admin-btn icon-btn danger" onClick={() => handleDeletePubli(pub.id, pub.fichier_url)} title="Supprimer"><FaTrash /></button>
                  </div>
                  
                </div>
              )) : <p>Aucune publication pour le moment.</p>}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default AdminNewsletterPage;