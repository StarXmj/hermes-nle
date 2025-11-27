// src/pages/ActusPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ActuCard from '../components/ActuCard';
import { Helmet } from 'react-helmet-async';
import './ActusPage.css';

function ActusPage() {
  const [allActus, setAllActus] = useState([]);
  const [filteredActus, setFilteredActus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('future'); // 'all', 'future', 'past'

  async function loadActus() {
    const { data, error } = await supabase
      .from('actus')
      .select('*')
      .eq('status', 'publié')
      .order('dateISO', { ascending: false });

    if (error) console.error('Erreur:', error);
    else setAllActus(data);
    
    setLoading(false);
  }

  useEffect(() => {
    loadActus();
    const channel = supabase.channel('actus-page').on('postgres_changes', { event: '*', schema: 'public', table: 'actus' }, loadActus).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let result = [];
    if (filter === 'all') result = allActus;
    else if (filter === 'future') {
      result = allActus.filter(a => new Date(a.dateISO) >= today).sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
    } 
    else if (filter === 'past') {
      result = allActus.filter(a => new Date(a.dateISO) < today);
    }
    setFilteredActus(result);
  }, [allActus, filter]);

  return (
    <main className="page-section actus-page-container">
      <Helmet><title>Toutes les Actualités</title></Helmet>
      
      <header className="actus-page-header">
        <h1>Actualités du Campus</h1>
        <p>Restez informés de tout ce qu'il se passe à l'UPPA.</p>
        
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'future' ? 'active' : ''}`} onClick={() => setFilter('future')}>À venir / En cours</button>
          <button className={`filter-btn ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>Archives</button>
        </div>
      </header>

      {loading ? (
        <div className="timeline-empty"><p>Chargement...</p></div>
      ) : (
        <div className="timeline">
          {filteredActus.length > 0 ? (
            filteredActus.map(actu => {
              // --- AJOUT : Calcul du statut ---
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = new Date(actu.dateISO) < today;
              const status = isPast ? 'past' : 'future';

              return (
                <div key={actu.id} className="timeline-item">
                  {/* On passe la prop 'status' */}
                  <ActuCard article={actu} status={status} />
                </div>
              );
            })
          ) : (
            <div className="timeline-empty"><p>Aucune actualité.</p></div>
          )}
        </div>
      )}
    </main>
  );
}

export default ActusPage;