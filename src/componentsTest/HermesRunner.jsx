import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../gameTest/GameEngine';
import { useGameAuth } from '../hooks/useGameAuth';
import './HermesRunner.css'; 
import { 
    FaArrowLeft, FaRedo, FaTrophy, FaHome, FaMobileAlt, 
    FaTimes, FaExpand, FaCrown, FaHourglassHalf, 
    FaSignOutAlt, FaEye, FaEyeSlash, 
    FaPause, FaPlay // ✅ AJOUT DES ICONES
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// ... (BIOME_COLORS, STATIC_ICONS, getTimeUntilEndOfMonth inchangés) ...
const BIOME_COLORS = {
    'NORMAL': { color: '#FFD700', label: 'OLYMPE' },
    'HADES': { color: '#FF4444', label: 'ENFERS' },
    'DIONYSOS': { color: '#E056FD', label: 'IVRESSE' },
    'ARES': { color: '#FF0000', label: 'GUERRE' },
    'FLAPPY': { color: '#00FFFF', label: 'ENVOL' },
    'INVERTED': { color: '#00FF00', label: 'CHAOS' },
    'PHILOTES': { color: '#FF69B4', label: 'AMITIÉ' }
};

const STATIC_ICONS = [
    { color: '#e74c3c', text: 'A' }, { color: '#3498db', text: 'Z' },
    { color: '#2ecc71', text: 'E' }, { color: '#f1c40f', text: 'R' },
    { color: '#9b59b6', text: 'T' }, { color: '#e67e22', text: 'Y' }
];

const getTimeUntilEndOfMonth = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diff = nextMonth - now;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  return `${d}j ${h}h ${m}m`;
};

