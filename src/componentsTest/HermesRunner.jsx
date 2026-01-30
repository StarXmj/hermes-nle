import React, { useState, useEffect, useRef } from 'react';import { supabase } from '../supabaseClient'; 
import { GameEngine } from '../gameTest/GameEngine';
import { useGameAuth } from '../hooks/useGameAuth';
import ProgressionGraph from './ProgressionGraph'; 
import './HermesRunner.css'; 
import { 
    FaArrowLeft, FaRedo, FaTrophy, FaHome, FaMobileAlt, 
    FaTimes, FaExpand, FaCrown, FaHourglassHalf, 
    FaSignOutAlt, FaEye, FaEyeSlash, 
    FaPause, FaPlay, FaDownload,
    FaChartLine, FaInfoCircle ,FaUsers
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BIOME_COLORS = {
    'NORMAL': { color: '#FFD700', label: 'OLYMPE' },
    'HADES': { color: '#FF4444', label: 'ENFERS' },
    'DIONYSOS': { color: '#E056FD', label: 'IVRESSE' },
    'ARES': { color: '#FF0000', label: 'GUERRE' },
    'FLAPPY': { color: '#00FFFF', label: 'ENVOL' },
    'INVERTED': { color: '#00FF00', label: 'CHAOS' },
    'PHILOTES': { color: '#FF69B4', label: 'AMITIÉ' }
};
// ...
// ...
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
    const [onlinePlayers, setOnlinePlayers] = useState(1); // On commence à 1 (vous !)

  const [gameStatus, setGameStatus] = useState('intro'); 
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  const [hasEnteredFullScreen, setHasEnteredFullScreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ ÉTATS POUR LA PROGRESSION
  const [showProgression, setShowProgression] = useState(false);
  const [history, setHistory] = useState([]);
  const [showLegend, setShowLegend] = useState(false); 

  // ✅ ÉTATS POUR L'INSTALLATION PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

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
    
    const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => { 
        window.removeEventListener('resize', handleResize); 
        window.removeEventListener('beforeinstallprompt', handler);
        clearInterval(timer); 
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing' && canvasRef.current) {
        engineRef.current = new GameEngine(canvasRef.current, {
            onUpdateUI: (stats) => { setScore(stats.score); setCurrentBiome(stats.biome); },
            onGameOver: (result) => {
                setScore(result.score);
                setGameStatus('gameover');
                setIsPaused(false);
                if (player) saveScore(result.score);
            }
        });
        engineRef.current.start();
    }
    return () => { if (engineRef.current) engineRef.current.destroy(); };
  }, [gameStatus, player]); 

  // ✅ RADAR EN TEMPS RÉEL (Supabase Presence)
  useEffect(() => {
    // On crée un canal de communication global
    const channel = supabase.channel('online_users_room', {
      config: {
        presence: {
          key: player ? player.pseudo : 'invité-' + Math.random(), // Identifiant unique
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Dès que quelqu'un arrive ou part, on recompte
        const state = channel.presenceState();
        // On compte le nombre de clés uniques
        setOnlinePlayers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // On signale notre présence aux autres
          await channel.track({ online_at: new Date() });
        }
      });

    // Nettoyage quand on quitte la page
    return () => {
      supabase.removeChannel(channel);
    };
  }, [player]); // Se relance si le joueur se connecte (pour mettre à jour son pseudo)

  const handleInstallClick = async (e) => {
      e.stopPropagation();
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') setDeferredPrompt(null);
      } else if (isIOS) {
          alert("Pour installer sur iPhone :\n1. Cliquez sur 'Partager' (carré avec flèche).\n2. Cliquez sur 'Sur l'écran d'accueil'.");
      }
  };

  const enterImmersion = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setHasEnteredFullScreen(true);
  };

  const startGame = () => { setGameStatus('playing'); setIsPaused(false); };

  // --- GESTION PAUSE ---

  const handleTogglePause = () => {
      if (engineRef.current) {
          const newState = !isPaused;
          setIsPaused(newState);
          engineRef.current.togglePause(newState);
      }
  };

  const handleRestart = () => {
      setIsPaused(false); 
      if (engineRef.current) {
          engineRef.current.reset(); 
          engineRef.current.start(); 
          engineRef.current.isPaused = false; 
          engineRef.current.lastTime = performance.now(); 
      }
      setScore(0); 
  };

  const handleQuit = () => {
      setIsPaused(false);
      setGameStatus('intro');
      if (engineRef.current) {
          engineRef.current.destroy();
      }
  };

  // --- GESTION PROGRESSION (HISTORIQUE) ---
  const loadHistory = async () => {
    if (!player) return;
    const { data } = await supabase
        .from('arcade_scores')
        .select('score, created_at')
        .eq('player_id', player.id)
        .order('created_at', { ascending: false }); 

    if (data) setHistory(data);
    setShowProgression(true);
  };

  const handleAuthSubmit = async (e) => {
      e.preventDefault(); e.stopPropagation();
      let res;
      if (authMode === 'register') res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
      else res = await login(authForm.email, authForm.password);
      
      if (res && res.success) {
          setShowAuthModal(false);
          setAuthForm({ email: '', pseudo: '', password: '', newsletter: true });
          if (gameStatus === 'gameover' && score > 0) saveScore(score, res.user);
      }
  };

  const openModal = (mode, e) => { if(e) e.stopPropagation(); setAuthMode(mode); setShowAuthModal(true); setShowPassword(false); };

  // ✅ RENDU LEADERBOARD AVEC BADGES
  const renderLeaderboardList = () => {
      let rawList = leaderboardTab === 'season' ? leaderboardMonthly : leaderboardAllTime;
      if (!rawList || !Array.isArray(rawList)) rawList = [];
      if (rawList.length === 0) return <li className="empty">Chargement...</li>;

      // 1. CALCUL DES ROIS (UNIQUE PAR CATÉGORIE)
      // On ne prend que les joueurs éligibles (>= 20 parties)
      const eligiblePlayers = rawList.filter(p => p.total_games >= 20);

      let bestPhenixId = null;
      let bestTitanId = null;
      let bestVirtuoseId = null;

      if (eligiblePlayers.length > 0) {
          // Trouver la meilleure progression (Phénix)
          const maxSlope = Math.max(...eligiblePlayers.map(p => p.progression_slope));
          const phenix = eligiblePlayers.find(p => p.progression_slope === maxSlope && maxSlope > 0); // Doit être positif
          if (phenix) bestPhenixId = phenix.id || phenix.pseudo; // Fallback pseudo si id manque

          // Trouver la meilleure moyenne (Titan)
          const maxMean = Math.max(...eligiblePlayers.map(p => p.mean_score));
          const titan = eligiblePlayers.find(p => p.mean_score === maxMean);
          if (titan) bestTitanId = titan.id || titan.pseudo;

          // Trouver la meilleure médiane (Virtuose)
          const maxMedian = Math.max(...eligiblePlayers.map(p => p.median_score));
          const virtuose = eligiblePlayers.find(p => p.median_score === maxMedian);
          if (virtuose) bestVirtuoseId = virtuose.id || virtuose.pseudo;
      }

      return rawList.map((l, i) => {
          const isMe = player && player.pseudo === l.pseudo;
          // Identification unique (ID ou Pseudo)
          const playerId = l.id || l.pseudo; 

          let rankDisplay;
          if (i === 0) rankDisplay = <span className="medal gold">🥇</span>;
          else if (i === 1) rankDisplay = <span className="medal silver">🥈</span>;
          else if (i === 2) rankDisplay = <span className="medal bronze">🥉</span>;
          else rankDisplay = <span className="rank">#{i + 1}</span>;
          
          const scoreValue = l.best_score !== undefined ? l.best_score : l.score;

          // --- ATTRIBUTION DES BADGES UNIQUES ---
          const badges = [];

          if (playerId === bestPhenixId) {
              badges.push({ icon: "🔥", title: "LE PHÉNIX : Meilleure progression actuelle" });
          }
          if (playerId === bestTitanId) {
              badges.push({ icon: "🗿", title: "LE TITAN : Meilleure moyenne de points" });
          }
          if (playerId === bestVirtuoseId) {
              badges.push({ icon: "🎻", title: "LE VIRTUOSE : Meilleure médiane (Technique pure)" });
          }

          return (
              <li key={i} className={isMe ? 'me' : ''}>
                  {rankDisplay}
                  
                  <span className="name">
                      {l.pseudo || 'Anonyme'}
                      {/* Affichage des badges */}
                      {badges.map((b, idx) => (
                          <span 
                            key={idx}
                            style={{marginLeft:'6px', cursor:'help', fontSize:'1rem'}} 
                            title={b.title} 
                          >
                              {b.icon}
                          </span>
                      ))}
                  </span>
                  
                  <span className="score">{scoreValue.toLocaleString('fr-FR')}</span>
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

      {/* HUD Score & Pause */}
      {gameStatus === 'playing' && (
        <div className="greek-hud-score">
            <span className="score-simple">{Math.floor(score)}</span>
            <span className="biome-simple" style={{ color: (BIOME_COLORS[currentBiome] || BIOME_COLORS['NORMAL']).color }}>{(BIOME_COLORS[currentBiome] || BIOME_COLORS['NORMAL']).label}</span>
            
            <button 
                className="pause-btn" 
                onClick={handleTogglePause} 
                onTouchEnd={(e) => {
                    e.preventDefault(); e.stopPropagation(); handleTogglePause();
                }}
            >
                {isPaused ? <FaPlay /> : <FaPause />}
            </button>
        </div>
      )}

      {/* OVERLAY PAUSE */}
      {isPaused && (
          <div 
            className="pause-overlay"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
              <h1>PAUSE</h1>
              <div className="pause-menu">
                  <button className="btn-pause-resume" onClick={handleTogglePause} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePause(); }}>
                      <FaPlay size={18} /> REPRENDRE
                  </button>
                  <button className="btn-pause-secondary" onClick={handleRestart} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleRestart(); }}>
                      <FaRedo size={18} /> RECOMMENCER
                  </button>
                  <button className="btn-pause-secondary" onClick={handleQuit} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleQuit(); }}>
                      <FaHome size={18} /> QUITTER
                  </button>
              </div>
          </div>
      )}

      {/* MENU PRINCIPAL */}
      {hasEnteredFullScreen && gameStatus === 'intro' && (
          <div className="greek-overlay">
            <div className="waterfall-bg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="waterfall-col" style={{animationDelay: `-${i * 2}s`}}>
                        {STATIC_ICONS.map((icon, j) => <div key={j} className="wf-item" style={{color: icon.color, borderColor: icon.color}}>{icon.text}</div>)}
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
                                <button className="greek-btn-secondary" onClick={loadHistory} style={{marginTop:'10px'}}>
                                    <FaChartLine style={{marginRight:'8px'}}/> MA PROGRESSION
                                </button>
                                <button className="greek-btn-text" onClick={logout}><FaSignOutAlt /> Déconnexion</button>
                            </>
                        ) : (
                            <>
                                <button className="greek-btn-primary" onClick={startGame}>JOUER (INVITÉ)</button>
                                <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>SAUVEGARDER MA PROGRESSION</button>
                            </>
                        )}
                        {/* ... dans le menu-left, en bas ... */}

