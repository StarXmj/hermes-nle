// src/pages/AdminPage.jsx
import React, { useEffect } from 'react';
import CMS from 'decap-cms-app';

// 1. ON IMPORTE HELMET (pour ajouter des choses dans le <head>)
import { Helmet } from 'react-helmet-async';

// 2. ON N'IMPORTE PLUS LE CSS ICI. On supprime la ligne :
// import 'decap-cms-app/dist/cms.css'; 

import { config } from '../adminConfig.js';

function AdminPage() {
  
  useEffect(() => {
    CMS.init({ config }); 
  }, []);

  return (
    <>
      {/* 3. ON INJECTE LE LIEN CSS VIA HELMET */}
      <Helmet>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/decap-cms-app@^3.0.0/dist/cms.css" 
        />
        <title>Administration | Hermes by NLE</title>
      </Helmet>

      {/* 4. On garde le point d'ancrage */}
      <div id="decap-cms-root"></div>
    </>
  );
}

export default AdminPage;