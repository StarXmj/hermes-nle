// src/sections/SectionActions.jsx
import React, { useState, useEffect } from 'react'; // 1. On importe useState/useEffect
import './SectionActions.css'; 
// import allActions from '../data/actions.json'; // 2. ON SUPPRIME LE JSON
import { supabase } from '../supabaseClient'; // 3. ON IMPORTE SUPABASE
import ActionCard from '../components/ActionCard';

// 4. ON SUPPRIME L'ANCIENNE LOGIQUE DE TRI (elle sera faite par Supabase)

function SectionActions() {
  // 5. On crée des états pour le chargement et les données
  const [prochainesActions, setProchainesActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 6. On charge les données au démarrage du composant
  useEffect(() => {
    async function loadActions() {
      setLoading(true);
      const today = new Date().toISOString(); // La date d'aujourd'hui

      // 7. C'est la requête Supabase !
      const { data, error } = await supabase
        .from('actions')          // Depuis la table 'actions'
        .select('*')              // Prends toutes les colonnes
        .eq('status', 'public')   // OÙ le statut est 'publié'
        .gte('dateISO', today)    // ET OÙ la date est >= aujourd'hui
        .order('dateISO', { ascending: true }) // Trié par date
        .limit(3);                // On ne prend que les 3 premiers

      if (error) {
        console.error('Erreur de chargement des actions:', error);
      } else {
        setProchainesActions(data); // On met les données dans l'état
      }
      setLoading(false);
    }
    
    loadActions();
  }, []); // Le tableau vide [] signifie "ne s'exécute qu'une fois"

  return (
    <section className="page-section">
      <div className="section-content">
        <h2>Nos Actions</h2>
        <p>Découvrez ce que nous faisons pour animer le campus.</p>

        {/* 8. On ajoute un indicateur de chargement */}
        {loading ? (
          <p>Chargement des actions...</p>
        ) : (
          <div className="actions-grid">
            {prochainesActions.map(action => (
              <ActionCard 
                key={action.id} 
                action={action} 
                status="future"
                isUpcoming={false} // On n'affiche plus le badge "à venir"
              />
            ))}
          </div>
        )}

        <div className="actions-links">
          <a href="/actions" className="cta-button secondary">
            Voir toutes nos actions
          </a>
        </div>
      </div>
    </section>
  );
}
export default SectionActions;