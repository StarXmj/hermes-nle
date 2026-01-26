import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
import { 
  FaBullhorn, FaPenNib, FaCalendarAlt, 
  FaUsers, FaLaptopCode, FaUserGraduate,
  FaQuoteLeft, FaHandshake, FaGlobeEurope, FaUniversity
} from 'react-icons/fa';
import './AboutPage.css';

// 1. CONFIGURATION DES ÉQUIPES
const TEAMS_CONFIG = [
  { id: 'bureau', label: 'Le Bureau', icon: <FaUsers />, description: "L'équipe dirigeante qui coordonne l'association." },
  { id: 'communication', label: 'Pôle Communication', icon: <FaBullhorn />, description: "Ils font briller l'association sur les réseaux et le campus." },
  { id: 'redaction', label: 'Pôle Rédaction', icon: <FaPenNib />, description: "Les plumes derrière le Mensuel Hermès." },
  { id: 'evenementiel', label: 'Pôle Événementiel', icon: <FaCalendarAlt />, description: "Créateurs de rencontres et de moments forts." },
  { id: 'web', label: 'Pôle Web & Tech', icon: <FaLaptopCode />, description: "Les architectes de nos outils numériques." },
  { id: 'elus', label: 'Vos Élus Étudiants', icon: <FaUserGraduate />, description: "Vos représentants dans les conseils de l'université." }
];

// 2. HIÉRARCHIE VISUELLE
const RANK_PRIORITY = {
  'responsable': 1,
  'co-responsable': 2,
  'membre': 3
};

function AboutPage() {
  const [membres, setMembres] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // A. Récupération des membres
      const { data: dataMembres, error: errorMembres } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié')
        .order('ordre', { ascending: true });

      if (!errorMembres) setMembres(dataMembres);

      // B. Récupération de la FAQ
      const { data: dataFaq, error: errorFaq } = await supabase
        .from('faq')
        .select('*')
        .eq('status', 'publié')
        .order('date_creat', { ascending: true });
      
      if (!errorFaq) setFaqItems(dataFaq);
      
      setLoading(false);
    }

    loadData();
    
    const channel = supabase.channel('public-about')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faq' }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getTeamMembers = (teamId) => {
    if (!membres) return [];
    const teamMembers = membres.filter(m => 
      m.equipes && m.equipes.some(eqString => eqString.startsWith(`${teamId}:`))
    );
    const membersWithRank = teamMembers.map(m => {
      const equipString = m.equipes.find(s => s.startsWith(`${teamId}:`));
      const rank = equipString ? equipString.split(':')[1] : 'membre';
      return { ...m, _currentRank: rank };
    });
    return membersWithRank.sort((a, b) => {
      const rankA = RANK_PRIORITY[a._currentRank] || 99;
      const rankB = RANK_PRIORITY[b._currentRank] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return (a.ordre || 99) - (b.ordre || 99);
    });
  };

  return (
    <main className="about-page">
      <Helmet>
        <title>L'Équipe & Mission - Hermes by NLE</title>
        <meta name="description" content="Découvrez la mission et le trombinoscope de l'équipe Hermes by NLE." />
      </Helmet>

      {/* --- SECTION 1 : HERO & MISSION (Mise en valeur) --- */}
      <section className="page-section hero-about">
        <div className="section-content">
          <h1>Qui sommes-nous ?</h1>
          <p className="hero-subtitle">Le relais des étudiants de l'UPPA.</p>
          
          {/* Bloc de mise en valeur du texte */}
          <div className="mission-grid">
            
            {/* Carte 1 : Le But */}
            <div className="mission-card main-card">
              <FaUniversity className="mission-card-icon" />
              <h3>Une Mission Claire</h3>
              <p>
                Hermès by NLE vise à accompagner les étudiants dans leur vie universitaire en facilitant leur intégration, 
                leur orientation et leur accès aux différents services proposés par l'Université.
              </p>
            </div>

            {/* Carte 2 : Territoire */}
            <div className="mission-card">
              <FaGlobeEurope className="mission-card-icon" />
              <h3>Acteur du Territoire</h3>
              <p>
                Nous valorisons l'université tout en mettant en lumière l'ensemble du territoire palois. 
                Hermès by NLE apporte une nouvelle dynamique à la vie locale.
              </p>
            </div>

            {/* Carte 3 : Dynamique */}
            <div className="mission-card">
              <FaHandshake className="mission-card-icon" />
              <h3>Logique Interassociative</h3>
              <p>
                Grâce à l’organisation régulière d’événements sur le campus, nous participons activement à la dynamisation 
                de la vie étudiante, en s’appuyant sur une logique interassociative fortement affirmée.
              </p>
            </div>

          </div>

          {/* Citation du Nom */}
          <div className="quote-container">
            <FaQuoteLeft className="quote-icon" />
            <p>
              Dans la mythologie grecque, <strong>Hermès</strong> est le messager des dieux. 
              Comme lui, notre asso veut servir de relais entre les étudiants, les enseignants et les institutions.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECTION 2 : TROMBINOSCOPE --- */}
      <section className="page-section">
        <div className="section-content">
          <h2 className="section-title-center">L'Équipe</h2>
          <p className="section-subtitle-center">Les visages derrière l'association.</p>
          
          {loading ? (
            <div className="loader-container">Chargement de l'équipe...</div>
          ) : (
            <div className="trombinoscope-wrapper">
              {TEAMS_CONFIG.map(team => {
                const teamMembers = getTeamMembers(team.id);
                if (teamMembers.length === 0) return null;

                return (
                  <div key={team.id} className="team-block">
                    <div className="team-header-container">
                        <div className="team-icon-circle">{team.icon}</div>
                        <div className="team-title-box">
                            <h2>{team.label}</h2>
                            <p>{team.description}</p>
                        </div>
                    </div>

                    <div className="membres-grid">
                      {teamMembers.map(membre => (
                        <div key={membre.id} className="member-wrapper">
                          {membre._currentRank === 'responsable' && <span className="badge-resp">RESPONSABLE</span>}
                          {membre._currentRank === 'co-responsable' && <span className="badge-coresp">CO-RESP</span>}
                          <MemberCard membre={membre} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 3 : FAQ --- */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire Aux Questions</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>Une question ? La réponse est sûrement ici.</p>

          {loading ? (
            <p>Chargement...</p>
          ) : faqItems.length > 0 ? (
            <div className="faq-list">
              {faqItems.map(item => <FaqItem key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="empty-faq">Aucune question fréquente n'a été publiée pour le moment.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default AboutPage;