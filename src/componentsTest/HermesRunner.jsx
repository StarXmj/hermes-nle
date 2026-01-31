import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient'; 
import { GameEngine } from '../gameTest/GameEngine';
import { useGameAuth } from '../hooks/useGameAuth';
import './HermesRunner.css'; 

import GameHUD from './runner-parts/GameHUD';
import MainMenu from './runner-parts/MainMenu';
import LeaderboardPanel from './runner-parts/LeaderboardPanel';
import ExtensionPanel from './runner-parts/ExtensionPanel';
import Modals from './runner-parts/Modals';
import { FaChevronRight, FaMobileAlt, FaExpand } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import VersionControl from './VersionControl'; // Ou VersionControl tout court selon où tu l'as mis
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
  // ✅ ÉTAT POUR LA VERSION (vide par défaut)
  const [gameVersion, setGameVersion] = useState("...");
  const [onlinePlayers, setOnlinePlayers] = useState(1); 
  const [dbPartners, setDbPartners] = useState([]);
  const [gameStatus, setGameStatus] = useState('intro'); 
  const [score, setScore] = useState(0);
  const [currentBiome, setCurrentBiome] = useState('NORMAL');
  const [hasEnteredFullScreen, setHasEnteredFullScreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showProgression, setShowProgression] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [viewMode, setViewMode] = useState('main'); 

  const { player, leaderboardAllTime, leaderboardMonthly, login, register, saveScore, logout, loading, error: authError } = useGameAuth();
  
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEndOfMonth());

  // ... (Swipe logic inchangée) ...
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && viewMode === 'main') setViewMode('extension');
    if (distance < -50 && viewMode === 'extension') setViewMode('main');
  };
// ... après handleRestart et loadHistory par exemple ...

  // ✅ FONCTION 1 : Démarrer une session sécurisée
  const startGameSession = async () => {
    try {
        const { data, error } = await supabase.rpc('start_game');
        if (error) console.error("Erreur start_game:", error);
        if (data) {
            console.log("Session démarrée :", data);
            setSessionId(data);
        }
    } catch (err) {
        console.error("Erreur session:", err);
    }
  };

  // ✅ FONCTION 2 : Envoyer le score sécurisé
  const saveSecureScore = async (finalScore) => {
    if (!sessionId) {
        console.error("Pas de session ID, score ignoré.");
        return;
    }

    // On envoie le score (ou la distance) au serveur RPC
    const { data, error } = await supabase.rpc('submit_run', { 
        session_id: sessionId,
        claimed_distance: Math.floor(finalScore) // Assurez-vous que ça correspond à votre logique (Score = Distance ?)
    });

    if (data && data.success) {
        console.log("✅ Score validé !", data.new_score);
        // Optionnel : Rafraîchir l'affichage du meilleur score localement si besoin
        // via une fonction de useGameAuth (ex: refreshUserProfile)
    } else {
        console.error("❌ Score rejeté :", data?.message || error);
    }
    
    // On nettoie la session pour éviter de réutiliser la même
    setSessionId(null);
  };
  // ✅ 1. CHARGEMENT DE LA VERSION DEPUIS LE FICHIER JSON
  useEffect(() => {
    // On ajoute un timestamp pour éviter que le navigateur cache le JSON lui-même
    fetch(`/version.json?t=${Date.now()}`) 
        .then(res => res.json())
        .then(data => setGameVersion(data.version))
        .catch(err => setGameVersion("1.0"));
}, []);

  // ... (Le reste des useEffects pour timer, partenaires, online, engine... reste identique)
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilEndOfMonth()), 60000);
    const fetchPartners = async () => {
        const { data } = await supabase.from('partenaires').select('logo').eq('status', 'publié');
        if (data) setDbPartners(data.map(p => p.logo).filter(u => u));
    };
    fetchPartners();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const userIdentifier = player ? `${player.pseudo}-${sessionId}` : `visiteur-${sessionId}`;
    const channel = supabase.channel('online_users_room', { config: { presence: { key: userIdentifier } } });
    channel.on('presence', { event: 'sync' }, () => setOnlinePlayers(Object.keys(channel.presenceState()).length))
           .subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date() }); });
    return () => { supabase.removeChannel(channel); };
  }, [player]); 

  useEffect(() => {
    if (gameStatus === 'playing' && canvasRef.current) {
        
        // ✅ 1. ON DÉMARRE LA SESSION SÉCURISÉE ICI
        startGameSession();

        engineRef.current = new GameEngine(canvasRef.current, {
            onUpdateUI: (s) => { setScore(s.score); setCurrentBiome(s.biome); },
            onGameOver: (res) => { 
                setScore(res.score); 
                setGameStatus('gameover'); 
                setIsPaused(false); 
                
                // ✅ 2. ON SAUVEGARDE VIA LE NOUVEAU SYSTÈME SÉCURISÉ
                if(player) {
                    saveSecureScore(res.score); 
                    // saveScore(res.score); // ⚠️ Supprimez ou commentez l'ancien saveScore insecure
                }
            }
        });
        engineRef.current.start();
    }
    return () => { if (engineRef.current) engineRef.current.destroy(); };
  }, [gameStatus]); // Assurez-vous que sessionId n'est pas dans les dépendances pour éviter les boucles
  // ... (Handlers inchangés) ...
  const handleTogglePause = () => { const s = !isPaused; setIsPaused(s); engineRef.current?.togglePause(s); };
