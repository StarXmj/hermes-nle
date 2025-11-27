// src/components/Navbar.jsx
import React, { useState } from 'react';
import './Navbar.css';
import HermesLogo from '../assets/logo-hermes.png';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; 

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        
        <div className="navbar-logo">
          <a href="/">
            <img src={HermesLogo} alt="Logo Hermes by NLE" className="logo-image" data-aos="fade-right" data-aos-delay="200" />
          </a>
        </div>

        {/* LIENS DU MENU (Bureau) */}
        <ul className="navbar-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/about">C'est quoi ?</Link></li>
          <li><Link to="/actions">Évènements</Link></li> 
          <li><Link to="/actualites">Actualités</Link></li>
          <li><Link to="/partenaires">Partenaires</Link></li>
          <li><Link to="/blog">Blog</Link></li> {/* <-- AJOUT ICI */}
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        {/* BOUTONS (Bureau) */}
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

        {/* ICÔNE BURGER (Mobile) */}
        <button className="burger-icon" onClick={toggleDrawer}>
          <FaBars />
        </button>
        
      </nav>

      {/* OVERLAY */}
      {isDrawerOpen && <div className="overlay" onClick={toggleDrawer}></div>}

      {/* MENU LATÉRAL (Mobile) */}
      <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <button className="close-icon" onClick={toggleDrawer}>
          <FaTimes />
        </button>
        
        <ul className="drawer-links">
          <li><Link to="/" onClick={toggleDrawer}>Accueil</Link></li>
          <li><Link to="/about" onClick={toggleDrawer}>C'est quoi ?</Link></li>
          <li><Link to="/actions" onClick={toggleDrawer}>Évènements</Link></li>
          <li><HashLink to="/actualites" onClick={toggleDrawer}>Actualités</HashLink></li>
          <li><Link to="/partenaires" onClick={toggleDrawer}>Partenaires</Link></li>
                    <li><Link to="/blog" onClick={toggleDrawer}>Blog</Link></li> {/* <-- AJOUT ICI AUSSI */}

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