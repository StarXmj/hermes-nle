// src/pages/SitemapPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// 1. ON IMPORTE LA MÊME LISTE DE ROUTES
import { appRoutes } from '../routeConfig.jsx';

// (On n'a plus besoin d'importer LegalPage.css, car c'est dans App.jsx)

function SitemapPage() {

  // 2. On filtre les listes en fonction de leur catégorie
  const mainPages = appRoutes.filter(route => route.category === 'main');
  const legalPages = appRoutes.filter(route => route.category === 'legal');

  return (
    <main className="page-section legal-page">
      <Helmet>
                   <title>Site Maps - Hermes by NLE</title>
                    <meta name="description" content="Site Maps" />
            </Helmet>
      <div className="section-content">
        <h1>Plan du site</h1>
        
        <article>
          <h2>Navigation principale</h2>
          <ul>
            {/* 3. On génère la liste "main" automatiquement */}
            {mainPages.map((route, index) => (
              <li key={`main-${index}`}>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Informations</h2>
          <ul>
            {/* 4. On génère la liste "legal" automatiquement */}
            {legalPages.map((route, index) => (
              <li key={`legal-${index}`}>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))}
          </ul>
        </article>
        
      </div>
    </main>
  );
}

export default SitemapPage;