const handleRestart = () => {
      // 1. On cache immédiatement le menu Game Over
      setGameStatus('playing'); 
      
      // 2. On enlève la pause au cas où
      setIsPaused(false);
      
      // 3. On remet le score à 0
      setScore(0);
      
      // 4. On force le moteur à redémarrer proprement
      if (engineRef.current) {
          engineRef.current.reset(); 
          engineRef.current.start(); 
      }
  };  const handleQuit = () => { setIsPaused(false); setGameStatus('intro'); engineRef.current?.destroy(); };
  
  const loadHistory = async () => { 
      if(!player) return; 
      const { data } = await supabase.from('arcade_scores').select('score, created_at').eq('player_id', player.id).order('created_at', { ascending: false });
      setHistory(data || []); setShowProgression(true); 
  };
  
  const enterImmersion = () => { document.documentElement.requestFullscreen?.(); setHasEnteredFullScreen(true); };

  const handleAuth = async (email, pseudo, pass) => {
      let res;
      if (authMode === 'register') {
          res = await register(email, pseudo, pass, true);
      } else {
          res = await login(email, pass);
      }
      if (res && res.success) {
          setShowAuthModal(false); 
          if (gameStatus === 'gameover' && score > 0) {
              saveScore(score, res.user);
          }
      }
  };

  return (
    <div className="greek-runner-container">
{gameVersion !== "..." && <VersionControl currentVersion={gameVersion} />}        <div className="orientation-lock">
            <div className="rotate-phone-animation"><FaMobileAlt size={80} className="phone-icon"/></div>
            <h2>TOURNEZ VOTRE ÉCRAN</h2>
        </div>

        {!hasEnteredFullScreen && (
            <div className="immersion-start-screen">
                <h1>HERMES QUEST</h1>
                {/* On peut afficher la version ici aussi si on veut */}
                <span style={{color:'#666', fontSize:'0.8rem', marginBottom:'20px'}}>v{gameVersion}</span>
                <button className="greek-start-button pulse" onClick={enterImmersion}><FaExpand style={{marginRight:10}}/> LANCER L'EXPÉRIENCE</button>
                <Link to="/" className="back-link">Retour au site</Link>
            </div>
        )}

        <canvas ref={canvasRef} className="game-canvas" />
        
        {gameStatus === 'playing' && <GameHUD score={score} biome={currentBiome} isPaused={isPaused} onPause={handleTogglePause} />}
        
        {/* ... (Pause Menu inchangé) ... */}
        {isPaused && (
            <div 
                className="pause-overlay" 
                /* 🛑 CES 2 LIGNES SONT VITALES SUR MOBILE : */
                onTouchStart={(e) => e.stopPropagation()} 
                onClick={(e) => e.stopPropagation()}
            >
                <h1>PAUSE</h1>
                <div className="pause-menu">
                    {/* On ajoute onTouchEnd pour être sûr que ça réagisse au doigt */}
                    <button 
                        className="btn-pause-resume" 
                        onClick={handleTogglePause}
                        onTouchEnd={(e) => { e.preventDefault(); handleTogglePause(); }}
                    >
                        REPRENDRE
                    </button>
                    
                    <button 
                        className="btn-pause-secondary" 
                        onClick={handleRestart}
                        onTouchEnd={(e) => { e.preventDefault(); handleRestart(); }}
                    >
                        RECOMMENCER
                    </button>
                    
                    <button 
                        className="btn-pause-secondary" 
                        onClick={handleQuit}
                        onTouchEnd={(e) => { e.preventDefault(); handleQuit(); }}
                    >
                        QUITTER
                    </button>
                </div>
            </div>
        )}

        {hasEnteredFullScreen && gameStatus === 'intro' && (
            <div className="greek-overlay" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <div className={`main-view-container ${viewMode === 'extension' ? 'shifted-left' : ''}`}>
                    <div className="waterfall-bg">
                        {[...Array(5)].map((_,i) => (
                            <div key={i} className="waterfall-col infinite-scroll" style={{animationDelay:`-${i*5}s`, animationDuration:`${20+i*2}s`}}>
                                {dbPartners.length > 0 ? [...dbPartners, ...dbPartners].map((url,j) => <div key={j} className="wf-item"><img src={url} alt=""/></div>) : null}
                            </div>
                        ))}
                    </div>
                    <div className="nav-arrow-btn nav-right" onClick={() => setViewMode('extension')}><FaChevronRight /></div>
                    <div className="menu-container">
                        
                        {/* ✅ ON PASSE LA VARIABLE D'ÉTAT gameVersion ICI */}
                        <MainMenu 
                            player={player} 
                            onlinePlayers={onlinePlayers} 
                            version={gameVersion} 
                            onStart={() => {setGameStatus('playing'); setIsPaused(false);}} 
                            onLogout={logout} onLoadHistory={loadHistory}
                            onOpenAuth={() => {setAuthMode('register'); setShowAuthModal(true);}}
                        />
                        
                        <LeaderboardPanel leaderboardAllTime={leaderboardAllTime} leaderboardMonthly={leaderboardMonthly} timeLeft={timeLeft} player={player}/>
                    </div>
                </div>
                
                {/* ✅ ET ICI AUSSI */}
                <ExtensionPanel isActive={viewMode === 'extension'} onClose={() => setViewMode('main')} version={gameVersion} />
            </div>
        )}

        <Modals 
            gameStatus={gameStatus} score={score} player={player} 
            showAuth={showAuthModal} authMode={authMode}
            showProgression={showProgression} history={history}
            leaderboardAllTime={leaderboardAllTime} leaderboardMonthly={leaderboardMonthly}
            authError={authError} loading={loading}
            onCloseAuth={() => setShowAuthModal(false)}
            onCloseProgression={() => setShowProgression(false)}
            onSwitchAuth={() => setAuthMode(m => m==='login'?'register':'login')}
            onRestart={handleRestart} onMenu={() => setGameStatus('intro')}
            onAuthSubmit={handleAuth}
            onOpenAuth={() => {setAuthMode('register'); setShowAuthModal(true);}}
        />
    </div>
  );
}

export default HermesRunnerPage;