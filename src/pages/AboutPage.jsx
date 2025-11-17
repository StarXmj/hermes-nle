// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
// J'ai ajouté des icônes spécifiques pour vos 3 pôles
import { 
  FaBullhorn, FaPenNib, FaCalendarAlt, 
  FaUsers 
} from 'react-icons/fa';
import './AboutPage.css';

function AboutPage() {
  // États pour les données dynamiques
  const [membres, setMembres] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [loadingMembres, setLoadingMembres] = useState(true);
  const [loadingFaq, setLoadingFaq] = useState(true);

  // --- 1. Chargement des MEMBRES (Supabase) ---
  useEffect(() => {
    async function loadMembres() {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié')
        .order('nom', { ascending: true });

      if (error) console.error('Erreur chargement membres:', error);
      else setMembres(data);
      setLoadingMembres(false);
    }
    loadMembres();
    const channel = supabase.channel('membres-public').on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadMembres).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- 2. Chargement de la FAQ (Supabase) ---
  useEffect(() => {
    async function loadFaq() {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('status', 'publié')
        .order('date_creat', { ascending: true });
      if (error) console.error('Erreur chargement FAQ:', error);
      else setFaqItems(data);
      setLoadingFaq(false);
    }
    loadFaq();
    const channel = supabase.channel('faq-public').on('postgres_changes', { event: '*', schema: 'public', table: 'faq' }, loadFaq).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="about-page">
      <Helmet>
        <title>A propos - Hermes by NLE</title>
        <meta name="description" content="Découvrez la mission, l'histoire et l'équipe d'Hermes by NLE." />
      </Helmet>

      {/* 1. LE BUT (Hero Section) */}
      <section className="page-section hero-about">
        <div className="section-content">
          <h1>Le But</h1>
          <p className="hero-subtitle">
            Hermes by NLE, c'est servir de relais auprès des étudiants de l'Université de Pau et des Pays de l'Adour.
          </p>
          <p className="hero-text">
            Elle vise à accompagner les étudiants dans leur vie universitaire en facilitant leur intégration, 
            leur orientation et leur accès aux différents services proposés par l'Université, 
            les associations étudiantes et les structures partenaires.
          </p>
        </div>
      </section>

      {/* 2. LE NOM (Section Texte) */}
      <section className="page-section">
        <div className="section-content" style={{maxWidth: '800px'}}>
          <h2>Le Nom</h2>
          <div style={{textAlign: 'left', fontSize: '1.1rem', lineHeight: '1.8', color: '#444'}}>
            <p>
              Dans la mythologie grecque, <strong>Hermès</strong> est le messager des dieux, un dieu-relais qui fait 
              circuler la parole et relie les mondes. Protecteur des voyageurs et des orateurs, il incarne la communication, 
              la transmission et la médiation.
            </p>
            <p>
              Comme lui, notre asso veut servir de relais entre les étudiants, les enseignants et les institutions : 
              transmettre les infos, créer du lien, accompagner les parcours.
            </p>
            <p style={{fontWeight: 'bold', color: '#003366', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.3rem'}}>
              « Hermès, c'est plus qu'un nom : c'est une mission. »
            </p>
          </div>
        </div>
      </section>
      
      {/* 3. LES ACTIONS (3 Pôles) */}
      <section className="page-section alternate-bg">
        <div className="section-content">
          <h2>Nos Actions</h2>
          <p style={{marginBottom: '3rem'}}>3 équipes pour vous accompagner au mieux.</p>
          
          <div className="missions-grid"> {/* On réutilise la classe de grille existante */}
            
            <div className="mission-item">
              <FaBullhorn className="mission-icon" size={30} />
              <h3>Communication</h3>
              <p>Pour faire circuler l'information et valoriser vos projets.</p>
            </div>
            
            <div className="mission-item">
              <FaPenNib className="mission-icon" size={30} />
              <h3>Rédaction</h3>
              <p>Pour créer <strong>le Mensuel Hermès</strong>, une newsletter qui regroupe toutes les infos du mois à venir.</p>
            </div>
            
            <div className="mission-item">
              <FaCalendarAlt className="mission-icon" size={30} />
              <h3>Événementiel</h3>
              <p>Pour organiser des rencontres et des moments d'échange tout au long de l'année.</p>
            </div>
            
          </div>

          <div style={{marginTop: '4rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto'}}>
            <p style={{fontStyle: 'italic', fontSize: '1.15rem', color: '#555'}}>
              Et derrière tout ça, notre <strong>Bureau</strong>, qui imagine et coordonne de nombreux projets à découvrir au fil de l'année.
            </p>
          </div>

        </div>
      </section>

      {/* 4. NOTRE ÉQUIPE (Dynamique Supabase) */}
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

      {/* 5. FAQ (Dynamique Supabase) */}
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