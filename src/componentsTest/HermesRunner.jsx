import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../gameTest/GameEngine';
import { useGameAuth } from '../hooks/useGameAuth';
import './HermesRunner.css'; 
// ✅ AJOUT DES ICÔNES EYE ET EYESLASH
import { FaArrowLeft, FaRedo, FaTrophy, FaHome, FaMobileAlt, FaTimes, FaExpand, FaCrown, FaHourglassHalf, FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa'; 
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
  // ... (States existants) ...
  const [gameStatus, setGameStatus] = useState('intro'); 
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  const [hasEnteredFullScreen, setHasEnteredFullScreen] = useState(false);
  
  // On récupère "error" depuis le hook auth
  const { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading: authLoading, error: authError } = useGameAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({ email: '', pseudo: '', password: '', newsletter: true });
  
  // ✅ NOUVEAU STATE POUR L'OEIL
  const [showPassword, setShowPassword] = useState(false);

  const [leaderboardTab, setLeaderboardTab] = useState('season');
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEndOfMonth());
  
  const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' }).toUpperCase();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // ... (UseEffects resize/game loop/fullscreen inchangés) ...
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
                if (player) saveScore(result.score);
            }
        });
        engineRef.current.start();
    }
    return () => { if (engineRef.current) engineRef.current.destroy(); };
  }, [gameStatus, player]); 

  const enterImmersion = async () => {
      const elem = document.documentElement;
      try {
          if (elem.requestFullscreen) await elem.requestFullscreen();
          else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
          else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      } catch (err) { console.warn("Fullscreen denied", err); } 
      finally { setHasEnteredFullScreen(true); setTimeout(() => window.dispatchEvent(new Event('resize')), 500); }
  };

  const startGame = () => { setGameStatus('playing'); };

  const handleAuthSubmit = async (e) => {
      e.preventDefault(); e.stopPropagation();
      let res;
      if (authMode === 'register') res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
      else res = await login(authForm.email, authForm.password);
      
      if (res && res.success) {
          setShowAuthModal(false);
          // Reset le form et l'état mot de passe
          setAuthForm({ email: '', pseudo: '', password: '', newsletter: true });
          setShowPassword(false);
          if (gameStatus === 'gameover' && score > 0) saveScore(score);
      }
  };

  const openModal = (mode, e) => { 
      if(e) e.stopPropagation(); 
      setAuthMode(mode); 
      setShowAuthModal(true); 
      setShowPassword(false); // Reset visibility
  };

  const currentBiomeData = BIOME_COLORS[currentBiome] || BIOME_COLORS['NORMAL'];

  const renderLeaderboardList = () => {
      const currentList = leaderboardTab === 'season' 
          ? (Array.isArray(leaderboardMonthly) ? leaderboardMonthly : []) 
          : (Array.isArray(leaderboardAllTime) ? leaderboardAllTime : []);

      if (currentList.length === 0) return <li className="empty">Aucun score enregistré... Soyez le premier !</li>;

      return currentList.slice(0, 10).map((l, i) => (
          <li key={i} className={player && player.pseudo === l.pseudo ? 'me' : ''}>
              <span className="rank">#{i+1}</span>
              <span className="name">{l.pseudo || 'Anonyme'}</span>
              <span className="score">{l.best_score !== undefined ? l.best_score : l.score}</span>
          </li>
      ));
  };

  return (
    <div className="greek-runner-container">
      {/* 1. Blocage Portrait */}
      <div className="orientation-lock">
        <div className="rotate-phone-animation"><FaMobileAlt size={80} className="phone-icon" /></div>
        <h2>TOURNEZ VOTRE ÉCRAN</h2>
        <p>L'aventure Hermès se vit à l'horizontale.</p>
      </div>

      {/* 2. Accueil Immersif */}
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

      {/* Canvas Jeu */}
      <canvas ref={canvasRef} className="game-canvas" />

      {/* 3. HUD */}
      {gameStatus === 'playing' && (
        <div className="greek-hud-score">
            <span className="score-simple">{Math.floor(score)}</span>
            <span className="biome-simple" style={{ color: currentBiomeData.color }}>{currentBiomeData.label}</span>
        </div>
      )}

      {/* 4. Menu Principal */}
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

      {/* Game Over Screen */}
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

      {/* --- AUTH MODAL (Mise à jour avec Œil et Erreurs) --- */}
      {showAuthModal && (
            <div className="auth-modal-overlay" onMouseDown={e => e.stopPropagation()}>
                <div className="auth-modal">
                  <FaTimes className="close-btn" onClick={(e) => { e.stopPropagation(); setShowAuthModal(false); }} />
                    <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                    
                    {/* 🔴 AFFICHAGE DE L'ERREUR */}
                    {authError && <div className="auth-error-message">{authError}</div>}

                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && (
                            <input 
                                type="text" 
                                placeholder="Pseudo" 
                                required 
                                value={authForm.pseudo} 
                                onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} 
                            />
                        )}
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required 
                            value={authForm.email} 
                            onChange={e=>setAuthForm({...authForm, email:e.target.value})} 
                        />
                        
                        {/* 👁️ CHAMP MOT DE PASSE AVEC ICÔNE */}
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Mot de passe" 
                                required 
                                value={authForm.password} 
                                onChange={e=>setAuthForm({...authForm, password:e.target.value})} 
                            />
                            <span 
                                className="toggle-password-icon" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <button type="submit" className="greek-btn-primary" disabled={authLoading}>
                            {authLoading ? '...' : (authMode === 'login' ? 'GO!' : 'VALIDER')}
                        </button>
                    </form>
                    <p className="switch-auth" onClick={() => { setAuthMode(authMode==='login'?'register':'login'); setShowPassword(false); }}>
                        {authMode === 'login' ? "Créer un compte" : "J'ai déjà un compte"}
                    </p>
                </div>
            </div>
      )}
    </div>
  );
}

export default HermesRunnerPage;