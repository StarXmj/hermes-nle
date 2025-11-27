// src/pages/AdminFaqPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle, FaQuestionCircle } from 'react-icons/fa';
import FaqForm from '../components/FaqForm';
import './AdminActionsPage.css';

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  async function fetchFaqs() {
    setLoading(true);
    
    // CORRECTION : On utilise la syntaxe "profiles!nom_contrainte(username)"
    // Cela lève toute ambiguïté pour Supabase.
    const { data, error } = await supabase
      .from('faq')
      .select(`
        *, 
        created_by_profile:profiles!faq_created_by_fkey(username), 
        modif_by_profile:profiles!faq_modif_by_fkey(username)
      `)
      .order('date_creat', { ascending: false });

    if (error) {
      setError(error.message);
      console.error("Erreur fetchFaqs:", error); // Utile pour le debug
    } else {
      setFaqs(data);
    }
    
    setLoading(false);
  }

  useEffect(() => { fetchFaqs(); }, []);

  const handleDelete = async (faq) => {
    if (window.confirm("Supprimer cette question ?")) {
      const { error } = await supabase.from('faq').delete().eq('id', faq.id);
      if (error) setError(error.message);
      else await fetchFaqs();
    }
  };

  const handleStatusToggle = async (faq) => {
    const newStatus = faq.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = faq.status;
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, status: newStatus } : f));

    const { error } = await supabase.from('faq').update({ status: newStatus }).eq('id', faq.id);
    if (error) {
      setError("Erreur update statut");
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, status: originalStatus } : f));
    } else {
      await fetchFaqs();
    }
  };

  if (editingFaq) {
    return (
      <main className="page-section">
<Helmet>
  <title>Édition FAQ | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>        <FaqForm 
          faq={editingFaq === 'new' ? {} : editingFaq} 
          onSave={() => { fetchFaqs(); setEditingFaq(null); }} 
          onCancel={() => setEditingFaq(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
<Helmet>
  <title>Gestion FAQ | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Gestion de la FAQ</h1>
        <button className="cta-button" onClick={() => setEditingFaq('new')}>
          <FaPlusCircle /> Ajouter une question
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {faqs.map(faq => (
          <div className="admin-row" key={faq.id}>
            
            <div className="admin-row-info">
              <span className="admin-row-title" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <FaQuestionCircle style={{color:'#0056b3'}}/> 
                {faq.question}
              </span>
              
              <div className="admin-row-metadata">
                <span>Créé le: {formatFullDate(faq.date_creat)} par: <strong>{faq.created_by_profile?.username || 'Inconnu'}</strong></span>
                {faq.modif_by && <span><br/>Modifié le: {formatFullDate(faq.last_modif)} par: <strong>{faq.modif_by_profile?.username || 'Inconnu'}</strong></span>}
              </div>
            </div>

            <div className="admin-row-controls">
              <span style={{fontSize:'0.8rem', color: faq.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {faq.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              <label className="switch">
                <input type="checkbox" checked={faq.status === 'publié'} onChange={() => handleStatusToggle(faq)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingFaq(faq)}><FaEdit /></button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(faq)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminFaqPage;