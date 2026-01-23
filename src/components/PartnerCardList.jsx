import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'; // Ajout des icônes

const PartnerCardList = () => {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartenaires = async () => {
      try {
        const { data, error } = await supabase
          .from('partenaires')
          .select('*')
          .order('date_creat', { ascending: false }); // Tri par date de création
        
        if (error) throw error;
        // On ne garde que les partenaires publiés
        const publishedPartners = (data || []).filter(p => p.status === 'publié');
        setPartenaires(publishedPartners);
      } catch (error) {
        console.error('Erreur fetch partenaires:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartenaires();
  }, []);

  if (loading) return <div className="col-span-full text-center py-10">Chargement...</div>;

  if (partenaires.length === 0) return <div className="col-span-full text-center py-10">Aucun partenaire pour le moment.</div>;

  return (
    <>
      {partenaires.map((partner) => (
        <div 
          key={partner.id} 
          className="
            /* Styles Mobile (Carrousel) */
            min-w-[85vw] sm:min-w-[60vw] snap-center 
            bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700
            flex flex-col overflow-hidden transform transition-all hover:scale-[1.02]
            
            /* Styles Desktop (Grille - Reset des largeurs forcées) */
            md:min-w-0 md:w-auto
          "
        >
          {/* Image Partenaire */}
          <div className="h-48 md:h-56 w-full bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center relative group">
             {partner.logo ? (
                <img 
                  src={partner.logo} 
                  alt={partner.nom} 
                  loading="lazy"
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
             ) : (
                <span className="text-4xl text-slate-300 font-bold">?</span>
             )}
          </div>

          {/* Contenu */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{partner.nom}</h3>
            
            {/* FIX: Suppression de line-clamp-3 pour afficher tout le texte */}
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 flex-1 whitespace-pre-line">
              {partner.description}
            </p>
            
            {/* Boutons d'action */}
            <div className="mt-auto flex flex-col gap-2">
                {/* Lien Site Web */}
                {partner.lienSite && (
                  <a 
                    href={partner.lienSite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-hermes-primary bg-hermes-primary/10 rounded-lg hover:bg-hermes-primary hover:text-white transition-colors"
                  >
                    <FaGlobe /> Visiter le site
                  </a>
                )}

                {/* FIX: Ajout du lien Maps */}
                {partner.lienAdresse && (
                  <a 
                    href={partner.lienAdresse} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <FaMapMarkerAlt /> Voir sur la carte
                  </a>
                )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PartnerCardList;