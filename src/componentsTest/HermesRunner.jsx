import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { GameEngine } from '../gameTest/GameEngine';
import { useGameAuth } from '../hooks/useGameAuth';
import './HermesRunner.css'; 
import { FaArrowLeft, FaRedo, FaSignOutAlt, FaTrophy, FaCalendarAlt, FaHome, FaMobileAlt, FaTimes, FaExpand } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Couleurs Néon pour les Biomes
const BIOME_COLORS = {
    'NORMAL': { color: '#FFD700', label: 'OLYMPE' },
    'HADES': { color: '#FF4444', label: 'ENFERS' },
    'DIONYSOS': { color: '#E056FD', label: 'IVRESSE' },
    'ARES': { color: '#FF0000', label: 'GUERRE' },
    'FLAPPY': { color: '#00FFFF', label: 'ENVOL' },
    'INVERTED': { color: '#00FF00', label: 'CHAOS' },
    'PHILOTES': { color: '#FF69B4', label: 'AMITIÉ' }
};

const getTimeUntilEndOfMonth = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diff = nextMonth - now;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  return `${d}j ${h}h ${m}m`;
};

const STATIC_ICONS = [
    { color: '#e74c3c', text: 'A' }, { color: '#3498db', text: 'Z' },
    { color: '#2ecc71', text: 'E' }, { color: '#f1c40f', text: 'R' },
    { color: '#9b59b6', text: 'T' }, { color: '#e67e22', text: 'Y' }
];

