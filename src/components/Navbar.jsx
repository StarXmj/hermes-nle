// src/components/Navbar.jsx
import React, { useState } from 'react'; // 1. Importer useState
import './Navbar.css';
import HermesLogo from '../assets/logo-hermes.png';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
// 2. Importer les icônes
import { FaBars, FaTimes } from 'react-icons/fa'; 

function Navbar() {
  // 3. État pour gérer l'ouverture du menu
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 4. Fonction pour ouvrir/fermer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    // On ajoute 'navbar-container' pour l'overlay
    <div className="navbar-container">
      <nav className="navbar">
        
        <div className="navbar-logo">
          <a href="/">
            <img src={HermesLogo} alt="Logo Hermes by NLE" className="logo-image" />
          </a>
        </div>

        {/* 5. LIENS DU MENU (Version Bureau) */}
        {/* Ils seront cachés sur mobile par le CSS */}
        <ul className="navbar-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/about">C'est quoi ?</Link></li>
          <li><Link to="/actions">Actions</Link></li> 
          <li><HashLink to="/#actualites">Actualités</HashLink></li>          
          <li><Link to="/partenaires">Partenaires</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        {/* 6. BOUTONS (Version Bureau) */}
        {/* Ils seront cachés sur mobile par le CSS */}
        <div className="navbar-actions">
          <Link 
            to="/contact" 
            className="btn btn-secondary"
            state={{ sujetParDefaut: 'devenir_partenaire' }}
          >
            Devenir partenaire
          </Link>
          <Link 
            to="/contact" 
            className="btn btn-primary"
            state={{ sujetParDefaut: 'rejoindre_association' }}
          >
            Nous rejoindre
          </Link>
        </div>

        {/* 7. ICÔNE BURGER (Version Mobile) */}
        {/* Il sera caché sur bureau par le CSS */}
        <button className="burger-icon" onClick={toggleDrawer}>
          <FaBars />
        </button>
        
      </nav>

      {/* 8. L'OVERLAY (fond noir) */}
      {/* S'affiche uniquement si le menu est ouvert */}
      {isDrawerOpen && <div className="overlay" onClick={toggleDrawer}></div>}

      {/* 9. LE MENU LATÉRAL (le layout qui apparait) */}
      <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <button className="close-icon" onClick={toggleDrawer}>
          <FaTimes />
        </button>
        
        {/* On réplique les liens et boutons pour le mobile */}
        <ul className="drawer-links">
          <li><Link to="/" onClick={toggleDrawer}>Accueil</Link></li>
          <li><Link to="/about" onClick={toggleDrawer}>C'est quoi ?</Link></li>
          <li><Link to="/actions" onClick={toggleDrawer}>Actions</Link></li>
          <li><HashLink to="/#actualites">Actualités</HashLink></li>
          <li><Link to="/partenaires" onClick={toggleDrawer}>Partenaires</Link></li>
          <li><Link to="/contact" onClick={toggleDrawer}>Contact</Link></li>
        </ul>

        <div className="drawer-actions">
          <Link 
            to="/contact" 
            className="btn btn-secondary"
            state={{ sujetParDefaut: 'devenir_partenaire' }}
            onClick={toggleDrawer}
          >
            Devenir partenaire
          </Link>
          <Link 
            to="/contact" 
            className="btn btn-primary"
            state={{ sujetParDefaut: 'rejoindre_association' }}
            onClick={toggleDrawer}
          >
            Nous rejoindre
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;