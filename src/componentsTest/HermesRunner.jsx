import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { GameEngine } from '../gameTest/GameEngine'; // ✅ IMPORT DU NOUVEAU MOTEUR
import { useGameAuth } from '../hooks/useGameAuth';
import './HermesRunner.css'; // ✅ IMPORT DU CSS RECONSTITUÉ
import { FaArrowLeft, FaRedo, FaSignOutAlt, FaTrophy, FaCalendarAlt, FaHome, FaMobileAlt, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Si tu utilises react-router

// --- UTILITAIRES ---
const getTimeUntilNextMonday = () => {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((7 - now.getDay() + 1) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  if (nextMonday <= now) nextMonday.setDate(nextMonday.getDate() + 7);
  const diff = nextMonday - now;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return `${d}j ${h}h ${m}m ${s}s`;
};

// Pour l'animation cascade (Waterfall)
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function HermesRunnerPage() {
  // --- ÉTATS DU JEU ---
  const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, gameover
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  
  // --- ÉTATS AUTH & DATA ---
  const { player, leaderboardAllTime, leaderboardWeekly, login, register, saveScore, logout, loading: authLoading, error: authError } = useGameAuth();
  const [assos, setAssos] = useState([]); // Pour le fond waterfall
  
  // --- ÉTATS UI MENUS ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({ email: '', pseudo: '', password: '', newsletter: true });
  const [leaderboardTab, setLeaderboardTab] = useState('weekly');
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextMonday());
  const [isPortrait, setIsPortrait] = useState(false);

  // --- REFS ---
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // --- 1. CHARGEMENT DONNÉES (Pour le fond Waterfall) ---
  useEffect(() => {
    const loadData = async () => {
        // On essaye de charger les assos pour le visuel, sinon on met des placeholders
        const { data } = await supabase.from('asso').select('*').eq('status', 'publié');
        if (data && data.length > 0) {
            setAssos(data);
        } else {
            // Placeholders visuels si pas de BDD connectée ou table vide
            setAssos([
                { color: '#e74c3c', nom: 'A' }, { color: '#3498db', nom: 'B' }, 
                { color: '#2ecc71', nom: 'C' }, { color: '#f1c40f', nom: 'D' }
            ]);
        }
    };
    loadData();
    
    // Timer Leaderboard
    const timer = setInterval(() => setTimeLeft(getTimeUntilNextMonday()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. GESTION DU NOUVEAU MOTEUR (CANVAS) ---
  useEffect(() => {
    // On monte le moteur seulement si on joue
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
    
    // Nettoyage quand on quitte le mode playing
    return () => { 
        if (engineRef.current) engineRef.current.destroy(); 
    };
  }, [gameStatus, player]); // Dépendance player pour le saveScore

  // --- 3. DÉTECTION ORIENTATION ---
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth < 1024 && window.innerHeight > window.innerWidth);
      if(engineRef.current) engineRef.current.resize();
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);


  // --- ACTIONS UI ---
  const startGame = () => {
      // Plein écran browser
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      
      setGameStatus('playing');
  };

  const handleAuthSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      let res;
      if (authMode === 'register') {
          res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
      } else {
          res = await login(authForm.email, authForm.password);
      }
      
      if (res.success) {
          setShowAuthModal(false);
          // Si on s'inscrit après un game over, on sauvegarde le score
          if (gameStatus === 'gameover' && score > 0) saveScore(score);
      }
  };

  const openModal = (mode, e) => {
      if(e) e.stopPropagation();
      setAuthMode(mode);
      setShowAuthModal(true);
  };

  // --- COMPOSANT LEADERBOARD INTERNE ---
  const Leaderboard = () => (
      <div className="leaderboard-section" onMouseDown={e => e.stopPropagation()}>
        <div className="lb-tabs">
            <button className={leaderboardTab === 'weekly' ? 'active' : ''} onClick={() => setLeaderboardTab('weekly')}>
                <FaCalendarAlt /> SEMAINE
            </button>
            <button className={leaderboardTab === 'alltime' ? 'active' : ''} onClick={() => setLeaderboardTab('alltime')}>
                <FaTrophy /> LÉGENDE
            </button>
        </div>

        {leaderboardTab === 'weekly' && (
            <div className="lb-countdown" style={{ fontSize: '0.8rem', color: '#DAA520', marginBottom: '5px' }}>
                Fin dans : <strong>{timeLeft}</strong>
            </div>
        )}

        <ul className="lb-list">
            {(leaderboardTab === 'weekly' ? leaderboardWeekly : leaderboardAllTime).map((l, i) => (
                <li key={i} className={player && player.pseudo === l.pseudo ? 'me' : ''}>
                    <span className="rank">#{i+1}</span>
                    <span className="name" style={{marginLeft: 10}}>{l.pseudo}</span>
                    <span className="score">{l.best_score || l.score}</span>
                </li>
            ))}
            {(leaderboardTab === 'weekly' ? leaderboardWeekly : leaderboardAllTime).length === 0 && <li className="empty">Aucun héros...</li>}
        </ul>
      </div>
  );

  return (
    <div className="greek-runner-container">
      {/* 1. ÉCRAN DE BLOCAGE MOBILE */}
      {isPortrait && (
          <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'#000', zIndex:99999, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color:'#DAA520'}}>
            <FaMobileAlt size={50} />
            <h2>Tournez votre téléphone</h2>
            <p>L'aventure se vit à l'horizontale !</p>
          </div>
      )}

      {/* 2. LE MOTEUR DE JEU (CANVAS) - Toujours là mais caché par le menu */}
      <canvas ref={canvasRef} className="game-canvas" />

      {/* 3. HUD (Visible uniquement en jeu) */}
     {/* 3. HUD (Visible uniquement en jeu) */}
      {gameStatus === 'playing' && (
        <div className="greek-hud-score">
            <div className="score-line">
                <span className="score-value">{Math.floor(score)}</span>
                <span className="score-label">DRACHMES</span>
            </div>
            <span className="biome-indicator">{currentBiome}</span>
        </div>
      )}

      {/* 4. MENU PRINCIPAL (INTRO) */}
      {gameStatus === 'intro' && (
          <div className="greek-overlay">
            {/* Bouton Retour Home */}
            <Link to="/" className="greek-back-btn"><FaHome /> Retour Site</Link> 

            <div className="intro-screen">
              {/* Fond Cascade Animé */}
              <div className="waterfall-container">
                {[0, 1, 2, 3].map((colIndex) => (
                  <div key={colIndex} className={`waterfall-column col-${colIndex}`}>
                    {[...shuffleArray(assos), ...shuffleArray(assos)].map((asso, i) => (
                      <div key={i} className="mini-card" style={{ borderColor: asso.color || '#DAA520', color: asso.color || '#DAA520' }}>
                        {asso.logo ? <img src={asso.logo} alt="" style={{width:'100%'}}/> : (asso.nom ? asso.nom[0] : '?')}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="intro-content">
                {/* GAUCHE : LEADERBOARD */}
                <div className="intro-lb-container">
                    <h3 className="lb-title">LEADERBOARD</h3>
                    <Leaderboard />
                </div>

                {/* DROITE : ACTIONS */}
                <div className="intro-actions-side">
                    <h1 className="greek-title-large">HERMES QUEST</h1>
                    
                    {player ? (
                        <div className="player-welcome">
                            <p style={{color:'#fff'}}>Bienvenue, héros <strong style={{color:'#DAA520'}}>{player.pseudo}</strong></p>
                            <p className="best-score" style={{color:'#aaa', marginBottom:20}}>Record : {player.best_score}</p>
                            
                            <button className="greek-start-button" onClick={() => startGame()}>COURIR</button>
                            <br/>
                            <button className="greek-text-btn" onClick={() => logout()}><FaSignOutAlt /> Déconnexion</button>
                        </div>
                    ) : (
                        <div className="intro-actions">
                            <button className="greek-start-button" onClick={() => startGame()}>COURIR (Invité)</button>
                            <br/>
                            <button className="greek-button secondary" onClick={(e) => openModal('register', e)}>GRAVER SON NOM</button>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
      )}

      {/* 5. GAME OVER */}
      {gameStatus === 'gameover' && (
          <div className="gameover-overlay">
            <div className="gameover-card">
                <h1 className="greek-text-red">CHUTE D'ICARE</h1>
                
                <div className="gameover-body">
                    <div className="final-score-section">
                        <p className="score-label-small">Gloire Acquise</p>
                        <h2>{score}</h2>
                        {player && <p className="personal-best" style={{color:'#aaa'}}>Record personnel : <strong>{player.best_score}</strong></p>}
                    </div>

                    <div className="gameover-controls" style={{marginTop: 30}}>
                        {!player && (
                            <div className="guest-save-prompt" style={{marginBottom: 20}}>
                                <p style={{marginBottom:10}}>Un score digne de l'Olympe ?</p>
                                <button className="greek-button secondary" onClick={(e) => openModal('register', e)}>GRAVER MON NOM</button>
                            </div>
                        )}

                        <div className="gameover-buttons" style={{display:'flex', gap:20, justifyContent:'center'}}>
                            <button className="greek-button secondary" onClick={() => startGame()}>
                                <FaRedo /> Réessayer
                            </button>
                            <button className="greek-button secondary" onClick={() => setGameStatus('intro')}>
                                <FaArrowLeft /> Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* 6. MODALE AUTH */}
      {showAuthModal && (
            <div className="auth-modal-overlay" onMouseDown={e => e.stopPropagation()}>
                <div className="auth-modal">
                  <FaTimes className="modal-close-icon" onClick={(e) => { e.stopPropagation(); setShowAuthModal(false); }} />
                    
                    <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                    
                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && (
                            <input type="text" placeholder="Pseudo Héroïque" required value={authForm.pseudo} onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} />
                        )}
                        <input type="email" placeholder="Email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} />
                        <input type="password" placeholder="Mot de passe secret" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} />
                        
                        {authMode === 'register' && (
                            <div className="newsletter-optin" style={{textAlign:'left', fontSize:'0.8rem', margin:'10px 0'}}>
                                <input type="checkbox" id="newsOpt" checked={authForm.newsletter} onChange={e=>setAuthForm({...authForm, newsletter:e.target.checked})} style={{width:'auto', marginRight:10}} />
                                <label htmlFor="newsOpt">Je m'inscris à la newsletter</label>
                            </div>
                        )}

                        {authError && <p className="error-text" style={{color:'red'}}>{authError}</p>}
                        
                        <div className="modal-buttons">
                            <button type="submit" className="greek-start-button" style={{fontSize:'1rem', padding:'10px 30px', width:'100%'}} disabled={authLoading}>
                                {authLoading?'...':(authMode==='login'?'GO!':'S\'INSCRIRE')}
                            </button>
                        </div>
                        
                        <p className="greek-text-btn" style={{marginTop:15}} onClick={(e) => { e.stopPropagation(); setAuthMode(authMode==='login'?'register':'login'); }}>
                            {authMode === 'login' ? "Pas de compte ? Créer une légende" : "Déjà un compte ? Connexion"}
                        </p>
                    </form>
                </div>
            </div>
      )}
    </div>
  );
}

export default HermesRunnerPage;