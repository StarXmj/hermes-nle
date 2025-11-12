// src/pages/AboutPage.jsx
import React from 'react';
import membresData from '../data/membres.json';
import faqData from '../data/faq.json';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';

// On garde les mêmes icônes
import { 
  FaUsers, FaDice, FaShieldAlt, FaInfoCircle, FaLifeRing, FaDoorOpen, 
  FaCalendarCheck, FaHandshake, FaHeart 
} from 'react-icons/fa';

import './AboutPage.css';

function AboutPage() {
  return (
    <main className="about-page">
      
      {/* 1. Section "Qui sommes-nous ?" (Ne change pas) */}
      <section className="page-section hero-about">
        <div className="section-content">
          <h1>Qui sommes-nous ?</h1>
          <p className="hero-subtitle">
            Hermes by NLE est une association loi 1901, gérée entièrement par 
            des étudiants bénévoles, pour les étudiants.
          </p>
          <p className="hero-text">
            Nés de l'envie de transformer les années universitaires en une expérience 
            mémorable, nous agissons comme le principal relais d'information, 
            d'animation et de solidarité sur le campus de Pau.
          </p>
        </div>
      </section>

      {/* 2. Section Missions (TEXTE ENTIÈREMENT RÉÉCRIT) */}
      <section className="page-section">
        <div className="section-content">
          <h2>Notre Mission : Votre Expérience Étudiante</h2>
          <p>Notre action repose sur 6 piliers. 6 promesses que nous vous faisons.</p>
          
          <div className="missions-grid">
            
            <div className="mission-item">
              <FaUsers className="mission-icon" size={30} />
              <h3>Fédérer & Créer du Lien</h3>
              <p>
                L'université, c'est immense. On peut s'y sentir comme un simple numéro 
                au milieu d'un amphi. Notre mission est de briser ça. Nous sommes là 
                pour connecter les gens, peu importe leur filière. On veut que vous 
                rencontriez des personnes que vous n'auriez jamais croisées autrement, 
                que vous trouviez votre "famille" de campus.
              </p>
            </div>
            
            <div className="mission-item">
              <FaDice className="mission-icon" size={30} />
              <h3>Animer & Faire Vibrer</h3>
              <p>
                Vos années à la fac passeront vite. Trop vite. Elles ne doivent pas 
                être qu'une simple ligne sur un CV. On veut qu'elles soient remplies 
                de souvenirs. C'est pourquoi on se démène pour créer des événements 
                qui vous sortent des cours et des révisions : des soirées pour 
                tout lâcher, des tournois pour le challenge, des conférences pour 
                s'inspirer.
              </p>
            </div>
            
            <div className="mission-item">
              <FaShieldAlt className="mission-icon" size={30} />
              <h3>Représenter & Défendre</h3>
              <p>
                Face à l'administration ou au CROUS, on peut se sentir petit. 
                Quand vous avez un problème (un souci de bourse, un conflit d'horaire, 
                un amphi surchauffé), nous sommes votre bouclier et votre mégaphone. 
                Nous portons votre voix, nous siégeons dans les conseils et nous 
                nous battons pour que vos droits et vos conditions de vie soient 
                respectés.
              </p>
            </div>
            
            <div className="mission-item">
              <FaInfoCircle className="mission-icon" size={30} />
              <h3>Informer & Clarifier</h3>
              <p>
                Entre les mails de l'ENT, les affiches et les réseaux sociaux, 
                on est noyés sous l'info. On rate l'essentiel : la date limite 
                d'inscription aux options, le changement d'une salle d'examen... 
                Notre mission est d'être votre filtre. On trouve l'info, on la vérifie, 
                et on vous la transmet de façon claire et fiable.
              </p>
            </div>
            
            <div className="mission-item">
              <FaLifeRing className="mission-icon" size={30} />
              <h3>Soutenir & Accompagner</h3>
              <p>
                On sait que la vie étudiante, c'est aussi des galères. 
                Financières, morales, ou juste un gros coup de stress. 
                Vous n'êtes pas seul(e). Notre mission est de créer un filet de 
                sécurité. Que ce soit par des collectes solidaires ou simplement 
                en étant une oreille attentive, nous sommes là pour vous.
              </p>
            </div>
            
            <div className="mission-item">
              <FaDoorOpen className="mission-icon" size={30} />
              <h3>Intégrer & Accueillir</h3>
              <p>
                On se souvient tous de notre premier jour en L1, ou de l'arrivée 
                dans une ville inconnue. C'est stressant. Nous nous engageons 
                à accueillir chaque nouvel étudiant, qu'il vienne du lycée d'à 
                côté ou de l'autre bout du monde, pour que son aventure 
                universitaire commence de la meilleure façon possible.
              </p>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* 3. Section Engagements (TEXTE RÉÉCRIT) */}
      <section className="page-section alternate-bg">
        <div className="section-content">
          <h2>Nos Engagements Concrets</h2>
          <p>La mission, c'est le "pourquoi". Les engagements, c'est le "comment".</p>
          
          <div className="engagements-grid">
            
            <div className="engagement-item">
              <FaCalendarCheck className="engagement-icon" size={30} />
              <h3>Des Événements qui ont du Sens</h3>
              <p>
                On ne fait pas des soirées juste pour faire la fête. On les fait 
                pour que le L1 timide puisse parler au M2 expérimenté. On fait 
                des tournois e-sport pour que des passionnés se rencontrent. 
                Chaque événement est pensé pour vous apporter quelque chose : 
                du réseau, du fun, ou de nouvelles compétences.
              </p>
            </div>
            
            <div className="engagement-item">
              <FaHandshake className="engagement-icon" size={30} />
              <h3>Des Partenariats qui Servent Vraiment</h3>
              <p>
                Notre engagement, ce n'est pas d'avoir 50 logos sur un flyer. 
                C'est de vous faire économiser de l'argent. On cible ce qui 
                pèse sur votre budget : la nourriture, les fournitures, les 
                sorties. On négocie dur pour obtenir des réductions réelles 
                et exclusives que vous utiliserez vraiment.
              </p>
            </div>
            
            <div className="engagement-item">
              <FaHeart className="engagement-icon" size={30} />
              <h3>Une Solidarité de Proximité</h3>
              <p>
                S'engager pour la solidarité, c'est concret. C'est tenir un 
                relais d'info fiable pour réduire votre charge mentale. 
                C'est organiser une collecte pour la banque alimentaire qui 
                aidera *directement* d'autres étudiants du campus. 
                C'est être là, physiquement, à vos côtés.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Section Membres (Ne change pas) */}
      <section className="page-section">
        <div className="section-content">
          <h2>Notre Équipe</h2>
          
          {/* On change le nom de la classe pour plus de clarté */}
          <div className="membres-list"> 
            {membresData.map(membre => (
              
              /* 1. ON ENLÈVE LE WRAPPER
                 On remet juste la MemberCard simple */
              <MemberCard key={membre.id} membre={membre} />

            ))}
          </div>
        </div>
      </section>

      {/* 5. Section FAQ (Ne change pas) */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire aux Questions (FAQ)</h2>
          <div className="faq-list">
            {faqData.map(item => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
export default AboutPage;