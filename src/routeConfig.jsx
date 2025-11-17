// src/routeConfig.jsx
import React from 'react';

// 1. On importe tous les composants de page
import HomePage from './pages/HomePage';
// --- CORRECTION : On importe le VRAI fichier de la page publique ---
import ActionsPage from './pages/ActionsPage'; 
import ContactPage from './pages/ContactPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CreditsPage from './pages/CreditsPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage';
import PartenairesPage from './pages/PartenairesPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard'; 
import ProtectedRoute from './components/ProtectedRoute';
import AdminActusPage from './pages/AdminActusPage';
// --- CORRECTION : On importe le BON composant admin ---
import AdminActionsPage from './pages/AdminActionsPage'; 
import AdminPartenairesPage from './pages/AdminPartenairesPage';
// --- CORRECTION : On SUPPRIME le composant "PublicActionsPage" temporaire ---
// const PublicActionsPage = () => ( ... ); // <- Supprimé
import AdminMembersPage from './pages/AdminMembersPage';
import AdminFaqPage from './pages/AdminFaqPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
// 2. On crée la liste "maîtresse" de toutes les routes
export const appRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    name: 'Connexion',
    category: 'auth' // Hors du plan de site
  },{
    path: '/mot-de-passe-oublie',
    element: <ForgotPasswordPage />,
    name: 'Mot de passe oublié',
    category: 'auth'
  },
  {
    path: '/update-password',
    element: <UpdatePasswordPage />,
    name: 'Mise à jour mot de passe',
    category: 'auth'
  },
  {
    // C'est le "Gardien"
    element: <ProtectedRoute />, 
    // Toutes les routes "enfants" (children) seront protégées
    children: [
      {
        path: '/admin',
        element: <AdminDashboard />,
        name: 'Admin',
        category: 'admin' // Hors du plan de site
      },
      {
        path: '/admin/actions',
        element: <AdminActionsPage />, // Utilise le VRAI composant admin
        name: 'Admin Actions',
        category: 'admin'
      },{
  path: '/admin/actus',
  element: <AdminActusPage />,
  name: 'Admin Actus',
  category: 'admin'
},{
  path: '/admin/partenaires',
  element: <AdminPartenairesPage />,
  name: 'Admin Partenaires',
  category: 'admin'
},{
  path: '/admin/membres',
  element: <AdminMembersPage />,
  name: 'Admin Membres',
  category: 'admin'
},{
  path: '/admin/faq',
  element: <AdminFaqPage />,
  name: 'Admin FAQ',
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
    // --- CORRECTION : Utilise le VRAI composant importé ---
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