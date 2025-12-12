// src/pages/AssoMatchPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRedo, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';
import './AssoMatchPage.css';

function AssoMatchPage() {
  // ... (Tout le début du fichier, les états, useEffect, etc. reste EXACTEMENT PAREIL) ...
  const [candidates, setCandidates] = useState([]);
  const [nextRound, setNextRound] = useState([]);
  const [eliminated, setEliminated] = useState([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('loading');
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(null);

  useEffect(() => { loadAndShuffle(); }, []);

  const loadAndShuffle = async () => {
    setGameStatus('loading'); setWinner(null); setEliminated([]); setNextRound([]);
    const { data, error } = await supabase.from('asso').select('*').eq('status', 'publié');
    if (error || !data || data.length < 2) { setGameStatus('error'); return; }
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setCandidates(shuffled);
    setCurrentPairIndex(0);
    setGameStatus('intro');
  };

  const startGame = () => { setGameStatus('playing'); };

  const handleVote = (selected, rejected, side) => {
    if (animating) return;
    setAnimating(side);
    setTimeout(() => {
      const newNext = [...nextRound, selected];
      const newElim = rejected ? [rejected, ...eliminated] : eliminated;
      setNextRound(newNext); setEliminated(newElim);
      const nextIdx = currentPairIndex + 2;
      if (nextIdx >= candidates.length) {
        if (newNext.length === 1) { setWinner(newNext[0]); setGameStatus('winner'); }
        else { setCandidates(newNext); setNextRound([]); setCurrentPairIndex(0); }
      } else { setCurrentPairIndex(nextIdx); }
      setAnimating(null);
    }, 2500);
  };

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  if (gameStatus === 'loading') return <div className="dark-overlay loading"><p>Chargement du Vortex...</p></div>;
  if (gameStatus === 'error') return <div className="dark-overlay loading"><p>Pas assez de combattants.</p></div>;

  const getRoundName = () => {
    const rem = candidates.length;
    if (rem === 2) return "FINALE ULTIME";
    if (rem <= 4) return "DEMI-FINALES";
    return `QUALIFICATIONS (${rem} RESTANTS)`;
  };

  return (
    <div className="dark-overlay">
      <Helmet><title>Le Match - Hermes Arena</title></Helmet>
      {/* ... (L'intro reste pareil) ... */}
      {gameStatus === 'intro' && (
        <div className="intro-screen">
          <div className="waterfall-container">
            {[0, 1, 2, 3].map((colIndex) => {
              const columnCards = [...shuffleArray(candidates), ...shuffleArray(candidates), ...shuffleArray(candidates)];
              return (
                <div key={colIndex} className={`waterfall-column col-${colIndex}`}>
                  {columnCards.map((asso, i) => (
                    <div key={i} className="mini-card" style={{ borderColor: asso.color || '#333', boxShadow: `0 0 15px ${asso.color}40` }}>
                      {asso.logo ? <img src={asso.logo} alt="" loading="lazy" /> : <span style={{color: asso.color || '#fff', fontSize: '2rem', fontWeight: 'bold'}}>{asso.nom.substring(0,1)}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="intro-content">
            <h1 className="neon-title-large">CLASH DES ASSOS</h1>
            <p className="intro-subtitle">Il n'en restera qu'une.</p>
            <button className="start-button-glitch" onClick={startGame}><span className="text">COMMENCER</span><span className="decoration"></span></button>
          </div>
        </div>
      )}

      {gameStatus !== 'intro' && (
        <main className="arena-container animate-fade-in">
          
          {/* --- ECRAN DE VICTOIRE --- */}
          {gameStatus === 'winner' && winner ? (
            <div className="winner-section animate-in">
              <div className="winner-layout">
                
                <div className="winner-left">
                  <h1>LE CHAMPION</h1>
                  <div className="winner-card-wrapper">
                    {/* MODIFICATION ICI : 
                        On change isStatic={true} en isStatic={false} (ou on l'enlève car false est la valeur par défaut).
                        Cela active les événements de souris sur la carte.
                    */}
                    <AssoCard asso={winner} isStatic={false} />
                  </div>
                  <div className="winner-actions">
                     {winner.lien && <a href={winner.lien} target="_blank" rel="noreferrer" className="neon-button">Voir leur QG <FaExternalLinkAlt/></a>}
                     <button className="neon-button secondary" onClick={loadAndShuffle}><FaRedo /> Recommencer</button>
                  </div>
                </div>

                <div className="winner-right">
                  <div className="dark-rankings">
                      <h3>Tableau d'Honneur</h3>
                      <ul>
                          <li className="gold">
                            <span className="rank-num">1</span>
                            <span className="rank-name">{winner.nom}</span>
                          </li>
                          {eliminated.slice(0, 4).map((asso, i) => (
                            <li key={asso.id}>
                              <span className="rank-num">{i+2}</span>
                              <span className="rank-name">{asso.nom}</span>
                            </li>
                          ))}
                      </ul>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // ... (Le reste du JSX pour le duel reste EXACTEMENT PAREIL) ...
            <div className="duel-section">
              <p className="sub-text">Choisissez votre destinée.</p>
              <div className="duel-arena">
                {candidates[currentPairIndex] && (
                  <AssoCard 
                    asso={candidates[currentPairIndex]} 
                    className={animating === 'left' ? 'anim-winner-left' : animating ? 'anim-loser' : ''}
                    onClick={() => handleVote(candidates[currentPairIndex], candidates[currentPairIndex+1], 'left')} 
                  />
                )}
                <div className={`versus-neon ${animating ? 'fade-out' : ''}`}>VS</div>
                {candidates[currentPairIndex+1] ? (
                  <AssoCard 
                    asso={candidates[currentPairIndex+1]} 
                    className={animating === 'right' ? 'anim-winner-right' : animating ? 'anim-loser' : ''}
                    onClick={() => handleVote(candidates[currentPairIndex+1], candidates[currentPairIndex], 'right')} 
                  />
                ) : (
                  <div className={`empty-slot ${animating ? 'anim-winner-solo' : ''}`} onClick={() => handleVote(candidates[currentPairIndex], null, 'solo')}>
                    <h3>Qualifié d'office</h3>
                    <FaArrowRight size={40} className="neon-arrow"/>
                    <span>Passer le tour</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

// ... (Le composant AssoCard à la fin reste EXACTEMENT PAREIL) ...
function AssoCard({ asso, onClick, isStatic = false, className = '' }) {
  const cardRef = useRef(null);
  const mainColor = asso.color || '#0056b3';

  const handleMouseMove = (e) => {
    if (isStatic || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const center = { x: rect.width / 2, y: rect.height / 2 };
    const distanceFromCenter = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
    const maxDistance = Math.sqrt(Math.pow(center.x, 2) + Math.pow(center.y, 2));
    const opacity = distanceFromCenter / maxDistance;
    card.style.setProperty("--pointer-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--pointer-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--card-opacity", `${opacity}`);
    card.style.setProperty("--rot-x", `${(center.y - y) / 10}deg`);
    card.style.setProperty("--rot-y", `${(x - center.x) / 10}deg`);
  };

  const handleMouseLeave = () => {
    if (isStatic || !cardRef.current) return;
    const card = cardRef.current;
    card.style.setProperty("--pointer-x", `50%`);
    card.style.setProperty("--pointer-y", `50%`);
    card.style.setProperty("--card-opacity", `0`);
    card.style.setProperty("--rot-x", `0deg`);
    card.style.setProperty("--rot-y", `0deg`);
  };

  return (
    <div className={`card-scene ${className}`} onClick={onClick}>
      <div className={`card ${isStatic ? 'static' : ''}`} ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ '--asso-color': mainColor, '--pointer-x': '50%', '--pointer-y': '50%', '--card-opacity': '0', '--rot-x': '0deg', '--rot-y': '0deg' }}>
        <div className="card__front">
            <div className="card__bg"></div>
            <div className="card__content">
                <div className="card-header-type" style={{color: mainColor}}>ASSOCIATION</div>
                <div className="card-image-frame">
                    {asso.logo ? <img src={asso.logo} alt={asso.nom} /> : <div className="card-placeholder-logo" style={{color: mainColor}}>{asso.nom.substring(0,1).toUpperCase()}</div>}
                </div>
                <h2 className="card-title">{asso.nom}</h2>
                <div className="card-tags-bar">{asso.mots_cles && asso.mots_cles.slice(0, 3).map((tag, i) => <span key={i}>#{tag}</span>)}</div>
            </div>
        </div>
        <div className="card__back" style={{ backgroundColor: mainColor }}>
            <div className="card-back-content">
                {asso.logo ? <img src={asso.logo} alt="" style={{ filter: 'brightness(0) invert(1)', maxWidth: '60%' }} /> : <span style={{ fontSize: '5rem', color: 'white', fontWeight: '900' }}>{asso.nom.substring(0,1).toUpperCase()}</span>}
            </div>
        </div>
        <div className="card__shine"></div>
        <div className="card__glare"></div>
      </div>
    </div>
  );
}

export default AssoMatchPage;