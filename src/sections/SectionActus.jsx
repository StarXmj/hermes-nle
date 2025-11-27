// src/sections/SectionActus.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ActuCard from '../components/ActuCard';

// Imports Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Notre style
import './SectionActus.css';

function SectionActus() {
  const [actusAffiches, setActusAffiches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les actualités
  async function loadActus() {
    // On définit "aujourd'hui" à minuit pour inclure les événements de la journée
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
      .from('actus')
      .select('*')
      .eq('status', 'publié') // Seulement les publiées
      .gte('dateISO', todayISO) // Seulement les futures (ou aujourd'hui)
      // TRI : D'abord les épinglées (true > false), ensuite par date la plus proche
      .order('isPinned', { ascending: false }) 
      .order('dateISO', { ascending: true })
      .limit(10); // On peut en charger un peu plus que 5 pour le carrousel

    if (error) {
      console.error('Erreur de chargement des actus:', error);
    } else {
      setActusAffiches(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    // 1. Chargement initial
    loadActus();

    // 2. Abonnement Realtime (Mise à jour en direct)
    const channel = supabase
      .channel('actus-public-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actus' },
        (payload) => {
          console.log('Changement détecté dans les actus !', payload);
          loadActus(); // On recharge la liste
        }
      )
      .subscribe();

    // Nettoyage
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="actualites" className="page-section">
      <div className="section-content">
        <h2>Actu & Événements Fac</h2>
        <p>Restez informés de ce qu'il se passe sur le campus.</p>

        {loading ? (
          <p>Chargement des actualités...</p>
        ) : actusAffiches.length > 0 ? (

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1} // 1 carte par défaut (mobile très petit)
            
            // AJOUT MAGIQUE POUR LE CENTRAGE :
            centerInsufficientSlides={true} 
            
            navigation={true}
            pagination={{ clickable: true }}
            
            breakpoints={{
              // Mobile standard (landscape)
              600: { 
                slidesPerView: 2,
                spaceBetween: 20,
              },
              // Tablette
              900: { 
                slidesPerView: 3,
                spaceBetween: 30,
              },
              // Bureau
              1200: { 
                slidesPerView: 4, // On peut en afficher 4 si l'écran est large
                spaceBetween: 30,
              },
            }}
            className="actus-carousel"
          >
            {actusAffiches.map(article => (
              <SwiperSlide key={article.id}>
                <ActuCard article={article} />
              </SwiperSlide>
            ))}
          </Swiper>

        ) : (
          <p className="actus-empty-message">
            Aucune actualité à venir pour le moment.
          </p>
          
        )}
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
  <a href="/actualites" className="cta-button secondary">
    Voir toutes les actualités
  </a>
</div>
      </div>
    </section>
  );
}

export default SectionActus;