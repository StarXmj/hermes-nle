// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
import { 
  FaUsers, FaDice, FaShieldAlt, FaInfoCircle, FaLifeRing, FaDoorOpen, 
  FaCalendarCheck, FaHandshake, FaHeart 
} from 'react-icons/fa';
import './AboutPage.css';

function AboutPage() {
  // États pour les données
  const [membres, setMembres] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  
  // États pour les chargements distincts
  const [loadingMembres, setLoadingMembres] = useState(true);
  const [loadingFaq, setLoadingFaq] = useState(true);

  // --- 1. Chargement des MEMBRES ---
  useEffect(() => {
    async function loadMembres() {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié') // Seulement les membres publiés
        .order('nom', { ascending: true }); // Tri alphabétique

      if (error) {
        console.error('Erreur chargement membres:', error);
      } else {
        setMembres(data);
      }
      setLoadingMembres(false);
    }

    loadMembres();

    // Realtime pour les membres
    const channel = supabase.channel('membres-public-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadMembres)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- 2. Chargement de la FAQ ---
  useEffect(() => {
    async function loadFaq() {
      const { data, error } = await supabase
        .from('faq') // Table 'faq' (singulier)
        .select('*')
        .eq('status', 'publié') // Seulement les questions publiées
        .order('date_creat', { ascending: true }); // Ordre de création (ou utilisez un champ 'ordre' si vous en ajoutez un)

      if (error) {
        console.error('Erreur chargement FAQ:', error);
      } else {
        setFaqItems(data);
      }
      setLoadingFaq(false);
    }

    loadFaq();

    // Realtime pour la FAQ
    const channel = supabase.channel('faq-public-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faq' }, loadFaq)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="about-page">
      <Helmet>
        <title>A propos - Hermes by NLE</title>
        <meta name="description" content="Découvrez l'équipe de l'association et les réponses à vos questions." />
      </Helmet>

      {/* 1. Section "Qui sommes-nous ?" */}
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

      {/* 2. Section Missions */}
      <section className="page-section">
        <div className="section-content">
          <h2>Notre Mission : Votre Expérience Étudiante</h2>
          <p>Notre action repose sur 6 piliers. 6 promesses que nous vous faisons.</p>
          
          <div className="missions-grid">
            <div className="mission-item">
              <FaUsers className="mission-icon" size={30} />
              <h3>Fédérer & Créer du Lien</h3>
              <p>Nous sommes là pour connecter les gens, peu importe leur filière.</p>
            </div>
            <div className="mission-item">
              <FaDice className="mission-icon" size={30} />
              <h3>Animer & Faire Vibrer</h3>
              <p>Des événements pour sortir des cours : soirées, tournois, conférences.</p>
            </div>
            <div className="mission-item">
              <FaShieldAlt className="mission-icon" size={30} />
              <h3>Représenter & Défendre</h3>
              <p>Nous portons votre voix dans les conseils et défendons vos droits.</p>
            </div>
            <div className="mission-item">
              <FaInfoCircle className="mission-icon" size={30} />
              <h3>Informer & Clarifier</h3>
              <p>Nous filtrons l'info pour vous transmettre l'essentiel clairement.</p>
            </div>
            <div className="mission-item">
              <FaLifeRing className="mission-icon" size={30} />
              <h3>Soutenir & Accompagner</h3>
              <p>Un filet de sécurité contre les galères financières ou morales.</p>
            </div>
            <div className="mission-item">
              <FaDoorOpen className="mission-icon" size={30} />
              <h3>Intégrer & Accueillir</h3>
              <p>Pour que l'aventure universitaire commence de la meilleure façon.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 3. Section Engagements */}
      <section className="page-section alternate-bg">
        <div className="section-content">
          <h2>Nos Engagements Concrets</h2>
          <p>La mission, c'est le "pourquoi". Les engagements, c'est le "comment".</p>
          
          <div className="engagements-grid">
            <div className="engagement-item">
              <FaCalendarCheck className="engagement-icon" size={30} />
              <h3>Des Événements qui ont du Sens</h3>
              <p>Chaque événement est pensé pour apporter réseau, fun ou compétences.</p>
            </div>
            <div className="engagement-item">
              <FaHandshake className="engagement-icon" size={30} />
              <h3>Des Partenariats Utiles</h3>
              <p>Des réductions réelles sur ce qui pèse sur votre budget.</p>
            </div>
            <div className="engagement-item">
              <FaHeart className="engagement-icon" size={30} />
              <h3>Solidarité de Proximité</h3>
              <p>Relais d'info fiable, collectes alimentaires et présence physique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Membres DYNAMIQUE */}
      <section className="page-section">
        <div className="section-content">
          <h2>Notre Équipe</h2>
          
          {loadingMembres ? (
            <p>Chargement de l'équipe...</p>
          ) : membres.length > 0 ? (
            <div className="membres-list"> 
              {membres.map(membre => (
                <MemberCard key={membre.id} membre={membre} />
              ))}
            </div>
          ) : (
            <p style={{fontStyle:'italic', color:'#777'}}>Aucun membre affiché pour le moment.</p>
          )}
        </div>
      </section>

      {/* 5. Section FAQ DYNAMIQUE */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire aux Questions (FAQ)</h2>
          
          {loadingFaq ? (
            <p>Chargement de la FAQ...</p>
          ) : faqItems.length > 0 ? (
            <div className="faq-list">
              {faqItems.map(item => (
                <FaqItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p style={{fontStyle:'italic', color:'#777'}}>Aucune question pour le moment.</p>
          )}
        </div>
      </section>

    </main>
  );
}

export default AboutPage;