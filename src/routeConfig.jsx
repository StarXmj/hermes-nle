// src/routeConfig.js
import React from 'react';

// 1. On importe tous les composants de page
import HomePage from './pages/HomePage';
import ActionsPage from './pages/ActionsPage';
import ContactPage from './pages/ContactPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CreditsPage from './pages/CreditsPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage'; // <-- IMPORTER ICI
import PartenairesPage from './pages/PartenairesPage'; // <-- IMPORTER
// 2. On crée la liste "maîtresse" de toutes les routes
export const appRoutes = [
  // --- Catégorie "main" (pour la navigation) ---
  {
    path: '/',
    element: <HomePage />,
    name: 'Accueil',
    category: 'main',
  },
  {
    path: '/about',
    element: <AboutPage />,
    name: "C'est quoi ?",
    category: 'main',
  },
  {
    path: '/actions',
    element: <ActionsPage />,
    name: 'Nos Actions',
    category: 'main',
  },
  {
    path: '/partenaires',
    element: <PartenairesPage />,
    name: 'Nos Partenaires',
    category: 'main',
  },
  
  
  // 2. AJOUTER LA ROUTE POUR LES ACTUS
  
  {
    path: '/contact',
    element: <ContactPage />,
    name: 'Contact (Nous rejoindre / Devenir partenaire)',
    category: 'main',
  },
  
  // --- Catégorie "legal" (pour le footer) ---
  {
    path: '/mentions-legales',
    element: <MentionsLegalesPage />,
    name: 'Mentions Légales',
    category: 'legal',
  },
  {
    path: '/politique-de-confidentialite',
    element: <PolitiqueConfidentialitePage />,
    name: 'Politique de Confidentialité',
    category: 'legal',
  },
  {
    path: '/credits',
    element: <CreditsPage />,
    name: 'Crédits',
    category: 'legal',
  },
  {
    path: '/plan-du-site',
    element: <SitemapPage />,
    name: 'Plan du site',
    category: 'legal',
  },
];