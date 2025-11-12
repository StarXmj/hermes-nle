// src/sections/SectionActions.jsx
import React from 'react';
import './SectionActions.css'; 
import allActions from '../data/actions.json';
import ActionCard from '../components/ActionCard'; // 1. IMPORTER LA CARTE
console.log("Données chargées :", allActions);
// (La logique de tri des 3 prochaines actions ne change pas)
const today = new Date(); // ... (etc)
const prochainesActions = allActions
  .filter(action => {
    const actionDate = new Date(action.dateISO);
    return actionDate >= today;
  })
  .sort((a, b) => {
    const dateA = new Date(a.dateISO);
    const dateB = new Date(b.dateISO);
    return dateA - dateB;
  })
  .slice(0, 3);

function SectionActions() {
  return (
    <section className="page-section">
      <div className="section-content">
        <h2>Nos Actions</h2>
        <p>Découvrez ce que nous faisons pour animer le campus.</p>

        <div className="actions-grid">
          {/* LA MODIFICATION EST ICI */}
          {prochainesActions.map(action => (
            <ActionCard 
              key={action.id} 
              action={action} 
              
              // On ajoute les props manquantes :
              status="future"   // C'est forcément une action future
              isUpcoming={false}   // C'est forcément une action "À venir"
            />
          ))}
        </div>

        <div className="actions-links">
          {/* 3. VÉRIFIER QUE CE LIEN MÈNE À LA NOUVELLE PAGE */}
          <a href="/actions" className="cta-button secondary">
            Voir toutes nos actions
          </a>
        </div>
      </div>
    </section>
  );
}
export default SectionActions;