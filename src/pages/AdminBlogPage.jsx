// src/pages/AdminBlogPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaEdit, FaPlusCircle, FaNewspaper } from 'react-icons/fa';
import BlogForm from '../components/BlogForm';
import './AdminActionsPage.css'; // Réutilisation CSS

const BUCKET_NAME = 'blog';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function AdminBlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  async function fetchArticles() {
    setLoading(true);
    // On utilise les noms de contraintes explicites
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *, 
        created_by_profile:profiles!articles_created_by_fkey(username), 
        modif_by_profile:profiles!articles_modif_by_fkey(username)
      `)
      .order('date_creat', { ascending: false });

    if (error) {
        console.error("Erreur fetchArticles:", error);
        setError(error.message);
    } else {
        setArticles(data);
    }
    setLoading(false);
  }

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (article) => {
    if (window.confirm(`Supprimer l'article "${article.titre}" ?`)) {
      try {
        const img = article.image;
        if (img && img.startsWith(SUPABASE_URL) && img.includes(`/${BUCKET_NAME}/`)) {
          const path = decodeURIComponent(img.split(`/${BUCKET_NAME}/`)[1]);
          await supabase.storage.from(BUCKET_NAME).remove([path]);
        }
      } catch (e) { console.warn("Erreur suppression image:", e); }

      const { error } = await supabase.from('articles').delete().eq('id', article.id);
      if (error) setError(error.message);
      else await fetchArticles();
    }
  };

  const handleStatusToggle = async (article) => {
    const newStatus = article.status === 'publié' ? 'brouillon' : 'publié';
    const originalStatus = article.status;
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: newStatus } : a));

    const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', article.id);
    if (error) {
      setError("Erreur update statut");
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: originalStatus } : a));
    } else {
      await fetchArticles();
    }
  };

  if (editingArticle) {
    return (
      <main className="page-section">
        <Helmet><title>Édition Blog - Admin</title></Helmet>
        <BlogForm 
          article={editingArticle === 'new' ? {} : editingArticle} 
          onSave={() => { fetchArticles(); setEditingArticle(null); }} 
          onCancel={() => setEditingArticle(null)} 
        />
      </main>
    );
  }

  return (
    <main className="page-section">
      <Helmet><title>Admin - Blog</title></Helmet>
      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Gestion du Blog</h1>
        <button className="cta-button" onClick={() => setEditingArticle('new')}>
          <FaPlusCircle /> Rédiger un article
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="admin-list">
        {articles.map(article => (
          <div className="admin-row" key={article.id}>
            
            {/* Image Miniature */}
            <div style={{width:'60px', height:'60px', flexShrink:0, marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f9f9f9', borderRadius:'5px', overflow:'hidden'}}>
                {article.image ? (
                    <img src={article.image} alt="cover" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    <FaNewspaper style={{fontSize:'1.5rem', color:'#ccc'}} />
                )}
            </div>

            <div className="admin-row-info">
              <span className="admin-row-title">{article.titre}</span>
              
              <div className="admin-row-metadata">
                <span>Créé le: {formatFullDate(article.date_creat)} par: <strong>{article.created_by_profile?.username || 'Inconnu'}</strong></span>
                {article.modif_by && <span><br/>Modifié le: {formatFullDate(article.last_modif)} par: <strong>{article.modif_by_profile?.username || 'Inconnu'}</strong></span>}
              </div>
            </div>

            <div className="admin-row-controls">
              <span style={{fontSize:'0.8rem', color: article.status === 'publié' ? 'green' : '#777', marginRight:'10px', fontWeight: 'bold'}}>
                {article.status === 'publié' ? 'PUBLIÉ' : 'BROUILLON'}
              </span>

              <label className="switch">
                <input type="checkbox" checked={article.status === 'publié'} onChange={() => handleStatusToggle(article)} />
                <span className="slider round"></span>
              </label>

              <button className="admin-btn icon-btn" onClick={() => setEditingArticle(article)}><FaEdit /></button>
              <button className="admin-btn icon-btn danger" onClick={() => handleDelete(article)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminBlogPage;