// src/sections/SectionActus.jsx
import React from 'react';
import allActus from '../data/actus.json';
import ActuCard from '../components/ActuCard';

// Imports Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Notre style
import './SectionActus.css';

// 4. LOGIQUE CORRIGÉE : "LES 5 PROCHAINS ÉVÉNEMENTS À VENIR"
function getActusAVenir() {
  // A) Définir "aujourd'hui"
  const today = new Date();
  today.setHours(0, 0, 0, 0); // à 00:00:00

  // B) Filtrer les actus
  const actusFutures = allActus.filter(actu => {
    const actuDate = new Date(actu.dateISO);
    
    // L'actu doit être >= à "aujourd'hui"
    return actuDate >= today;
  });

  // C) "ranger par ordre du temps" (chronologique, du plus tôt au plus tard)
  const sortedActus = actusFutures.sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
  
  // D) On prend les 5 premiers de la liste "à venir"
  return sortedActus.slice(0, 5);
}

const actusAffiches = getActusAVenir();

function SectionActus() {
  return (
    <section id="actualites" className="page-section">
      <div className="section-content">
        <h2>Actu & Événements Fac</h2>
        {/* On remet le texte générique */}
        <p>Restez informés de ce qu'il se passe sur le campus.</p>

        {actusAffiches.length > 0 ? (

          <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={2} // Base pour mobile
          
          navigation={true} // <-- Doit être ici pour mobile
          pagination={{ clickable: true }}
          
          breakpoints={{
            // Pour 768px et plus
            768: { 
              slidesPerView: 3,
              navigation: true, // <-- Doit être répété ici
              pagination: { clickable: true },
            },
            // Pour 1200px et plus
            1200: { 
              slidesPerView: 5,
              navigation: true, // <-- Doit être répété ici
              pagination: { clickable: true },
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
          
          // 6. Message si pas d'actu
          <p className="actus-empty-message">
            Aucune actualité à venir pour le moment.
          </p>

        )}
      </div>
    </section>
  );
}
export default SectionActus;