function HermesRunnerPage() {
  const [gameStatus, setGameStatus] = useState('intro'); 
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  const [hasEnteredFullScreen, setHasEnteredFullScreen] = useState(false);
  
  // ✅ ÉTAT PAUSE
  const [isPaused, setIsPaused] = useState(false);

  const { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading: authLoading, error: authError } = useGameAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({ email: '', pseudo: '', password: '', newsletter: true });
  const [showPassword, setShowPassword] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('season');
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEndOfMonth());
  
  const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' }).toUpperCase();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const handleResize = () => { if(engineRef.current) engineRef.current.resize(); };
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setTimeLeft(getTimeUntilEndOfMonth()), 60000); 
    return () => { window.removeEventListener('resize', handleResize); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing' && canvasRef.current) {
        engineRef.current = new GameEngine(canvasRef.current, {
            onUpdateUI: (stats) => { setScore(stats.score); setCurrentBiome(stats.biome); },
            onGameOver: (result) => {
                setScore(result.score);
                setGameStatus('gameover');
                setIsPaused(false); // Reset pause en cas de mort
                if (player) saveScore(result.score);
            }
        });
        engineRef.current.start();
    }
    return () => { if (engineRef.current) engineRef.current.destroy(); };
  }, [gameStatus, player]); 

  const enterImmersion = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setHasEnteredFullScreen(true);
  };

  const startGame = () => { setGameStatus('playing'); setIsPaused(false); };

  // ✅ HANDLER PAUSE
  const handleTogglePause = () => {
      if (engineRef.current) {
          const newState = !isPaused;
          setIsPaused(newState);
          engineRef.current.togglePause(newState);
      }
  };

  const handleAuthSubmit = async (e) => {
      e.preventDefault(); e.stopPropagation();
      let res;
      
      if (authMode === 'register') {
          res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
      } else {
          res = await login(authForm.email, authForm.password);
      }
      
      if (res && res.success) {
          setShowAuthModal(false);
          setAuthForm({ email: '', pseudo: '', password: '', newsletter: true });
          
          if (gameStatus === 'gameover' && score > 0) {
              saveScore(score, res.user);
          }
      }
  };

  const openModal = (mode, e) => { if(e) e.stopPropagation(); setAuthMode(mode); setShowAuthModal(true); setShowPassword(false); };

  const currentBiomeData = BIOME_COLORS[currentBiome] || BIOME_COLORS['NORMAL'];

  // ✅ FONCTION D'AFFICHAGE ROBUSTE (AVEC MÉDAILLES & LISTE COMPLÈTE)
  // ✅ FONCTION D'AFFICHAGE (MÉDAILLES + FORMATAGE MILLIERS)
  const renderLeaderboardList = () => {
      let rawList = leaderboardTab === 'season' ? leaderboardMonthly : leaderboardAllTime;
      
      if (!rawList || !Array.isArray(rawList)) { rawList = []; }
      if (rawList.length === 0) { return <li className="empty">Chargement ou aucun score...</li>; }

      return rawList.map((l, i) => {
          const isMe = player && player.pseudo === l.pseudo;
          
          let rankDisplay;
          if (i === 0) rankDisplay = <span className="medal gold">🥇</span>;
          else if (i === 1) rankDisplay = <span className="medal silver">🥈</span>;
          else if (i === 2) rankDisplay = <span className="medal bronze">🥉</span>;
          else rankDisplay = <span className="rank">#{i + 1}</span>;

          // Récupération de la valeur brute
          const scoreValue = l.best_score !== undefined ? l.best_score : l.score;

          return (
              <li key={i} className={isMe ? 'me' : ''}>
                  {rankDisplay}
                  <span className="name">{l.pseudo || 'Anonyme'}</span>
                  
                  {/* ✅ MODIFICATION ICI : .toLocaleString('fr-FR') ajoute les espaces */}
                  <span className="score">
                    {scoreValue.toLocaleString('fr-FR')}
                  </span>
              </li>
          );
      });
  };

  return (
    <div className="greek-runner-container">
      <div className="orientation-lock">
        <div className="rotate-phone-animation"><FaMobileAlt size={80} className="phone-icon" /></div>
        <h2>TOURNEZ VOTRE ÉCRAN</h2>
        <p>L'aventure Hermès se vit à l'horizontale.</p>
      </div>

      {!hasEnteredFullScreen && (
          <div className="immersion-start-screen">
            <h1 className="greek-title-giant">HERMES QUEST</h1>
            <p>Prêt à défier les Dieux ?</p>
            <button className="greek-start-button pulse" onClick={enterImmersion}>
                <FaExpand style={{marginRight:15}}/> LANCER L'EXPÉRIENCE
            </button>
            <Link to="/" className="back-link">Retour au site</Link>
          </div>
      )}

      <canvas ref={canvasRef} className="game-canvas" />

      {/* ✅ HUD SCORE + BOUTON PAUSE */}
      {gameStatus === 'playing' && (
        <div className="greek-hud-score">
            <span className="score-simple">{Math.floor(score)}</span>
            <span className="biome-simple" style={{ color: currentBiomeData.color }}>{currentBiomeData.label}</span>
            
            {/* BOUTON PAUSE */}
            <button className="pause-btn" onClick={handleTogglePause} onTouchStart={(e) => { e.stopPropagation(); handleTogglePause(); }}>
                {isPaused ? <FaPlay /> : <FaPause />}
            </button>
        </div>
      )}

      {/* ✅ OVERLAY PAUSE */}
      {isPaused && (
          <div className="pause-overlay">
              <h1>PAUSE</h1>
              <button className="greek-start-button" onClick={handleTogglePause}>REPRENDRE</button>
          </div>
      )}

      {/* ... (Reste des overlays inchangés: Intro, GameOver, Auth) ... */}
      {hasEnteredFullScreen && gameStatus === 'intro' && (
          <div className="greek-overlay">
            <div className="waterfall-bg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="waterfall-col" style={{animationDelay: `-${i * 2}s`}}>
                        {STATIC_ICONS.map((icon, j) => <div key={j} className="wf-item" style={{color: icon.color, borderColor: icon.color}}>{icon.text}</div>)}
                        {STATIC_ICONS.map((icon, j) => <div key={`d-${j}`} className="wf-item" style={{color: icon.color, borderColor: icon.color}}>{icon.text}</div>)}
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
                                <button className="greek-btn-text" onClick={logout}><FaSignOutAlt /> Déconnexion</button>
                            </>
                        ) : (
                            <>
                                <button className="greek-btn-primary" onClick={startGame}>JOUER (INVITÉ)</button>
                                <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>SAUVEGARDER MA PROGRESSION</button>
                            </>
                        )}
                        <Link to="/" className="greek-btn-text" style={{marginTop:20}}><FaHome/> Quitter</Link>
                    </div>
                </div>
                
                <div className="menu-right">
                    <div className="leaderboard-section" onMouseDown={e => e.stopPropagation()}>
                        <div className="lb-header">
                            {leaderboardTab === 'season' ? (
                                <><FaHourglassHalf style={{color: '#DAA520', marginRight: '8px'}}/><span style={{color:'#DAA520', fontSize:'0.9rem', fontWeight: 'bold'}}>SAISON {currentMonthName} • FIN : {timeLeft}</span></>
                            ) : (
                                <><FaCrown style={{color: '#E056FD', marginRight: '8px'}}/><span style={{color:'#E056FD', fontSize:'0.9rem', fontWeight: 'bold'}}>HALL OF FAME • RECORDS ABSOLUS</span></>
                            )}
                        </div>
                        <div className="lb-tabs">
                            <button className={leaderboardTab === 'season' ? 'active' : ''} onClick={() => setLeaderboardTab('season')}>{currentMonthName}</button>
                            <button className={leaderboardTab === 'alltime' ? 'active' : ''} onClick={() => setLeaderboardTab('alltime')}>TOP LÉGENDE</button>
                        </div>
                        <ul className="lb-list">{renderLeaderboardList()}</ul>
                    </div>
                </div>
            </div>
          </div>
      )}

      {gameStatus === 'gameover' && (
          <div className="gameover-overlay">
            <div className="gameover-content">
                <h1 className="title-death">CHUTE D'ICARE</h1>
                <div className="result-box">
                    <div className="score-display"><span className="lbl">SCORE FINAL</span><span className="val">{Math.floor(score)}</span></div>
                    {player && <div className="best-display">Record personnel : {Math.max(player.best_score || 0, Math.floor(score))}</div>}
                </div>
                <div className="go-actions">
                    <button className="greek-btn-primary" onClick={startGame}><FaRedo/> REJOUER</button>
                    {!player && <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>ENREGISTRER CE SCORE</button>}
                    <button className="greek-btn-text" onClick={() => setGameStatus('intro')}><FaArrowLeft/> MENU</button>
                </div>
            </div>
          </div>
      )}

      {showAuthModal && (
            <div className="auth-modal-overlay" onMouseDown={e => e.stopPropagation()}>
                <div className="auth-modal">
                  <FaTimes className="close-btn" onClick={(e) => { e.stopPropagation(); setShowAuthModal(false); }} />
                    <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                    {authError && <div className="auth-error-message">{authError}</div>}
                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && <input type="text" placeholder="Pseudo" required value={authForm.pseudo} onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} />}
                        <input type="email" placeholder="Email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} />
                        <div className="password-input-wrapper">
                            <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} />
                            <span className="toggle-password-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                        </div>
                        <button type="submit" className="greek-btn-primary" disabled={authLoading}>{authLoading?'...':(authMode==='login'?'GO!':'VALIDER')}</button>
                    </form>
                    <p className="switch-auth" onClick={() => { setAuthMode(authMode==='login'?'register':'login'); setShowPassword(false); }}>{authMode === 'login' ? "Créer un compte" : "J'ai déjà un compte"}</p>
                </div>
            </div>
      )}
    </div>
  );
}

export default HermesRunnerPage;