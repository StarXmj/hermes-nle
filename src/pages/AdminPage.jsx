// src/pages/AdminPage.jsx
import React, { useEffect } from 'react';

// 1. On importe le paquet
import CMS from 'decap-cms-app';

// 2. ON IMPORTE LE CSS NÉCESSAIRE (très important !)
import 'decap-cms-app/dist/cms.css';

// 3. On importe notre configuration JS
import { config } from '../adminConfig.js';

function AdminPage() {
  
  // 4. On utilise 'useEffect' pour initialiser le CMS
  //    une seule fois, quand la page se charge.
  useEffect(() => {
    // On passe notre objet de config à la fonction init()
    CMS.init({ config }); 
  }, []); // Le tableau vide [] signifie "une seule fois"

  // 5. On donne un point d'ancrage au CMS
  return (
    <div id="decap-cms-root"></div>
  );
}

export default AdminPage;