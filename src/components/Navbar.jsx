import React, { useState, useEffect } from 'react';
import HermesLogo from '../assets/logo-hermes.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { usePWAInstall } from '../hooks/usePWAInstall'; // ✅ Import du hook
import { Download } from 'lucide-react'; // ✅ Import de l'icône

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Utilisation du hook PWA
  const { showInstallBtn, handleInstall } = usePWAInstall();

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = (e) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const navLinkClass = (path) => 
    `text-sm font-medium transition-colors duration-300 ${
      location.pathname === path 
        ? 'text-hermes-primary font-bold' 
        : 'text-gray-600 hover:text-hermes-primary dark:text-gray-300 dark:hover:text-white'
    }`;

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3 md:py-4 lg:py-6'}`}>
        <nav className={`mx-4 md:mx-auto max-w-7xl rounded-2xl border flex items-center justify-between px-4 py-2 md:px-6 md:py-3 transition-all duration-300 
          ${scrolled 
            ? 'bg-white/80 dark:bg-hermes-dark/90 backdrop-blur-xl shadow-lg border-gray-200 dark:border-white/10' 
            : 'bg-white/50 dark:bg-white/5 backdrop-blur-md border-transparent dark:border-white/10'
          }`}>
          
          <div className="flex-shrink-0 cursor-pointer">
            <Link to="/" onClick={handleScrollToTop}>
              <img src={HermesLogo} alt="Logo" className="h-8 md:h-10 lg:h-12 w-auto hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>

          <ul className="hidden lg:flex items-center gap-4 xl:gap-8">
            <li><Link to="/" onClick={handleScrollToTop} className={navLinkClass('/')}>Accueil</Link></li>
            <li><Link to="/about" className={navLinkClass('/about')}>C'est quoi ?</Link></li>
            <li><Link to="/actions" className={navLinkClass('/actions')}>Évènements</Link></li> 
            <li><Link to="/actualites" className={navLinkClass('/actualites')}>Actualités</Link></li>
            <li><Link to="/partenaires" className={navLinkClass('/partenaires')}>Partenaires</Link></li>
            <li><Link to="/blog" className={navLinkClass('/blog')}>Blog</Link></li>
            <li><Link to="/contact" className={navLinkClass('/contact')}>Contact</Link></li>
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            {/* ✅ Bouton d'installation Desktop */}
            {showInstallBtn && (
              <button 
                onClick={handleInstall}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10"
              >
                <Download size={16} />
                <span>Installer</span>
              </button>
            )}
            
            <ThemeToggle />
            <Link to="/contact" state={{ sujetParDefaut: 'rejoindre_association' }} className="px-4 py-2 rounded-xl bg-hermes-primary text-white font-bold text-xs xl:text-sm shadow-lg hover:bg-blue-600 hover:scale-105 transition-all">
              Nous rejoindre
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button className="text-gray-800 dark:text-white p-2" onClick={toggleDrawer}>
              <FaBars size={22} />
            </button>
          </div>
        </nav>
      </div>

      {!isHomePage && (
        <div className="h-28 w-full invisible pointer-events-none" aria-hidden="true"></div>
      )}

      {/* OVERLAY & DRAWER MOBILE */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={toggleDrawer} />

      <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white dark:bg-[#0f172a] shadow-2xl z-[70] transform transition-transform duration-300 p-6 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Menu</span>
            <button onClick={toggleDrawer} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-white">
                <FaTimes size={24} />
            </button>
        </div>
        
        {/* ✅ Bouton d'installation Mobile (Placé en haut du menu) */}
        {showInstallBtn && (
          <button 
            onClick={() => { handleInstall(); toggleDrawer(); }}
            className="flex items-center justify-center gap-3 bg-hermes-primary text-white w-full py-4 rounded-2xl font-bold shadow-lg mb-8 animate-pulse"
          >
            <Download size={20} />
            <span>Installer l'application</span>
          </button>
        )}

        <ul className="flex flex-col gap-6 text-lg overflow-y-auto">
          <li><Link to="/" onClick={handleScrollToTop} className={navLinkClass('/')}>Accueil</Link></li>
          <li><Link to="/about" className={navLinkClass('/about')}>C'est quoi ?</Link></li>
          <li><Link to="/actions" className={navLinkClass('/actions')}>Évènements</Link></li> 
          <li><Link to="/actualites" className={navLinkClass('/actualites')}>Actualités</Link></li>
          <li><Link to="/partenaires" className={navLinkClass('/partenaires')}>Partenaires</Link></li>
          <li><Link to="/blog" className={navLinkClass('/blog')}>Blog</Link></li>
          <li><Link to="/contact" className={navLinkClass('/contact')}>Contact</Link></li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;