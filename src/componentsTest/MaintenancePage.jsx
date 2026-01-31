import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaExclamationTriangle, FaHistory } from 'react-icons/fa';
import './HermesRunner.css'; // On réutilise le CSS du runner pour le fond

const MaintenancePage = () => {
  return (
    <div className="greek-runner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      
      {/* Carte de message */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #DAA520',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 0 30px rgba(218, 165, 32, 0.3)',
        margin: '20px'
      }}>
        
        <FaTools size={60} color="#DAA520" style={{ marginBottom: '20px' }} />
        
        <h1 style={{ fontFamily: '"Cinzel", serif', color: '#DAA520', marginBottom: '20px' }}>
          L'OLYMPE EST EN TRAVAUX
        </h1>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
          Chers Athlètes, une mise à jour majeure de sécurité est en cours sur les serveurs d'Hermès.
          Le jeu est momentanément <strong>en pause</strong>.
        </p>

        <div style={{ 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          borderLeft: '4px solid #ff4444', 
          padding: '15px', 
          textAlign: 'left',
          marginBottom: '30px',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444', fontWeight: 'bold', marginBottom: '5px' }}>
            <FaExclamationTriangle /> INFORMATION IMPORTANTE
          </div>
          <p style={{ fontSize: '0.95rem', margin: 0, color: '#ddd' }}>
            Suite à cette restructuration, <strong>les comptes et les scores ont été réinitialisés</strong>. 
            Nous nous excusons pour la gêne occasionnée. Une nouvelle ère de compétition commencera dès la réouverture !
          </p>
        </div>

        <Link to="/" style={{
          display: 'inline-block',
          backgroundColor: '#DAA520',
          color: '#000',
          padding: '12px 30px',
          borderRadius: '30px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontFamily: '"Cinzel", serif',
          transition: 'transform 0.2s'
        }}>
          RETOURNER À L'ACCUEIL
        </Link>

      </div>
    </div>
  );
};

export default MaintenancePage;