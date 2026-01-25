import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MemberCard from '../components/MemberCard';
import FaqItem from '../components/FaqItem';
import { Helmet } from 'react-helmet-async';
import { 
  FaBullhorn, FaPenNib, FaCalendarAlt, 
  FaUsers, FaLaptopCode, FaUserGraduate 
} from 'react-icons/fa';
import './AboutPage.css';

// 1. CONFIGURATION DES ÉQUIPES (Doit correspondre aux IDs dans MemberForm)
const TEAMS_CONFIG = [
  { id: 'bureau', label: 'Le Bureau', icon: <FaUsers />, description: "L'équipe dirigeante qui coordonne l'association." },
  { id: 'communication', label: 'Pôle Communication', icon: <FaBullhorn />, description: "Ils font briller l'association sur les réseaux et le campus." },
  { id: 'redaction', label: 'Pôle Rédaction', icon: <FaPenNib />, description: "Les plumes derrière le Mensuel Hermès." },
  { id: 'evenementiel', label: 'Pôle Événementiel', icon: <FaCalendarAlt />, description: "Créateurs de rencontres et de moments forts." },
  { id: 'web', label: 'Pôle Web & Tech', icon: <FaLaptopCode />, description: "Les architectes de nos outils numériques." },
  { id: 'elus', label: 'Vos Élus Étudiants', icon: <FaUserGraduate />, description: "Vos représentants dans les conseils de l'université." }
];

// 2. HIÉRARCHIE VISUELLE (Ordre d'affichage dans une équipe)
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
      // On trie par ordre global pour avoir une base saine
      const { data: dataMembres, error: errorMembres } = await supabase
        .from('membres')
        .select('*')
        .eq('status', 'publié')
        .order('ordre', { ascending: true });

      if (!errorMembres) {
        setMembres(dataMembres);
      }

      // B. Récupération de la FAQ
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
    
    // Abonnement temps réel (Mise à jour auto si on modifie le back-office)
    const channel = supabase.channel('public-about')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faq' }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- LOGIQUE DE TRI INTELLIGENT ---
  const getTeamMembers = (teamId) => {
    if (!membres) return [];

    // 1. On garde ceux qui ont le tag de l'équipe (ex: "web:responsable")
    const teamMembers = membres.filter(m => 
      m.equipes && m.equipes.some(eqString => eqString.startsWith(`${teamId}:`))
    );

    // 2. On attache le rang spécifique à cette équipe
    const membersWithRank = teamMembers.map(m => {
      const equipString = m.equipes.find(s => s.startsWith(`${teamId}:`));
      const rank = equipString ? equipString.split(':')[1] : 'membre';
      return { ...m, _currentRank: rank };
    });

    // 3. On trie : Responsable > Co-Resp > Membre > Ordre Global
    return membersWithRank.sort((a, b) => {
      const rankA = RANK_PRIORITY[a._currentRank] || 99;
      const rankB = RANK_PRIORITY[b._currentRank] || 99;
      
      // Si rangs différents, le plus gradé d'abord
      if (rankA !== rankB) return rankA - rankB;
      
      // Sinon, on utilise l'ordre global défini dans la fiche membre
      return (a.ordre || 99) - (b.ordre || 99);
    });
  };

  return (
    <main className="about-page">
      <Helmet>
        <title>L'Équipe - Hermes by NLE</title>
        <meta name="description" content="Découvrez le trombinoscope de l'équipe Hermes by NLE et notre FAQ." />
      </Helmet>

      {/* --- EN-TÊTE --- */}
      <section className="page-section hero-about">
        <div className="section-content">
          <h1>Qui sommes-nous ?</h1>
          <p className="hero-subtitle">Le relais des étudiants de l'UPPA.</p>
        </div>
      </section>

      {/* --- TROMBINOSCOPE --- */}
      <section className="page-section">
        <div className="section-content">
          {loading ? (
            <p>Chargement de l'équipe...</p>
          ) : (
            <div className="trombinoscope-wrapper">
              {TEAMS_CONFIG.map(team => {
                const teamMembers = getTeamMembers(team.id);
                
                // Si personne dans l'équipe, on n'affiche pas la section
                if (teamMembers.length === 0) return null;

                return (
                  <div key={team.id} className="team-block">
                    
                    {/* Header de l'équipe */}
                    <div className="team-header-container">
                        <div className="team-icon-circle">{team.icon}</div>
                        <div className="team-title-box">
                            <h2>{team.label}</h2>
                            <p>{team.description}</p>
                        </div>
                    </div>

                    {/* Grille des membres */}
                    <div className="membres-grid">
                      {teamMembers.map(membre => (
                        <div key={membre.id} className="member-wrapper">
                          
                          {/* Badges Hiérarchiques */}
                          {membre._currentRank === 'responsable' && (
                             <span className="badge-resp">RESPONSABLE</span>
                          )}
                          {membre._currentRank === 'co-responsable' && (
                             <span className="badge-coresp">CO-RESP</span>
                          )}
                          
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

      {/* --- FAQ (Restaurée et robuste) --- */}
      <section className="page-section alternate-bg">
        <div className="section-content faq-section">
          <h2>Foire Aux Questions</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Une question ? La réponse est sûrement ici.
          </p>

          {loading ? (
            <p>Chargement des questions...</p>
          ) : faqItems.length > 0 ? (
            <div className="faq-list">
              {faqItems.map(item => (
                <FaqItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div style={{ 
                padding: '30px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                border: '1px dashed #ccc',
                color: '#777' 
            }}>
              <p>Aucune question fréquente n'a été publiée pour le moment.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}

export default AboutPage;