// src/pages/PartenairesPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PartnerCardList from '../components/PartnerCardList.jsx';
import { Helmet } from 'react-helmet-async';
import './PartenairesPage.css';

function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPartenaires() {
    setLoading(true); // On peut mettre le loading ici pour la page dédiée
    const { data, error } = await supabase
      .from('partenaires')
      .select('*')
      .eq('status', 'publié') // Seulement les publiés
      .order('nom', { ascending: true });

    if (error) {
      console.error('Erreur chargement page partenaires:', error);
    } else {
      setPartenaires(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPartenaires();

    const channel = supabase
      .channel('partenaires-page-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partenaires' },
        () => loadPartenaires()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="page-section">
       <Helmet>
             <title>Partenaires - Hermes by NLE</title>
              <meta name="description" content="Découvrez nos partenaires et les avantages étudiants exclusifs." />
      </Helmet>
      <div className="section-content">
        <h1>Nos Partenaires</h1>
        <p>Découvrez tous les partenaires qui s'engagent pour la vie étudiante à nos côtés.</p>

        {loading ? (
          <p>Chargement...</p>
        ) : partenaires.length > 0 ? (
          <div className="partenaires-list">
            {partenaires.map(partenaire => (
              <PartnerCardList key={partenaire.id} partenaire={partenaire} />
            ))}
          </div>
        ) : (
          <p style={{marginTop: '2rem', fontStyle:'italic'}}>Aucun partenaire affiché pour l'instant.</p>
        )}
      </div>
    </main>
  );
}

export default PartenairesPage;