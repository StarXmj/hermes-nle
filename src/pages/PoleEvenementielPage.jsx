// src/pages/PoleEvenementielPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt } from 'react-icons/fa';

function PoleEvenementielPage() {
  return (
    <main className="page-section">
      <Helmet>
        <title>Pôle Événementiel - Hermes by NLE</title>
        <meta name="description" content="Découvrez les événements organisés par le pôle Événementiel." />
      </Helmet>
      <div className="section-content">
        <h1>Pôle Événementiel</h1>
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <FaCalendarAlt size={60} style={{ color: '#0056b3' }} />
        </div>
        <p>
          L'équipe événementielle est là pour <strong>animer la vie du campus</strong> !
        </p>
        <p>
          Nous organisons des rencontres, des soirées d'intégration, des tournois (E-Sport, sportifs) et des moments d'échange tout au long de l'année pour créer du lien entre les étudiants de toutes les filières.
        </p>
      </div>
    </main>
  );
}

export default PoleEvenementielPage;