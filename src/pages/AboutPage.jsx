import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom'; 
import { FaBullhorn, FaPenNib, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import './AboutPage.css';

function AboutPage() {
  const [membres, setMembres] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Chargement des données ---
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. Charger les membres avec la nouvelle logique de tri (colonne 'ordre')
      // Plus besoin de filtrer "manuellement" le bureau, la base de données fait foi.
      const { data: dataMembres, error: errorMembres } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié')
        .order('ordre', { ascending: true }); // Le président (1) en premier, etc.

      if (!errorMembres) {
        setMembres(dataMembres);
      } else {
        console.error("Erreur chargement membres:", errorMembres);
      }

      // 2. Charger la FAQ
      const { data: dataFaq, error: errorFaq } = await supabase
        .from('faq')
        .select('*')
        .eq('status', 'publié')
        .order('date_creat', { ascending: true });

      if (!errorFaq) {
        setFaqItems(dataFaq);
      }
      
      setLoading(false);
    }

    loadData();
    
    // Abonnement temps réel pour mise à jour immédiate si on change un membre
    const channel = supabase.channel('public-about')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fonction utilitaire pour récupérer les membres d'une équipe spécifique
  // Vérifie si le tableau 'equipes' de la personne contient le tag demandé
  const getMembersByTeam = (teamName) => {
    return membres.filter(m => m.equipes && m.equipes.includes(teamName));
  };

  return (
    <main className="about-page">
      <Helmet>
        <title>A propos & Équipe - Hermes by NLE</title>
        <meta name="description" content="Découvrez la mission, les pôles et le trombinoscope de l'équipe Hermes by NLE." />
      </Helmet>

      {/* 1. LE BUT */}
      <section className="page-section hero-about">
        <div className="section-content">
          <h1>Le But</h1>
          <p className="hero-subtitle">
            Hermes by NLE, c'est servir de relais auprès des étudiants de l'Université de Pau et des Pays de l'Adour.
          </p>
          <p className="hero-text">
            Elle vise à accompagner les étudiants dans leur vie universitaire en facilitant leur intégration, 
            leur orientation et leur accès aux différents services proposés par l'Université.
          </p>
        </div>
      </section>

      {/* 2. LE NOM */}
      <section className="page-section">
        <div className="section-content" style={{maxWidth: '800px'}}>
          <h2>Le Nom</h2>
          <div style={{textAlign: 'left', fontSize: '1.1rem', lineHeight: '1.8', color: '#444'}}>
            <p>
              Dans la mythologie grecque, <strong>Hermès</strong> est le messager des dieux, un dieu-relais qui fait 
              circuler la parole et relie les mondes.
            </p>
            <p>
              Comme lui, notre asso veut servir de relais entre les étudiants, les enseignants et les institutions.
            </p>
            <p style={{fontWeight: 'bold', color: '#003366', marginTop: '1.5rem', textAlign: 'center', fontSize: '1.3rem'}}>
              « Hermès, c'est plus qu'un nom : c'est une mission. »
            </p>
          </div>
        </div>
      </section>
      
      {/* 3. NOS ACTIONS (Liens vers les pages pôles) */}
      <section className="page-section alternate-bg">
        <div className="section-content">
          <h2>Nos Pôles</h2>
          <p style={{marginBottom: '3rem'}}>3 équipes pour vous accompagner au mieux.</p>
          
          <div className="missions-grid">
            <Link to="/communication" className="mission-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FaBullhorn className="mission-icon" size={30} />
              <h3>Communication</h3>
              <p>Pour faire circuler l'information et valoriser vos projets.</p>
            </Link>
            
            <Link to="/redaction" className="mission-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FaPenNib className="mission-icon" size={30} />
              <h3>Rédaction</h3>
              <p>Pour créer <strong>le Mensuel Hermès</strong>, une newsletter qui regroupe toutes les infos.</p>
            </Link>
            
            <Link to="/evenementiel" className="mission-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FaCalendarAlt className="mission-icon" size={30} />
              <h3>Événementiel</h3>
              <p>Pour organiser des rencontres et des moments d'échange.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TROMBINOSCOPE (Remplace "Le Bureau") */}
      <section className="page-section">
        <div className="section-content">
          <h2 className="trombi-title">L'Équipe</h2>
          <p className="trombi-subtitle">Les visages derrière l'association.</p>
          
          {loading ? (
            <p>Chargement du trombinoscope...</p>
          ) : (
            <div className="trombinoscope-container">

              {/* --- LE BUREAU --- */}
              <TeamSection 
                title="Le Bureau" 
                icon={<FaUsers />}
                members={getMembersByTeam('bureau')} 
                description="Ils coordonnent la vision et la gestion de l'association."
              />

              {/* --- COMMUNICATION --- */}
              <TeamSection 
                title="Pôle Communication" 
                icon={<FaBullhorn />}
                members={getMembersByTeam('communication')} 
                // description="Ils font briller l'association sur les réseaux et le campus."
              />

              {/* --- RÉDACTION --- */}
              <TeamSection 
                title="Pôle Rédaction" 
                icon={<FaPenNib />}
                members={getMembersByTeam('redaction')} 
                // description="Les plumes qui rédigent le Mensuel Hermès."
              />

              {/* --- ÉVÉNEMENTIEL --- */}
              <TeamSection 
                title="Pôle Événementiel" 
                icon={<FaCalendarAlt />}
                members={getMembersByTeam('evenementiel')} 
                // description="Les créateurs de rencontres et de moments forts."
              />

            </div>
          )}
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire aux Questions (FAQ)</h2>
          {loading ? (
            <p>Chargement...</p>
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

// --- Composant Interne pour afficher une section d'équipe ---
// Cela évite de répéter le code pour chaque pôle
function TeamSection({ title, icon, members, description }) {
  // Si personne dans cette équipe, on n'affiche pas la section entière
  if (!members || members.length === 0) return null;

  return (
    <div className="team-section">
      <div className="team-header">
        <span className="team-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      {description && <p className="team-description">{description}</p>}
      
      <div className="membres-list">
        {members.map(membre => (
          <MemberCard key={membre.id} membre={membre} />
        ))}
      </div>
    </div>
  );
}

export default AboutPage;