// src/pages/PolitiqueConfidentialitePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// On réutilise le même CSS que pour les mentions légales
import './LegalPage.css'; 

function PolitiqueConfidentialitePage() {
  return (
    <main className="page-section legal-page">
      <Helmet>
                   <title>Politique Confidentialité - Hermes by NLE</title>
                    <meta name="description" content="Politique Confidentialité" />
            </Helmet>
      <div className="section-content">
        <h1>Politique de Confidentialité</h1>
        
        <p>
          Cette politique de confidentialité décrit comment l'association Hermes by NLE 
          collecte, utilise et protège les informations que vous nous transmettez 
          lorsque vous utilisez ce site (accessible à l'adresse https://www.ionos.fr/tools/analyse-site-web).
        </p>

        <article>
          <h2>Article 1 : Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est l'association 
            Hermes by NLE, dont le siège est situé à 
            [Adresse de votre association (la même que dans les mentions légales)].
          </p>
          <p>
            Pour toute question relative à la protection de vos données, vous pouvez 
            contacter le responsable à l'adresse e-mail : 
            [Votre email de contact, ex: contact@hermes-nle.fr].
          </p>
        </article>
        
        <article>
          <h2>Article 2 : Données collectées</h2>
          <p>
            Nous sommes susceptibles de collecter les données personnelles suivantes 
            lorsque vous utilisez nos formulaires de contact ou d'inscription à la newsletter :
          </p>
          <ul>
            <li>Nom et Prénom</li>
            <li>Adresse e-mail</li>
            <li>[Toute autre donnée que vous demandez, ex: "Numéro étudiant", "Filière", etc. Si vous ne demandez que l'email, enlevez le reste.]</li>
          </ul>
        </article>

        <article>
          <h2>Article 3 : Finalités de la collecte</h2>
          <p>
            Vos données sont collectées sur la base de votre consentement et sont utilisées 
            pour les finalités suivantes :
          </p>
          <ul>
            <li>Répondre à vos demandes de contact ("Nous rejoindre", "Devenir partenaire").</li>
            <li>Vous envoyer notre newsletter (si vous vous y êtes inscrit).</li>
            <li>[Toute autre utilisation, ex: "Gérer votre inscription à un événement"]</li>
          </ul>
        </article>
        
        <article>
          <h2>Article 4 : Durée de conservation</h2>
          <p>
            Vos données sont conservées pour une durée n'excédant pas celle nécessaire 
            aux finalités pour lesquelles elles ont été collectées :
          </p>
          <ul>
            <li>
              <strong>Pour la newsletter :</strong> Vos données sont conservées tant que 
              vous ne vous désinscrivez pas (via le lien de désinscription).
            </li>
            <li>
              <strong>Pour les demandes de contact :</strong> Le temps de traiter 
              votre demande, puis pour une durée maximale de [ex: 3 ans] après 
              le dernier contact.
            </li>
          </ul>
        </article>
        
        <article>
          <h2>Article 5 : Destinataires des données</h2>
          <p>
            Les données collectées sont exclusivement destinées aux membres habilités 
            du bureau de l'association Hermes by NLE.
          </p>
          <p>
            Elles ne sont en aucun cas vendues, cédées ou louées à des tiers.
          </p>
        </article>

        <article>
          <h2>Article 6 : Sécurité des données</h2>
          <p>
            L'association s'engage à mettre en œuvre les mesures techniques et 
            organisationnelles appropriées pour garantir un niveau de sécurité 
            adapté au risque.
          </p>
        </article>

        <article>
          <h2>Article 7 : Vos droits (Loi "Informatique et Libertés" et RGPD)</h2>
          <p>
            Conformément à la réglementation en vigueur, vous disposez des droits suivants 
            concernant vos données personnelles :
          </p>
          <ul>
            <li>Droit d'accès</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité des données</li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter par e-mail à 
            [Votre email de contact, ex: contact@hermes-nle.fr] 
            en justifiant de votre identité.
          </p>
        </article>

        <article>
          <h2>Article 8 : Cookies</h2>
          <p>
            Ce site [n'utilise pas de cookies / est susceptible d'utiliser des cookies techniques] 
            strictement nécessaires à son fonctionnement et à la mesure d'audience 
            (ex: [si vous mettez un outil de stats simple comme Plausible/Matomo]).
          </p>
          <p>
            [Si vous utilisez Google Analytics, vous DEVEZ le mentionner ici et mettre en place un bandeau de consentement].
          </p>
        </article>

      </div>
    </main>
  );
}

export default PolitiqueConfidentialitePage;