<div style={{
    marginTop: 'auto', 
    paddingTop: '20px',
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    color: '#888', 
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #333',
    width: 'fit-content'
}}>
    {/* Point vert pulsant */}
    <div style={{
        width: '8px', 
        height: '8px', 
        background: '#00FF00', 
        borderRadius: '50%', 
        boxShadow: '0 0 10px #00FF00',
        animation: 'pulseGreen 2s infinite'
    }}></div>
    
    <span style={{color: '#fff', fontWeight:'bold', fontSize:'1rem'}}>
        {onlinePlayers}
    </span> 
    
    HEROS EN LIGNE
</div>

{/* Ajoutez cette animation dans votre CSS ou laissez-la ici si vous utilisez styled-components, 
    mais le plus simple est de l'avoir dans le CSS global */}
<style>{`
    @keyframes pulseGreen {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
    }
`}</style>

<p style={{marginTop: '10px', fontSize:'0.7rem', color:'#444'}}>v1.14</p>
                        <Link to="/" className="greek-btn-text" style={{marginTop:20}}><FaHome/> Quitter</Link>
                    </div>
                </div>
                
                <div className="menu-right">
                    <div className="leaderboard-section" onMouseDown={e => e.stopPropagation()}>
                        <div className="lb-header">
                            {leaderboardTab === 'season' ? (
                                <><FaHourglassHalf style={{color: '#DAA520', marginRight: '8px'}}/><span style={{color:'#DAA520', fontSize:'0.9rem', fontWeight: 'bold'}}>SAISON {currentMonthName} • FIN : {timeLeft}</span></>
                            ) : (
                                <><FaCrown style={{color: '#E056FD', marginRight: '8px'}}/><span style={{color:'#E056FD', fontSize:'0.9rem', fontWeight: 'bold'}}>HALL OF FAME</span></>
                            )}
                        </div>
                        <div className="lb-tabs">
                            <button className={leaderboardTab === 'season' ? 'active' : ''} onClick={() => setLeaderboardTab('season')}>{currentMonthName}</button>
                            <button className={leaderboardTab === 'alltime' ? 'active' : ''} onClick={() => setLeaderboardTab('alltime')}>TOP LÉGENDE</button>
                        </div>
                        
                        <ul className="lb-list">{renderLeaderboardList()}</ul>
                        
                        {/* ✅ ZONE EXPLICATION LÉGENDE MISE À JOUR */}
                        <div 
                            style={{ 
                                marginTop: '10px', 
                                borderTop: '1px solid #333', 
                                paddingTop: '8px', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.75rem',
                                color: '#666',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowLegend(!showLegend)}
                        >
                            <span><FaInfoCircle style={{marginRight:5}}/> Trophées Uniques (+20 parties)</span>
                            <span>{showLegend ? '▼' : '▶'}</span>
                        </div>
                        
                        {showLegend && (
                            <div style={{
                                background: 'rgba(0,0,0,0.5)', 
                                padding: '10px', 
                                borderRadius: '6px', 
                                marginTop: '5px',
                                fontSize: '0.75rem',
                                color: '#ccc',
                                lineHeight: '1.4'
                            }}>
                                <div style={{marginBottom:5, color:'#FFD700'}}>⚠️ <strong>UNIQUE AU MONDE / MOIS</strong></div>
                                <div style={{marginBottom:8, color:'#FFD700', textAlign:'center', fontWeight:'bold', textTransform:'uppercase'}}>
                                    👑 Il ne peut en rester qu'un !
                                </div>
                                <div style={{marginBottom:8}}>
                                    🔥 <strong>LE PHÉNIX</strong> : L'étoile montante. Celui qui s'améliore le plus vite à chaque partie.
                                </div>
                                <div style={{marginBottom:8}}>
                                    🗿 <strong>LE TITAN</strong> : Une machine ! Il ne fait <i>jamais</i> de petit score, sa moyenne est colossale.
                                </div>
                                <div>
                                    🎻 <strong>LE VIRTUOSE</strong> : L'expert technique. Son niveau "normal" est souvent supérieur au record des autres.
                                </div>
                            </div>
                        )}

                        {!isStandalone && (deferredPrompt || isIOS) && (
                            <button onClick={handleInstallClick} className="pwa-install-btn-runner">
                                <FaDownload style={{marginRight: '10px'}} /> {isIOS ? "Installer l'App" : "Jouer en Plein Écran"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* GameOver Modal */}
      {gameStatus === 'gameover' && (
          <div className="gameover-overlay">
            <div className="gameover-content">
                <h1 className="title-death">CHUTE D'ICARE</h1>
                <div className="result-box">
                    <div className="score-display"><span className="lbl">SCORE FINAL</span><span className="val">{Math.floor(score)}</span></div>
                    {player && <div className="best-display">Record personnel : {Math.max(Number(player.best_score) || 0, Math.floor(score)).toLocaleString('fr-FR')}</div>}
                </div>
                <div className="go-actions">
                    <button className="greek-btn-primary" onClick={startGame}><FaRedo/> REJOUER</button>
                    {!player && <button className="greek-btn-secondary" onClick={(e) => openModal('register', e)}>ENREGISTRER CE SCORE</button>}
                    <button className="greek-btn-text" onClick={() => setGameStatus('intro')}><FaArrowLeft/> MENU</button>
                </div>
            </div>
          </div>
      )}

      {/* Modal Progression */}
      {showProgression && (
        <div className="auth-modal-overlay" onClick={() => setShowProgression(false)}>
            <div className="auth-modal" onClick={e => e.stopPropagation()} style={{width:'500px', maxWidth:'95vw'}}>
                <FaTimes className="close-btn" onClick={() => setShowProgression(false)} />
                <h2 style={{color: '#DAA520'}}>MON ÉVOLUTION</h2>
                <p style={{color: '#aaa', fontSize:'0.9rem', marginBottom:'20px'}}>Analyse de vos 200 dernières tentatives.</p>
                <ProgressionGraph scores={history} bestScore={player.best_score} bestScoreDate={player.best_score_at} />
            </div>
        </div>
      )}

      {/* Modal Auth */}
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