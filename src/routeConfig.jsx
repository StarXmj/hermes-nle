// src/routeConfig.jsx
import React from 'react';

// Pages Publiques
import HomePage from './pages/HomePage';
import ActionsPage from './pages/ActionsPage'; 
import ContactPage from './pages/ContactPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CreditsPage from './pages/CreditsPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage';
import PartenairesPage from './pages/PartenairesPage';
import BlogPage from './pages/BlogPage';
import ActusPage from './pages/ActusPage'; // <--- Import
import ArticleDetailPage from './pages/ArticleDetailPage';
import PoleCommunicationPage from './pages/PoleCommunicationPage';
import PoleRedactionPage from './pages/PoleRedactionPage';
import PoleEvenementielPage from './pages/PoleEvenementielPage';
// Pages Auth
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

// Pages Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminActionsPage from './pages/AdminActionsPage';
import AdminActusPage from './pages/AdminActusPage';
import AdminPartenairesPage from './pages/AdminPartenairesPage';
import AdminMembersPage from './pages/AdminMembersPage';
import AdminFaqPage from './pages/AdminFaqPage';
import AdminBlogPage from './pages/AdminBlogPage';
import AdminNewsletterPage from './pages/AdminNewsletterPage';
import AdminDecorsPage from './pages/AdminDecorsPage'; // <--- Import
// Composants de sécurité
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';

import NotFoundPage from './pages/NotFoundPage'; // Créez ce composant

export const appRoutes = [
  // --- Authentification ---
  {
    path: '/login',
    element: <LoginPage />,
    category: 'auth'
  },
  {
    path: '/mot-de-passe-oublie',
    element: <ForgotPasswordPage />,
    category: 'auth'
  },
  {
    path: '/update-password',
    element: <UpdatePasswordPage />,
    category: 'auth'
  },

  // --- ZONE ADMIN SÉCURISÉE ---
  {
    // 1. Premier niveau : Il faut être connecté
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminDashboard />, // Le dashboard est accessible à tous les connectés
        category: 'admin'
      },
      
      // 2. Second niveau : Il faut la permission spécifique
      
      // Gestion Actions
      {
        element: <PermissionRoute permission="can_edit_actions" />,
        children: [
          { path: '/admin/actions', element: <AdminActionsPage />, category: 'admin' }
        ]
      },

      // Gestion Actus
      {
        element: <PermissionRoute permission="can_edit_actus" />,
        children: [
          { path: '/admin/actus', element: <AdminActusPage />, category: 'admin' }
        ]
      },

      // Gestion Partenaires
      {
        element: <PermissionRoute permission="can_edit_partenaires" />,
        children: [
          { path: '/admin/partenaires', element: <AdminPartenairesPage />, category: 'admin' }
        ]
      },

      // Gestion Membres
      {
        element: <PermissionRoute permission="can_edit_membres" />,
        children: [
          { path: '/admin/membres', element: <AdminMembersPage />, category: 'admin' }
        ]
      },

      // Gestion FAQ
      {
        element: <PermissionRoute permission="can_edit_faq" />,
        children: [
          { path: '/admin/faq', element: <AdminFaqPage />, category: 'admin' }
        ]
      },

      // Gestion Blog
      {
        element: <PermissionRoute permission="can_edit_blog" />,
        children: [
          { path: '/admin/blog', element: <AdminBlogPage />, category: 'admin' }
        ]
      },

      // Gestion Newsletter
      {
        element: <PermissionRoute permission="can_edit_newsletter" />,
        children: [
          { path: '/admin/newsletter', element: <AdminNewsletterPage />, category: 'admin' }
        ]
      },
      {
        
        // Pour l'instant on le rend accessible aux admins généraux (ou réutiliser une permission existante)
        element: <PermissionRoute permission="can_edit_decor" />,
      children: [
        {path: '/admin/decors',
        element: <AdminDecorsPage />,
        category: 'admin'}
        ]
      }
    ]
  },

  // --- Pages Publiques (Navigation Principale) ---
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
    path: '/communication',
    element: <PoleCommunicationPage />,
    name: 'Pôle Communication',
    category: 'hidden', // 'hidden' car pas directement dans le menu principal pour l'instant
  },
  {
    path: '/redaction',
    element: <PoleRedactionPage />,
    name: 'Pôle Rédaction',
    category: 'hidden',
  },
  {
    path: '/evenementiel',
    element: <PoleEvenementielPage />,
    name: 'Pôle Événementiel',
    category: 'hidden',
  },
  {
    path: '/actions',
    element: <ActionsPage />,
    name: 'Nos Évènements',
    category: 'main',
  },
  {
    path: '/actualites',
    element: <ActusPage />,
    name: 'Actualités',
    category: 'main',
  },
  {
    path: '/blog',
    element: <BlogPage />,
    name: 'Le Blog',
    category: 'main',
  },
  {
    path: '/blog/:id', // Route dynamique pour l'article
    element: <ArticleDetailPage />,
    name: 'Article',
    category: 'hidden', 
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
    name: 'Contact',
    category: 'main',
  },
 
  // --- Pages Légales (Footer) ---
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
  {
    path: '*',
    element: <NotFoundPage />,
    category: 'hidden'
  }
];