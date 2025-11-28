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
      {/* 1. SEO Standard */}
      <title>{article.titre} | Hermes by NLE</title>
      <meta name="description" content={article.resume || "Découvrez cet article sur le blog de la vie étudiante Hermes by NLE."} />
      {/* URL Canonique : Important pour éviter le contenu dupliqué */}
      <link rel="canonical" href={`https://hermes-nle.netlify.app/blog/${article.id}`} />

      {/* 2. Facebook / Open Graph (Essentiel pour le partage) */}
      <meta property="og:site_name" content="Hermes by NLE" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={article.titre} />
      <meta property="og:description" content={article.resume || "Article du blog étudiant Hermes by NLE"} />
      {/* Image de partage : utilise l'image de l'article ou une image par défaut */}
      <meta property="og:image" content={article.image || "https://hermes-nle.netlify.app/images/default-share-image.jpg"} />
      <meta property="og:url" content={`https://hermes-nle.netlify.app/blog/${article.id}`} />
      
      {/* Dates pour les moteurs de recherche */}
      <meta property="article:published_time" content={article.date_creat} />
      {article.last_modif && <meta property="article:modified_time" content={article.last_modif} />}
      <meta property="article:author" content={article.created_by_profile?.username || "Hermes by NLE"} />

      {/* 3. Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={article.titre} />
      <meta name="twitter:description" content={article.resume} />
      <meta name="twitter:image" content={article.image || "https://hermes-nle.netlify.app/images/default-share-image.jpg"} />
    
    {/* Données Structurées (Schema.org) pour Google */}
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.titre,
    "description": article.resume,
    "image": [article.image || "URL_DEFAUT"],
    "datePublished": article.date_creat,
    "dateModified": article.last_modif || article.date_creat,
    "author": {
      "@type": "Person",
      "name": article.created_by_profile?.username || "Hermes by NLE"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hermes by NLE",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hermes-nle.netlify.app/logo-hermes.png" // Assurez-vous que cette image existe
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://hermes-nle.netlify.app/blog/${article.id}`
    }
  })}
</script>
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://hermes-nle.netlify.app/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "Le Blog",
      "item": "https://hermes-nle.netlify.app/blog"
    },{
      "@type": "ListItem",
      "position": 3,
      "name": article.titre
    }]
  })}
</script>
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