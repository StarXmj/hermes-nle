// generate-sitemap.js
import { createClient } from '@supabase/supabase-js';
import builder from 'xmlbuilder';
import fs from 'fs';
import dotenv from 'dotenv';

// Charger les variables d'environnement (.env)
dotenv.config();

// Configuration
const BASE_URL = 'https://hermes-nle.netlify.app'; // Remplacer par votre vrai domaine plus tard
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  console.log('🗺️  Génération du Sitemap en cours...');

  const root = builder.create('urlset', { encoding: 'UTF-8' })
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  // 1. Pages Statiques
  const staticPages = [
    '/',
    '/about',
    '/actions',
    '/blog',
    '/partenaires',
    '/contact',
    '/mentions-legales',
    '/politique-de-confidentialite',
    '/credits',
    '/plan-du-site'
  ];

  staticPages.forEach(page => {
    const url = root.ele('url');
    url.ele('loc', `${BASE_URL}${page}`);
    url.ele('changefreq', 'monthly');
    url.ele('priority', page === '/' ? '1.0' : '0.8');
  });

  // 2. Articles de Blog (Dynamique)
  const { data: articles, error: errBlog } = await supabase
    .from('articles')
    .select('id, date_creat') // On a besoin de l'ID pour l'URL et la date pour lastmod
    .eq('status', 'publié');

  if (errBlog) console.error("Erreur Blog:", errBlog);
  else {
    articles.forEach(article => {
      const url = root.ele('url');
      url.ele('loc', `${BASE_URL}/blog/${article.id}`);
      url.ele('lastmod', new Date(article.date_creat).toISOString());
      url.ele('changefreq', 'weekly');
      url.ele('priority', '0.7');
    });
  }

  // 3. Actions / Événements (Si vous avez des pages de détail, sinon ignorez)
  // ... (même logique que pour le blog)

  // Écriture du fichier dans le dossier public
  const xml = root.end({ pretty: true });
  fs.writeFileSync('public/sitemap.xml', xml);
  
  console.log('✅ sitemap.xml généré dans le dossier public !');
}

generateSitemap();