import React from 'react';
import PartnerCardList from '../components/PartnerCardList';
// Si vous aviez un composant grille spécifique, nous allons utiliser une structure responsive ici.

const SectionPartenaires = () => {
  // Données statiques des partenaires (simulées ici, à remplacer par vos props ou data réelles si elles viennent d'ailleurs)
  // Je reprends la logique probable de votre composant actuel.
  
  return (
    <section className="page-section">
      <div className="section-content">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
          Nos <span className="text-hermes-primary">Partenaires</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
          Ils nous soutiennent et permettent de faire vivre l'association.
        </p>
      </div>

      {/* CONTAINER RESPONSIVE : 
        - Mobile: flex + overflow-x-auto + snap-x (Carrousel)
        - Desktop (md+): grid + grid-cols-3 (Grille classique)
      */}
      <div className="
        flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 
        md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:px-0 md:mx-0
        scrollbar-hide scroll-smooth
      ">
        {/* On englobe le PartnerCardList ou on le remplace par l'itération des cartes. 
            Je suppose ici que PartnerCardList gère l'affichage. 
            Si PartnerCardList contient déjà une Grid, il faudra modifier PartnerCardList.
            
            VERSION ROBUSTE : Je crée un wrapper qui force le style carrousel sur les enfants directs.
        */}
        
        <PartnerCardList className="contents" /> 
        
        {/* NOTE IMPORTANTE : 
           Si PartnerCardList retourne une <div> avec "grid", cela cassera le carrousel.
           Je vous propose ci-dessous le code complet de "PartnerCardList" modifié si nécessaire, 
           mais comme je ne peux pas modifier 2 fichiers sans être sûr, voici l'astuce CSS :
           
           J'applique les styles de carrousel directement au parent ici.
           Si PartnerCardList est une simple liste de composants, cela fonctionnera.
        */}
      </div>
      
      {/* Indicateur visuel de scroll pour mobile (optionnel mais sympa) */}
      <div className="md:hidden flex justify-center gap-2 mt-2">
        <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-hermes-primary w-1/3 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default SectionPartenaires;