function HermesRunnerPage() {
  const [gameStatus, setGameStatus] = useState('intro'); 
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  const [hasEnteredFullScreen, setHasEnteredFullScreen] = useState(false);
  
  // ✅ CORRECTION BLOCAGE : Initialisation précise
  const [isPortrait, setIsPortrait] = useState(() => {
      // On vérifie directement les dimensions au chargement
      if (typeof window !== 'undefined') {
          return window.innerHeight > window.innerWidth;
      }
      return false;
  });

  const { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading: authLoading, error: authError } = useGameAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({ email: '', pseudo: '', password: '', newsletter: true });
  const [leaderboardTab, setLeaderboardTab] = useState('season');
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEndOfMonth());
  const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' }).toUpperCase();

  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // ✅ DÉTECTION ORIENTATION ROBUSTE
  useEffect(() => {
    const handleResize = () => {
      // Si la hauteur est plus grande que la largeur = PORTRAIT = BLOCAGE
      const isVert = window.innerHeight > window.innerWidth;
      setIsPortrait(isVert);
      
      if(engineRef.current) engineRef.current.resize();
    };
    
    window.addEventListener('resize', handleResize);
    // On force une vérification après un petit délai pour gérer l'apparition de la barre d'adresse mobile
    setTimeout(handleResize, 100);
    
    const timer = setInterval(() => setTimeLeft(getTimeUntilEndOfMonth()), 60000); 
    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(timer);
    };
  }, []);

  // Moteur de jeu
  useEffect(() => {
    if (gameStatus === 'playing' && canvasRef.current) {
        engineRef.current = new GameEngine(canvasRef.current, {
            onUpdateUI: (stats) => {
                setScore(stats.score);
                setCurrentBiome(stats.biome);
            },
            onGameOver: (result) => {
                setScore(result.score);
                setGameStatus('gameover');
                if (player) saveScore(result.score);
            }
        });
        engineRef.current.start();
    }
    return () => { 
        if (engineRef.current) engineRef.current.destroy(); 
    };
  }, [gameStatus, player]); 

  const enterImmersion = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setHasEnteredFullScreen(true);
  };

  const startGame = () => { setGameStatus('playing'); };

  const handleAuthSubmit = async (e) => {
      e.preventDefault(); e.stopPropagation();
      let res;
      if (authMode === 'register') res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
      else res = await login(authForm.email, authForm.password);
      if (res.success) {
          setShowAuthModal(false);
          if (gameStatus === 'gameover' && score > 0) saveScore(score);
      }
  };

  const openModal = (mode, e) => { if(e) e.stopPropagation(); setAuthMode(mode); setShowAuthModal(true); };

  const currentBiomeData = BIOME_COLORS[currentBiome] || BIOME_COLORS['NORMAL'];

  const Leaderboard = () => (
      <div className="leaderboard-section" onMouseDown={e => e.stopPropagation()}>
        <div className="lb-header">
            <span style={{color:'#DAA520', fontSize:'0.8rem'}}>FIN {currentMonthName} : {timeLeft}</span>
        </div>
        <div className="lb-tabs">
            <button className={leaderboardTab === 'season' ? 'active' : ''} onClick={() => setLeaderboardTab('season')}>{currentMonthName}</button>
            <button className={leaderboardTab === 'alltime' ? 'active' : ''} onClick={() => setLeaderboardTab('alltime')}>LÉGENDE</button>
        </div>
        <ul className="lb-list">
            {(leaderboardTab === 'season' ? leaderboardMonthly : leaderboardAllTime).slice(0, 10).map((l, i) => (
                <li key={i} className={player && player.pseudo === l.pseudo ? 'me' : ''}>
                    <span className="rank">#{i+1}</span>
                    <span className="name">{l.pseudo}</span>
                    <span className="score">{l.best_score || l.score}</span>
                </li>
            ))}
            {(leaderboardTab === 'season' ? leaderboardMonthly : leaderboardAllTime).length === 0 && <li className="empty">Aucun score...</li>}
        </ul>
      </div>
  );

  return (
    <div className={`greek-runner-container ${isPortrait ? 'portrait-mode' : 'landscape-mode'}`}>
      
      {/* 1. BLOCAGE PORTRAIT (RENDU CONDITIONNEL JS) */}
      {/* Si isPortrait est faux, cette div n'existe pas dans le DOM, donc impossible de bloquer */}
      {isPortrait && (
          <div className="orientation-lock">
            <div className="rotate-phone-animation">
                <FaMobileAlt size={80} className="phone-icon" />
            </div>
            <h2 style={{marginTop: 20}}>TOURNEZ VOTRE ÉCRAN</h2>
            <p>L'aventure ne peut se vivre qu'à l'horizontale</p>
          </div>
      )}

      {/* 2. ACCUEIL IMMERSIF */}
      {!hasEnteredFullScreen && !isPortrait && (
          <div className="immersion-start-screen">
            <h1 className="greek-title-giant">HERMES QUEST</h1>
            <p>Prêt à défier les Dieux ?</p>
            <button className="greek-start-button pulse" onClick={enterImmersion}>
                <FaExpand style={{marginRight:15}}/> LANCER L'EXPÉRIENCE
            </button>
            <Link to="/" className="back-link">Retour au site</Link>
          </div>
      )}

      {/* CANVAS */}
      <canvas ref={canvasRef} className="game-canvas" />

      {/* 3. HUD (MODIFIÉ : PLUS DE CONTOUR JAUNE) */}
      {gameStatus === 'playing' && !isPortrait && (
        <div className="greek-hud-score">
            <span className="score-simple">{Math.floor(score)}</span>
            <span className="biome-simple" style={{ color: currentBiomeData.color }}>
                {currentBiomeData.label}
            </span>
        </div>
      )}

      {/* MENU */}
      {hasEnteredFullScreen && gameStatus === 'intro' && !isPortrait && (
          <div className="greek-overlay">
            <div className="waterfall-bg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="waterfall-col" style={{animationDelay: `-${i * 2}s`}}>
                        {STATIC_ICONS.map((icon, j) => (
                            <div key={j} className="wf-item" style={{color: icon.color, borderColor: icon.color}}>{icon.text}</div>
                        ))}
                        {STATIC_ICONS.map((icon, j) => (
                            <div key={`dup-${j}`} className="wf-item" style={{color: icon.color, borderColor: icon.color}}>{icon.text}</div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="menu-container">
                <div className="menu-left">
                    <h1 className="menu-title">HERMES<br/>QUEST</h1>
                    <div className="menu-buttons">
                        {player ? (
                            <>
                                <div className="player-info">Héros : <strong style={{color:'#DAA520'}}>{player.pseudo}</strong></div>
                                <button className="greek-btn-primary" onClick={startGame}>JOUER</button>
                                <button className="greek-btn-text" onClick={logout}>Déconnexion</button>
                            </>
                        ) : (
                            <>
                                <button className="greek-btn-primary" onClick={startGame}>JOUER (INVITÉ)</button>
                                <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>SAUVEGARDER</button>
                            </>
                        )}
                        <Link to="/" className="greek-btn-text" style={{marginTop:20}}><FaHome/> Quitter</Link>
                    </div>
                </div>
                <div className="menu-right">
                    <Leaderboard />
                </div>
            </div>
          </div>
      )}

      {/* GAME OVER */}
      {gameStatus === 'gameover' && !isPortrait && (
          <div className="gameover-overlay">
            <div className="gameover-content">
                <h1 className="title-death">CHUTE D'ICARE</h1>
                <div className="result-box">
                    <div className="score-display">
                        <span className="lbl">SCORE FINAL</span>
                        <span className="val">{Math.floor(score)}</span>
                    </div>
                    {player && <div className="best-display">Record : {Math.max(player.best_score || 0, Math.floor(score))}</div>}
                </div>
                <div className="go-actions">
                    <button className="greek-btn-primary" onClick={startGame}><FaRedo/> REJOUER</button>
                    {!player && <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>ENREGISTRER</button>}
                    <button className="greek-btn-text" onClick={() => setGameStatus('intro')}><FaArrowLeft/> MENU</button>
                </div>
            </div>
          </div>
      )}

      {/* AUTH */}
      {showAuthModal && (
            <div className="auth-modal-overlay" onMouseDown={e => e.stopPropagation()}>
                <div className="auth-modal">
                  <FaTimes className="close-btn" onClick={(e) => { e.stopPropagation(); setShowAuthModal(false); }} />
                    <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && <input type="text" placeholder="Pseudo" required value={authForm.pseudo} onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} />}
                        <input type="email" placeholder="Email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} />
                        <input type="password" placeholder="Mot de passe" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} />
                        <button type="submit" className="greek-btn-primary" disabled={authLoading}>{authLoading?'...':(authMode==='login'?'GO!':'VALIDER')}</button>
                    </form>
                    <p className="switch-auth" onClick={() => setAuthMode(authMode==='login'?'register':'login')}>{authMode === 'login' ? "Créer un compte" : "J'ai déjà un compte"}</p>
                </div>
            </div>
      )}
    </div>
  );
}

export default HermesRunnerPage;