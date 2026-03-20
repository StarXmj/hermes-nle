// src/pages/CreditsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './LegalPage.css'; 

function CreditsPage() {
  return (
    <main className="page-section legal-page">
      <Helmet>
        <title>Crédits - Hermès by NLE</title>
        <meta name="description" content="Crédits, technologies et ressources utilisées pour la création du site Hermès by NLE." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <div className="section-content">
        <h1>Crédits</h1>
        
        <article>
          <h2>Conception et Développement</h2>
          <p>
            Ce site a été pensé, conçu et développé sur-mesure pour les besoins de l'association <strong>Hermès by NLE</strong>.
          </p>
          <p>
            <strong>Direction technique et développement :</strong> Joly Matéo
            <br />
          </p>
        </article>

        <article>
          <h2>Stack Technique & Technologies</h2>
          <p>Ce site web moderne a été construit (JAMstack) grâce aux technologies open-source et services suivants :</p>
          <ul>
            <li><strong>Frontend :</strong> <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a> propulsé par <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a>.</li>
            <li><strong>Routage :</strong> <a href="https://reactrouter.com/" target="_blank" rel="noopener noreferrer">React Router</a>.</li>
            <li><strong>Design & Styles :</strong> <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">Tailwind CSS</a> et CSS modulaire.</li>
            <li><strong>Backend & Base de données :</strong> <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer">Supabase</a> (PostgreSQL, Authentification, Storage).</li>
            <li><strong>Hébergement & CDN :</strong> <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">Cloudflare</a>.</li>
          </ul>
        </article>

        <article>
          <h2>Ressources Graphiques et Sonores</h2>
          <p>
            Plusieurs ressources visuelles et sonores ont été utilisées pour enrichir l'expérience utilisateur, notamment pour notre espace d'arcade (Hermès Runner) :
          </p>
          <ul>
            
            <li>
              <strong>Icônes de navigation :</strong> Bibliothèque <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer">React-Icons</a> (FontAwesome, Material Design).
            </li>
            <li>
              <strong>Logos des partenaires :</strong> Les logos affichés dans la section "Partenaires" sont la propriété intellectuelle de leurs sociétés respectives et sont utilisés avec leur aimable autorisation.
            </li>
          </ul>
        </article>

        <article>
          <h2>Hébergement & Mentions Légales</h2>
          <p>
            Les informations légales complètes ainsi que l'adresse détaillée de notre hébergeur 
            sont disponibles sur notre page de {' '}
            <Link to="/mentions-legales" className="font-bold text-blue-600 hover:underline">
              Mentions Légales
            </Link>.
          </p>
        </article>
        
      </div>
    </main>
  );
}

export default CreditsPage;