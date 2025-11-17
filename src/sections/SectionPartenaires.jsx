// src/sections/SectionPartenaires.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PartnerCardGrid from '../components/PartnerCardGrid'; 
import './SectionPartenaires.css';

function SectionPartenaires() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction de chargement
  async function loadPartenaires() {
    const { data, error } = await supabase
      .from('partenaires')
      .select('*')
      .eq('status', 'publié') // Seulement les partenaires publiés
      .order('nom', { ascending: true }); // Tri alphabétique

    if (error) {
      console.error('Erreur chargement partenaires:', error);
    } else {
      setPartenaires(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    // 1. Chargement initial
    loadPartenaires();

    // 2. Abonnement Realtime
    const channel = supabase
      .channel('partenaires-home-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partenaires' },
        (payload) => {
          console.log('Changement partenaires détecté !', payload);
          loadPartenaires();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="partenaires" className="page-section alternate-bg">
      <div className="section-content">
        <h2>Nos Partenaires</h2>
        <p>Ils nous font confiance et soutiennent la vie étudiante.</p>

        {loading ? (
          <p>Chargement des partenaires...</p>
        ) : partenaires.length > 0 ? (
          <div className="partenaires-grid">
            {partenaires.map(partenaire => (
              <PartnerCardGrid key={partenaire.id} partenaire={partenaire} />
            ))}
          </div>
        ) : (
          <p style={{fontStyle:'italic', color:'#777'}}>Aucun partenaire pour le moment.</p>
        )}

        <div className="partenaires-links">
            <a href="/partenaires" className="cta-button secondary">
                Voir tous nos partenaires
            </a>
        </div>
      </div>
    </section>
  );
}
export default SectionPartenaires;