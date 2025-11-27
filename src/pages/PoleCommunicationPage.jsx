// src/pages/PoleCommunicationPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaBullhorn } from 'react-icons/fa';

function PoleCommunicationPage() {
  return (
    <main className="page-section">
      <Helmet>
        <title>Pôle Communication - Hermes by NLE</title>
        <meta name="description" content="Découvrez le pôle Communication de l'association Hermes by NLE." />
      </Helmet>
      <div className="section-content">
        <h1>Pôle Communication</h1>
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <FaBullhorn size={60} style={{ color: '#0056b3' }} />
        </div>
        <p>
          Notre mission est de <strong>faire circuler l'information</strong> et de valoriser les projets étudiants sur le campus de Pau.
        </p>
        <p>
          Nous gérons les réseaux sociaux, la création de visuels et la promotion des événements pour assurer une visibilité maximale aux initiatives étudiantes et aux actions de l'association.
        </p>
      </div>
    </main>
  );
}

export default PoleCommunicationPage;