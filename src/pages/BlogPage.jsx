// src/pages/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';
import '../sections/SectionBlog.css'; // On réutilise la grille

function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'publié')
        .order('date_creat', { ascending: false });

      if (error) console.error("Erreur blog page:", error);
      else setArticles(data);
      
      setLoading(false);
    }
    loadAllArticles();
  }, []);

  return (
    <main className="page-section">
      <Helmet>
        <title>Le Blog - Hermes by NLE</title>
        <meta name="description" content="Retrouvez tous nos articles sur la vie étudiante à Pau." />
      </Helmet>

      <div className="section-content">
          <header className="blog-page-header">

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
         Notre <span className="text-hermes-primary">Blog</span>
          <p>Conseils, retours d'expérience et focus sur la vie associative.</p>

        </h1>
</header>
        {loading ? (
          <p>Chargement...</p>
        ) : articles.length > 0 ? (
          <div className="blog-grid-home">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p>Aucun article publié pour le moment.</p>
        )}
      </div>
    </main>
  );
}

export default BlogPage;