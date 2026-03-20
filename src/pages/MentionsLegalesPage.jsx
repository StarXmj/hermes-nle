// src/pages/MentionsLegalesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './LegalPage.css'; 

function MentionsLegalesPage() {
  return (
    <main className="page-section legal-page">
      <Helmet>
        <title>Mentions Légales - Hermès by NLE</title>
        <meta name="description" content="Mentions Légales de l'association Hermès by NLE." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <div className="section-content">
        <h1>Mentions Légales</h1>
        
        <p>
          Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 
          pour la Confiance dans l'économie numérique (L.C.E.N.), il est porté à la connaissance 
          des utilisateurs et visiteurs du site <strong>hermes-nle.fr</strong> les présentes mentions légales.
        </p>

        <article>
          <h2>Article 1 : L'éditeur du site</h2>
          <p>L'édition et la direction du site sont assurées par l'association :</p>
          <ul>
            <li><strong>Nom de l'association :</strong> Hermès by notre liste étudiante (HNLE)</li>
            <li><strong>Forme juridique :</strong> Association loi 1901 (formée le 13 octobre 2025)</li>
            <li><strong>Adresse du siège social :</strong> Maison de l'étudiant, Av. de l'Université, 64000 Pau</li>
            <li><strong>Adresse e-mail :</strong> contact@hermes-nle.fr</li>
            {/*<li><strong>Numéro RNA :</strong> [À COMPLÉTER - ex: W123456789]</li>*/}
          </ul>
        </article>
        
        <article>
          <h2>Article 2 : Le directeur de la publication</h2>
          <p>Le Directeur de la publication est :</p>
          <ul>
            <li><strong>Nom :</strong> Samanah Kolanowski</li>
            <li><strong>Qualité :</strong> Président(e) de l'association Hermès by NLE</li>
          </ul>
        </article>

        <article>
          <h2>Article 3 : L'hébergeur du site</h2>
          <p>
            Ce site utilise une architecture moderne (JAMstack) et est hébergé via le réseau de diffusion de contenu (CDN) et l'infrastructure serverless de Cloudflare :
          </p>
          <ul>
            <li><strong>Nom :</strong> Cloudflare, Inc.</li>
            <li><strong>Adresse :</strong> 101 Townsend St, San Francisco, CA 94107, États-Unis</li>
            <li><strong>Site web :</strong> <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">https://www.cloudflare.com/</a></li>
          </ul>
          <p>
            <em>Les bases de données et l'authentification sont gérées par Supabase (Supabase, Inc., 972 E El Camino Real, Sunnyvale, CA 94087, États-Unis).</em>
          </p>
        </article>
        
        <article>
          <h2>Article 4 : Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site (contenus, textes, images, vidéos, logos, code source) constitue une œuvre 
            protégée par la législation en vigueur sur le droit d'auteur et la propriété intellectuelle.
            Sauf autorisation écrite préalable, toute reproduction, représentation, adaptation, 
            modification, partielle ou intégrale de tout élément composant le site, par quelque 
            moyen que ce soit, est strictement interdite sous peine de poursuites judiciaires.
          </p>
          <p>
            Le logo "Hermès by NLE" est la propriété exclusive de l'association.
          </p>
        </article>
        
        <article>
          <h2>Article 5 : Données personnelles et Cookies</h2>
          <p>
            L'association Hermès by NLE s'engage à ce que la collecte et le traitement de vos 
            données, effectués à partir de ce site, soient conformes au Règlement Général 
            sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
          </p>
          <p>
            Pour plus d'informations sur la gestion de vos données personnelles (notamment concernant la newsletter, la création de compte et les cookies) et pour 
            exercer vos droits de retrait, veuillez consulter notre {' '}
            <Link to="/politique-de-confidentialite" className="font-bold text-blue-600 hover:underline">
              Politique de Confidentialité
            </Link>.
          </p>
        </article>
        
      </div>
    </main>
  );
}

export default MentionsLegalesPage;