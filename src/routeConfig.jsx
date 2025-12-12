// src/routeConfig.jsx
import React, { lazy } from 'react'; // 1. Importez 'lazy'

// --- 2. REMPLACEZ TOUS LES IMPORTS STATIQUES PAR CECI ---

// Pages Publiques
const HomePage = lazy(() => import('./pages/HomePage'));
const ActionsPage = lazy(() => import('./pages/ActionsPage')); 
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const PolitiqueConfidentialitePage = lazy(() => import('./pages/PolitiqueConfidentialitePage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PartenairesPage = lazy(() => import('./pages/PartenairesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const ActusPage = lazy(() => import('./pages/ActusPage'));
const PoleCommunicationPage = lazy(() => import('./pages/PoleCommunicationPage'));
const PoleRedactionPage = lazy(() => import('./pages/PoleRedactionPage'));
const PoleEvenementielPage = lazy(() => import('./pages/PoleEvenementielPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
  import AssoMatchPage from './pages/AssoMatchPage'; // <--- Import
import HermesRunnerPage from './pages/HermesRunnerPage'; // Import
// Pages Auth
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));

// Pages Admin
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminActionsPage = lazy(() => import('./pages/AdminActionsPage'));
const AdminActusPage = lazy(() => import('./pages/AdminActusPage'));
const AdminPartenairesPage = lazy(() => import('./pages/AdminPartenairesPage'));
const AdminMembersPage = lazy(() => import('./pages/AdminMembersPage'));
const AdminFaqPage = lazy(() => import('./pages/AdminFaqPage'));
const AdminBlogPage = lazy(() => import('./pages/AdminBlogPage'));
const AdminNewsletterPage = lazy(() => import('./pages/AdminNewsletterPage'));
const AdminDecorsPage = lazy(() => import('./pages/AdminDecorsPage'));
import AdminAssoPage from './pages/AdminAssoPage'; // <--- Import

// Composants de sécurité (Eux, on peut les garder en statique car ils sont légers et critiques)
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
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
      },
      {
        // On peut créer une permission spécifique "can_admin_asso" ou utiliser une existante
        // Pour l'instant, disons qu'on utilise "can_edit_partenaires" ou on crée une <PermissionRoute permission="can_admin_asso" />
        element: <PermissionRoute permission="can_admin_asso" />, // Assurez-vous que cette colonne existe dans 'profiles' comme vu avant
        children: [
          { path: '/admin/assos', element: <AdminAssoPage />, category: 'admin' }
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
  {
    path: '/asso-match',
    element: <AssoMatchPage />,
    name: 'Le Match des Assos',
    category: 'main', // Ou 'hidden' si vous ne voulez pas l'avoir dans le menu principal
  },
  {
    path: '/runner',
    element: <HermesRunnerPage />,
    name: 'Hermes Runner',
    category: 'main', // Ou 'hidden'
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