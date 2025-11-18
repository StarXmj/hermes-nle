// src/pages/ArticleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import DOMPurify from 'dompurify'; // <--- 1. IMPORT SÉCURITÉ
import './ArticleDetailPage.css';

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*, created_by_profile:created_by(username)')
        .eq('id', id)
        .eq('status', 'publié')
        .single();

      if (error) console.error("Erreur article:", error);
      else setArticle(data);
      
      setLoading(false);
    }
    loadArticle();
  }, [id]);

  if (loading) return <div className="page-section"><p>Chargement...</p></div>;
  if (!article) return <div className="page-section"><p>Article introuvable.</p></div>;

  // 2. NETTOYAGE DU HTML (SÉCURITÉ)
  const cleanContent = DOMPurify.sanitize(article.contenu);

  return (
    <main className="page-section article-detail-page">
      <Helmet>
        <title>{article.titre} - Blog Hermes</title>
        <meta name="description" content={article.resume} />
      </Helmet>

      <div className="article-container">
        <Link to="/blog" className="back-link"><FaArrowLeft /> Retour au blog</Link>

        <header className="article-header">
          <h1>{article.titre}</h1>
          <div className="article-meta-detail">
            <span><FaCalendarAlt /> {new Date(article.date_creat).toLocaleDateString('fr-FR')}</span>
            <span>Par <strong>{article.created_by_profile?.username || 'La Rédaction'}</strong></span>
          </div>
        </header>

        {article.image && (
          <div className="article-cover-image">
            {/* 3. AJOUT DU LAZY LOADING (PERFORMANCE) */}
            <img src={article.image} alt={article.titre} loading="lazy" />
          </div>
        )}

        <div 
          className="article-content ql-editor"
          // 4. UTILISATION DU CONTENU NETTOYÉ
          dangerouslySetInnerHTML={{ __html: cleanContent }} 
        />
      </div>
    </main>
  );
}

export default ArticleDetailPage;