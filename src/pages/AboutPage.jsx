// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom'; 

import { 
  FaBullhorn, FaPenNib, FaCalendarAlt, 
  FaUsers 
} from 'react-icons/fa';
import './AboutPage.css';

// Fonctions utilitaires pour le tri
const getBureauRank = (role) => {
  if (!role) return 99;
  const r = role.toLowerCase();
  // Ordre strict : Président > VP > Secrétaire > Trésorier
  if (r.includes('président') && !r.includes('vice')) return 1;
  if (r.includes('vice')) return 2;
  if (r.includes('secrétaire')) return 3;
  if (r.includes('trésorier')) return 4;
  return 99; // Pas dans le bureau principal
};

const getPoleCategory = (role) => {
  if (!role) return null;
  const r = role.toLowerCase();
  // Détection des mots clés pour les pôles
  if (r.includes('communication') || r.includes('com')) return 'communication';
  if (r.includes('rédaction') || r.includes('redac')) return 'redaction';
  if (r.includes('événementiel') || r.includes('event')) return 'evenementiel';
  return null;
};

function AboutPage() {
  const [membres, setMembres] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [loadingMembres, setLoadingMembres] = useState(true);
  const [loadingFaq, setLoadingFaq] = useState(true);

  // États dérivés pour l'affichage
  const [bureauMembers, setBureauMembers] = useState([]);
  const [poleMembers, setPoleMembers] = useState({ communication: [], redaction: [], evenementiel: [] });

  // --- Chargement des données ---
  useEffect(() => {
    async function loadMembres() {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié');

      if (error) {
        console.error('Erreur chargement membres:', error);
      } else {
        setMembres(data);
        
        // 1. Filtrer et Trier le Bureau
        const bureau = data
          .filter(m => getBureauRank(m.role) < 99)
          .sort((a, b) => getBureauRank(a.role) - getBureauRank(b.role));
        setBureauMembers(bureau);

        // 2. Filtrer les Responsables de Pôle
        const poles = { communication: [], redaction: [], evenementiel: [] };
        data.forEach(m => {
          const category = getPoleCategory(m.role);
          if (category && poles[category]) {
            poles[category].push(m);
          }
        });
        setPoleMembers(poles);
      }
      setLoadingMembres(false);
    }
    loadMembres();
    
    // Abonnement temps réel
    const channel = supabase.channel('membres-public').on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadMembres).subscribe();
    
    // Chargement FAQ
    async function loadFaq() {
      const { data, error } = await supabase.from('faq').select('*').eq('status', 'publié').order('date_creat', { ascending: true });
      if (!error) setFaqItems(data);
      setLoadingFaq(false);
    }
    loadFaq();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Petit composant interne pour afficher un responsable dans une carte
  const PoleResponsable = ({ members }) => {
    if (!members || members.length === 0) return null;
    return (
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#003366', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Responsable{members.length > 1 ? 's' : ''} :
        </p>
        {members.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {m.photo ? (
              <img src={m.photo} alt={m.nom} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUsers size={14} color="#aaa"/></div>
            )}
            <div>
              <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#333' }}>{m.nom}</span>
              {/* On peut afficher le rôle exact si besoin, sinon juste le nom suffit souvent ici */}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="about-page">
      <Helmet>
        <title>A propos - Hermes by NLE</title>
        <meta name="description" content="Découvrez la mission, l'histoire et l'équipe d'Hermes by NLE." />
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
      
      {/* 3. NOS ACTIONS & RESPONSABLES DE PÔLE */}
      <section className="page-section alternate-bg">
        <div className="section-content">
          <h2>Nos Actions</h2>
          <p style={{marginBottom: '3rem'}}>3 équipes pour vous accompagner au mieux.</p>
          
          <div className="missions-grid">
            
            {/* --- COMMUNICATION --- */}
            <Link 
              to="/communication" 
              className="mission-item"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <FaBullhorn className="mission-icon" size={30} />
              <h3>Communication</h3>
              <p>Pour faire circuler l'information et valoriser vos projets.</p>
              
              {/* Affichage du responsable si présent */}
              <PoleResponsable members={poleMembers.communication} />
            </Link>
            
            {/* --- RÉDACTION --- */}
            <Link 
              to="/redaction" 
              className="mission-item"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <FaPenNib className="mission-icon" size={30} />
              <h3>Rédaction</h3>
              <p>Pour créer <strong>le Mensuel Hermès</strong>, une newsletter qui regroupe toutes les infos.</p>
              
              {/* Affichage du responsable si présent */}
              <PoleResponsable members={poleMembers.redaction} />
            </Link>
            
            {/* --- ÉVÉNEMENTIEL --- */}
            <Link 
              to="/evenementiel" 
              className="mission-item"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <FaCalendarAlt className="mission-icon" size={30} />
              <h3>Événementiel</h3>
              <p>Pour organiser des rencontres et des moments d'échange.</p>
              
              {/* Affichage du responsable si présent */}
              <PoleResponsable members={poleMembers.evenementiel} />
            </Link>
            
          </div>
        </div>
      </section>

      {/* 4. NOTRE ÉQUIPE (LE BUREAU UNIQUEMENT) */}
      <section className="page-section">
        <div className="section-content">
          <h2>Le Bureau</h2>
          <p>Ceux qui coordonnent l'association.</p>
          
          {loadingMembres ? (
            <p>Chargement de l'équipe...</p>
          ) : bureauMembers.length > 0 ? (
            <div className="membres-list"> 
              {bureauMembers.map(membre => (
                <MemberCard key={membre.id} membre={membre} />
              ))}
            </div>
          ) : (
            <p style={{fontStyle:'italic', color:'#777'}}>Aucun membre du bureau affiché pour le moment.</p>
          )}
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire aux Questions (FAQ)</h2>
          {loadingFaq ? (
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

export default AboutPage;