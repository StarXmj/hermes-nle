// src/pages/ActionsPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ActionCard from '../components/ActionCard';
import { Helmet } from 'react-helmet-async';
import './ActionsPage.css'; // On utilise le CSS de la timeline

function ActionsPage() {
  const [allActions, setAllActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'future', 'past'
  const [upcomingActionId, setUpcomingActionId] = useState(null);

  // Fonction pour charger les données
  async function loadActions() {
    // Note : On ne met pas setLoading(true) pour éviter le flash
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('status', 'publié') // On ne prend que les actions publiées
      .order('dateISO', { ascending: false }); // On trie par date (plus récent en haut)

    if (error) {
      console.error('Erreur de chargement des actions:', error);
    } else {
      setAllActions(data);

      // Calculer l'ID de la prochaine action "À venir"
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureActionsAsc = data
        .filter(a => new Date(a.dateISO) >= today)
        .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO)); // Tri ascendant
        
      if (futureActionsAsc.length > 0) {
        setUpcomingActionId(futureActionsAsc[0].id);
      } else {
        setUpcomingActionId(null);
      }
    }
    setLoading(false);
  }

  // 1. Premier effet : Chargement initial et abonnement Realtime
  useEffect(() => {
    loadActions(); // Chargement initial

    // Abonnement Realtime
    const channel = supabase
      .channel('actions-public-page-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actions' },
        (payload) => {
          console.log('Changement détecté sur la page Actions !', payload);
          loadActions(); // Recharge les données
        }
      )
      .subscribe();

    // Nettoyage de l'abonnement
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Ne s'exécute qu'une fois au montage

  // 2. Deuxième effet : Filtrage (se lance quand 'allActions' ou 'filter' changent)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Important pour la comparaison de date
    
    let actionsToShow = [];

    if (filter === 'all') {
      actionsToShow = allActions; // Déjà trié du plus récent au plus ancien
    } 
    else if (filter === 'future') {
      actionsToShow = allActions
        .filter(a => new Date(a.dateISO) >= today)
        .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO)); // Tri ascendant (le plus proche en premier)
    } 
    else if (filter === 'past') {
      actionsToShow = allActions
        .filter(a => new Date(a.dateISO) < today); // Déjà trié desc par défaut
    }
    
    setFilteredActions(actionsToShow);

  }, [allActions, filter]); // Dépend de la liste complète ET du filtre

  return (
    <main className="page-section actions-page-container">
      <Helmet>
        <title>Nos Actions - Hermes by NLE</title>
        <meta name="description" content="Découvrez toutes les actions passées et à venir de l'association Hermes." />
      </Helmet>
      
      <header className="actions-page-header">
        <h1>Nos Actions</h1>
        <p>Toutes nos animations, événements et interventions.</p>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button 
            className={`filter-btn ${filter === 'future' ? 'active' : ''}`}
            onClick={() => setFilter('future')}
          >
            À venir
          </button>
          <button 
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Passées
          </button>
        </div>
      </header>

      {loading ? (
        <div className="timeline-empty">
          <p>Chargement des actions...</p>
        </div>
      ) : (
        <div className="timeline">
          {filteredActions.length > 0 ? (
            filteredActions.map(action => {
              
              // Logique pour définir le statut de la carte
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const actionDate = new Date(action.dateISO);
              const status = actionDate < today ? 'past' : 'future';
              
              // Correction du bug "infoDate"
              const formattedDate = actionDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              
              const actionForCard = {
                ...action,
                // On crée le champ 'infoDate' attendu par ActionCard.jsx
                infoDate: `${formattedDate} - ${action.infoPratique}` 
              };

              return (
                <div key={action.id} className="timeline-item">
                  <ActionCard 
                    action={actionForCard} 
                    status={status}
                    isUpcoming={action.id === upcomingActionId}
                  />
                </div>
              );
            })
          ) : (
            <div className="timeline-empty">
              <p>Aucune action à afficher pour le filtre "{filter}".</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default ActionsPage;