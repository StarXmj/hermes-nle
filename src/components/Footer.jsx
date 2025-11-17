// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

// 1. On ré-importe les icônes ICI
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter, FaEnvelope } from 'react-icons/fa6';
import { HashLink } from 'react-router-hash-link';

function Footer() {
  return (
    <footer className="footer">
      
      {/* 1. NOUVELLE LIGNE DE CONTACT (avec le design bleu) */}
      <div className="footer-contact-line">
        
        {/* Les icônes sociales */}
        <div className="footer-socials">
          
          <a href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" target="_blank" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://www.tiktok.com/@hermes_pau?_r=1&_t=ZN-91JbleMUFk6"  target="_blank" aria-label="TikTok"><FaTiktok /></a> 
          <a href="mailto:hermesbynle@gmail.com" target="_blank" aria-label="Email"><FaEnvelope /></a>
        </div>
        
        {/* Le lien newsletter */}
        <div className="footer-newsletter">
          <HashLink to="/#newsletter">S'abonner à la newsletter</HashLink>
        </div>
      </div>
      
      {/* 2. Le copyright (partie grise) */}
      <div className="footer-copyright">
        <p>© 2025 Hermes by NLE - Tous droits réservés.</p>
      </div>
      <div className="footer-legal-links">
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/politique-de-confidentialite">Politique de confidentialité</a>
        <a href="/credits">Crédits</a>
        <a href="/plan-du-site">Plan du site</a>
        <a href="/admin">Administration</a>
      </div>
    </footer>
  );
}

export default Footer;