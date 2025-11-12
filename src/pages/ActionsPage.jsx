// src/pages/ActionsPage.jsx
import React, { useState, useMemo } from 'react';
import allActions from '../data/actions.json';
import ActionCard from '../components/ActionCard'; // On réutilise notre carte !
import './ActionsPage.css'; // On importe le style de la page

function ActionsPage() {
  // 1. État pour savoir quel filtre est actif
  const [filter, setFilter] = useState('future'); // 'future' ou 'past'

  // 2. Logique de filtrage et de tri
  const filteredActions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const actions = allActions.filter(action => {
      const actionDate = new Date(action.dateISO);
      if (filter === 'future') {
        return actionDate >= today; // Actions à venir
      } else {
        return actionDate < today; // Actions passées
      }
    });

    // On trie :
    // - les actions futures de la + proche à la + lointaine
    // - les actions passées de la + récente à la + ancienne
    actions.sort((a, b) => {
      const dateA = new Date(a.dateISO);
      const dateB = new Date(b.dateISO);
      return filter === 'future' ? dateA - dateB : dateB - dateA;
    });

    return actions;
  }, [filter]); // Cette logique se relance si "filter" change

  return (
    <div className="actions-page-container">

      <header className="actions-page-header">
        <h1>Nos Actions</h1>
        <p>Retrouvez l'historique de nos événements et tout ce qui arrive sur le campus.</p>

        {/* 3. Les boutons de filtre */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'future' ? 'active' : ''}`}
            onClick={() => setFilter('future')}
          >
            Actions à venir
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Actions passées
          </button>
        </div>
      </header>

      {/* 4. La Timeline Verticale */}
      <main>
        <div className="timeline">
            {filteredActions.length > 0 ? (
              
              // LA CORRECTION EST ICI : on ajoute "index" comme 2e argument
              filteredActions.map((action, index) => (
                <div className="timeline-item" key={action.id}>
                  <ActionCard 
                    action={action} 
                    status={filter} 
                    // Maintenant, 'index' est défini et le code fonctionne
                    isUpcoming={filter === 'future' && index < 3} 
                  />
                </div>
              ))

            ) : (
              <p className="timeline-empty">
                Aucune action trouvée.
              </p>
            )}
          </div>
      </main>

    </div>
  );
}

export default ActionsPage;