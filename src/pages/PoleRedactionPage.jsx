// src/pages/PoleRedactionPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPenNib } from 'react-icons/fa';

function PoleRedactionPage() {
  return (
    <main className="page-section">
      <Helmet>
        <title>Pôle Rédaction - Hermes by NLE</title>
        <meta name="description" content="Découvrez le pôle Rédaction et le Mensuel Hermes." />
      </Helmet>
      <div className="section-content">
        <h1>Pôle Rédaction</h1>
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <FaPenNib size={60} style={{ color: '#0056b3' }} />
        </div>
        <p>
          Le pôle Rédaction est la plume de l'association.
        </p>
        <p>
          Nous sommes responsables de la création du <strong>Mensuel Hermès</strong>, notre newsletter phare qui regroupe toutes les informations essentielles du mois à venir : actualités de l'université, bons plans culturels, et agenda des sorties.
        </p>
        <p>
          Nous rédigeons également les articles du blog pour partager des retours d'expérience et des conseils pratiques.
        </p>
      </div>
    </main>
  );
}

export default PoleRedactionPage;