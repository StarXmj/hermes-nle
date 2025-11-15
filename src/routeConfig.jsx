// src/routeConfig.jsx
import React from 'react';

// 1. On importe tous les composants de page
import HomePage from './pages/HomePage';
// import ActionsPage from './pages/ActionsPage'; // <-- PROBLÈME : C'est un composant Admin
import ContactPage from './pages/ContactPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CreditsPage from './pages/CreditsPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage';
import PartenairesPage from './pages/PartenairesPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; // Renommé pour plus de clarté
import ProtectedRoute from './components/ProtectedRoute';

// --- CORRECTION : Importer le BON composant admin ---
import AdminActionsPage from './pages/AdminActionsPage'; 

// --- CORRECTION : Importer le VRAI composant public ---
// Pour l'instant, c'est un placeholder. Remplacez-le par votre vrai composant de page publique.
const PublicActionsPage = () => (
  <main className="page-section">
    <div className="section-content">
      <h1>Nos Actions</h1>
      <p>Contenu de la page publique des actions (timeline, filtres, etc.) à venir.</p>
      <p><i>(Vous devez remplacer le contenu du fichier src/pages/ActionsPage.jsx par ce code)</i></p>
    </div>
  </main>
);


// 2. On crée la liste "maîtresse" de toutes les routes
export const appRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    name: 'Connexion',
    category: 'auth' // Hors du plan de site
  },
  {
    // C'est le "Gardien"
    element: <ProtectedRoute />, 
    // Toutes les routes "enfants" (children) seront protégées
    children: [
      {
        path: '/admin',
        element: <AdminDashboard />, // Utilise le bon import
        name: 'Admin',
        category: 'admin' // Hors du plan de site
      },
      // --- CORRECTION : Ajout de la route admin manquante ---
      {
        path: '/admin/actions',
        element: <AdminActionsPage />, // Utilise le VRAI composant admin
        name: 'Admin Actions',
        category: 'admin'
      }
    ]
  },
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
    // --- CORRECTION : Utilise le placeholder pour la page publique ---
    path: '/actions',
    element: <PublicActionsPage />, 
    name: 'Nos Actions',
    category: 'main',
  },
  {
    path: '/partenaires',
    element: <PartenairesPage />,
    name: 'Nos Partenaires',
    category: 'main',
  },
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