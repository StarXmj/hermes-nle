// src/pages/MentionsLegalesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // On l'utilisera pour le lien vers la politique de confidentialité
import { Helmet } from 'react-helmet-async';

// On importe un peu de style pour la page
import './LegalPage.css'; 

function MentionsLegalesPage() {
  return (
    // On réutilise les styles de App.css
    <main className="page-section legal-page">
      <Helmet>
                   <title>Mentions Légales - Hermes by NLE</title>
                    <meta name="description" content="Mentions Légales" />
            </Helmet>
      <div className="section-content">
        <h1>Mentions Légales</h1>
        
        <p>
          Conformément aux dispositions de l'article 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 
          pour la Confiance dans l'économie numérique (L.C.E.N.), il est porté à la connaissance 
          des utilisateurs et visiteurs du site [mettre l'URL de votre site, ex: hermes-nle.fr] 
          les présentes mentions légales.
        </p>

        <article>
          <h2>Article 1 : L'éditeur du site</h2>
          <p>
            L'édition du site est assurée par l'association :
          </p>
          <ul>
            <li><strong>Nom de l'association :</strong> Hermes by NLE</li>
            <li><strong>Forme juridique :</strong> Association loi 1901</li>
            <li><strong>Adresse du siège social :</strong> [Adresse complète de votre association, ex: Maison de l'Étudiant, UPPA, 64000 Pau]</li>
            <li><strong>Adresse e-mail :</strong> [Votre email de contact, ex: contact@hermes-nle.fr]</li>
            <li><strong>Téléphone :</strong> [Votre numéro de téléphone si vous en avez un, sinon laissez vide]</li>
            <li><strong>Numéro RNA :</strong> [Votre numéro W... si vous l'avez, sinon laissez vide]</li>
          </ul>
        </article>
        
        <article>
          <h2>Article 2 : Le directeur de la publication</h2>
          <p>
            Le Directeur de la publication est :
          </p>
          <ul>
            <li><strong>Nom :</strong> [Nom et Prénom du/de la Président(e) de l'asso]</li>
            <li><strong>Qualité :</strong> Président(e) de l'association Hermes by NLE</li>
          </ul>
        </article>

        <article>
          <h2>Article 3 : L'hébergeur du site</h2>
          <p>
            L'hébergement du site est assuré par :
          </p>
          
          {/*
            CHOISISSEZ VOTRE HÉBERGEUR.
            Si vous déployez sur Vercel ou Netlify (très courant en React), voici les infos :
          */}

          {/* OPTION 1 : VERCEL (Si vous utilisez Vercel) */}
          <ul>
            <li><strong>Nom :</strong> Vercel Inc.</li>
            <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</li>
            <li><strong>Contact :</strong> https://vercel.com/contact</li>
          </ul>

          {/* OPTION 2 : NETLIFY (Si vous utilisez Netlify) */}
          {/*
          <ul>
            <li><strong>Nom :</strong> Netlify, Inc.</li>
            <li><strong>Adresse :</strong> 44 Montgomery Street, Suite 300, San Francisco, California 94104, USA</li>
            <li><strong>Contact :</strong> https://www.netlify.com/support/</li>
          </ul>
          */}

          {/* OPTION 3 : AUTRE HÉBERGEUR (OVH, Gandi, etc.) */}
          {/*
          <ul>
            <li><strong>Nom :</strong> [Nom de votre hébergeur]</li>
            <li><strong>Adresse :</strong> [Adresse de l'hébergeur]</li>
            <li><strong>Téléphone :</strong> [Téléphone de l'hébergeur]</li>
          </ul>
          */}
        </article>
        
        <article>
          <h2>Article 4 : Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site (contenus, textes, images, vidéos, logos) constitue une œuvre 
            protégée par la législation en vigueur sur le droit d'auteur et la propriété intellectuelle.
            Sauf autorisation écrite préalable, toute reproduction, représentation, adaptation, 
            modification, partielle ou intégrale de tout élément composant le site, par quelque 
            moyen que ce soit, est interdite sous peine de poursuites judiciaires.
          </p>
          <p>
            Le logo "Hermes by NLE" est la propriété exclusive de l'association.
          </p>
        </article>
        
        <article>
          <h2>Article 5 : Données personnelles</h2>
          <p>
            L'association Hermes by NLE s'engage à ce que la collecte et le traitement de vos 
            données, effectués à partir de ce site, soient conformes au Règlement Général 
            sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
          </p>
          <p>
            Pour plus d'informations sur la gestion de vos données personnelles et pour 
            exercer vos droits, veuillez consulter notre {' '}
            <Link to="/politique-de-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </article>
        
      </div>
    </main>
  );
}

export default MentionsLegalesPage;