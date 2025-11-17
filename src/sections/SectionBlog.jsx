// src/sections/SectionBlog.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ArticleCard from '../components/ArticleCard';
import './SectionBlog.css'; // Un peu de CSS spécifique si besoin

function SectionBlog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'publié') // Seulement les publiés
        .order('date_creat', { ascending: false }) // Les plus récents d'abord
        .limit(3); // On en prend 3

      if (error) console.error("Erreur blog home:", error);
      else setArticles(data);
      
      setLoading(false);
    }
    loadLatestArticles();
  }, []);

  if (!loading && articles.length === 0) return null; // On cache la section si vide

  return (
    <section className="page-section">
      <div className="section-content">
        <h2>Le Blog du Campus</h2>
        <p>Actualités, conseils et vie étudiante.</p>

        <div className="blog-grid-home">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div style={{marginTop: '2rem', textAlign: 'center'}}>
          <a href="/blog" className="cta-button secondary">Tous les articles</a>
        </div>
      </div>
    </section>
  );
}

export default SectionBlog;