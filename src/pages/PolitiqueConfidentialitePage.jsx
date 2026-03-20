// src/pages/PolitiqueConfidentialitePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './LegalPage.css'; 

function PolitiqueConfidentialitePage() {
  return (
    <main className="page-section legal-page">
      <Helmet>
        <title>Politique de Confidentialité - Hermès by NLE</title>
        <meta name="description" content="Politique de Confidentialité et gestion des données personnelles de l'association Hermès by NLE." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <div className="section-content">
        <h1>Politique de Confidentialité</h1>
        
        <p>
          Cette politique de confidentialité décrit comment l'association Hermès by NLE 
          collecte, utilise et protège les informations que vous nous transmettez 
          lorsque vous utilisez ce site (accessible à l'adresse <strong>hermes-nle.fr</strong>).
        </p>

        <article>
          <h2>Article 1 : Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est l'association 
            <strong> Hermès by notre liste étudiante (HNLE)</strong>, dont le siège est situé à la 
            Maison de l'étudiant, Av. de l'Université, 64000 Pau.
          </p>
          <p>
            Pour toute question relative à la protection de vos données, vous pouvez 
            nous contacter à l'adresse e-mail : <strong>contact@hermes-nle.fr</strong>.
          </p>
        </article>
        
        <article>
          <h2>Article 2 : Données collectées</h2>
          <p>
            Dans le cadre de l'utilisation de notre site, nous sommes susceptibles de collecter 
            les données personnelles suivantes :
          </p>
          <ul>
            <li><strong>Formulaires de contact :</strong> Nom, Prénom, Adresse e-mail, contenu du message.</li>
            <li><strong>Newsletter :</strong> Adresse e-mail.</li>
            <li><strong>Espace multijoueur / Mini-jeu :</strong> Pseudonyme, Adresse e-mail (facultative), scores enregistrés.</li>
            <li><strong>Espace Administration :</strong> Données de connexion (e-mail, mot de passe chiffré) réservées aux membres du bureau.</li>
          </ul>
        </article>

        <article>
          <h2>Article 3 : Finalités de la collecte</h2>
          <p>
            Vos données sont collectées sur la base de votre consentement ou de notre intérêt légitime, et sont utilisées 
            pour les finalités suivantes :
          </p>
          <ul>
            <li>Répondre à vos demandes de contact ("Nous rejoindre", "Devenir partenaire", etc.).</li>
            <li>Vous envoyer notre newsletter et nos publications numériques.</li>
            <li>Gérer les classements (leaderboard) et les comptes joueurs de l'espace Arcade.</li>
            <li>Assurer la sécurité et l'administration du site web.</li>
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
              <strong>Pour la newsletter :</strong> Vos données sont conservées jusqu'à ce que 
              vous vous désinscriviez (via le lien présent dans nos e-mails ou sur simple demande).
            </li>
            <li>
              <strong>Pour les demandes de contact :</strong> Le temps de traiter 
              votre demande, puis pour une durée maximale de 3 ans après le dernier contact.
            </li>
            <li>
              <strong>Pour les comptes joueurs :</strong> Jusqu'à la demande de suppression du compte par l'utilisateur.
            </li>
          </ul>
        </article>
        
        <article>
          <h2>Article 5 : Destinataires et Hébergement des données</h2>
          <p>
            Les données collectées sont exclusivement destinées aux membres habilités 
            du bureau de l'association Hermès by NLE. <strong>Elles ne sont en aucun cas vendues, cédées ou louées à des tiers.</strong>
          </p>
          <p>
            Sur le plan technique, vos données sont stockées de manière sécurisée sur les serveurs de notre prestataire 
            technique <strong>Supabase</strong>, qui agit en tant que sous-traitant et respecte les normes de sécurité internationales (RGPD).
          </p>
        </article>

        <article>
          <h2>Article 6 : Sécurité des données</h2>
          <p>
            L'association s'engage à mettre en œuvre les mesures techniques 
            appropriées pour garantir la sécurité de vos données. L'accès à la base de données est protégé par des politiques de sécurité strictes (Row Level Security) et les mots de passe sont systématiquement chiffrés.
          </p>
        </article>

        <article>
          <h2>Article 7 : Vos droits (Loi "Informatique et Libertés" et RGPD)</h2>
          <p>
            Conformément à la réglementation en vigueur, vous disposez des droits suivants 
            concernant vos données personnelles :
          </p>
          <ul>
            <li>Droit d'accès et de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la limitation et à l'opposition du traitement</li>
            <li>Droit à la portabilité des données</li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter par e-mail à 
            <strong> contact@hermes-nle.fr</strong> en précisant l'objet de votre demande.
          </p>
        </article>

        <article>
          <h2>Article 8 : Gestion des Cookies</h2>
          <p>
            Lors de votre navigation sur ce site, des cookies peuvent être déposés sur votre terminal :
          </p>
          <ul>
            <li><strong>Cookies techniques (strictement nécessaires) :</strong> Ils permettent le bon fonctionnement du site, la sauvegarde de vos préférences d'affichage (thème de couleurs) et le maintien de votre session de connexion (authentification). Ils ne requièrent pas de consentement préalable.</li>
            <li><strong>Cookies d'analyse / statistiques :</strong> Nous utilisons un outil de mesure d'audience anonymisé pour comprendre comment notre site est utilisé et l'améliorer. Vous pouvez gérer vos préférences via le bandeau de consentement affiché lors de votre première visite.</li>
          </ul>
        </article>

      </div>
    </main>
  );
}

export default PolitiqueConfidentialitePage;