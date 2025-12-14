// src/pages/HermesRunnerPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRedo, FaFeatherAlt, FaPaw, FaWind, FaSignOutAlt, FaTrophy, FaCalendarAlt, FaHome, FaMobileAlt } from 'react-icons/fa';
import './HermesRunnerPage.css';
import { useGameAuth } from '../hooks/useGameAuth';

// --- CONFIGURATION ---
const GRAVITY = 0.55; 
const JUMP_FORCE = 12; 
const INITIAL_SPEED = 6; 
const MAX_SPEED = 18; 
const SPAWN_RATE = 110; 
const GROUND_HEIGHT = 120;
const CEILING_HEIGHT = 120;
const PLAYER_SIZE = 100;
const DURATION_FLIGHT = 4000;
const DURATION_TIGER = 5000;
const DURATION_GRAVITY = 8000;
const WARNING_TIME = 1500;

function HermesRunnerPage() {
  const [gameStatus, setGameStatus] = useState('loading'); 
  const [assos, setAssos] = useState([]);
  const [score, setScore] = useState(0);
  const [bonusMessage, setBonusMessage] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]);
  
  const [isTiger, setIsTiger] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [gravityInverted, setGravityInverted] = useState(false);

  // AUTH
  const { player, leaderboardAllTime, leaderboardWeekly, login, register, saveScore, logout, loading: authLoading, error: authError } = useGameAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [leaderboardTab, setLeaderboardTab] = useState('weekly');
  
  const [authForm, setAuthForm] = useState({ email: '', pseudo: '', password: '', newsletter: true });

  const dimensionsRef = useRef({ ground: GROUND_HEIGHT, ceiling: CEILING_HEIGHT, player: PLAYER_SIZE });
  const requestRef = useRef();
  const runnerRef = useRef(null);
  const gameAreaRef = useRef(null);
  const ceilingYRef = useRef(300);

  const gameState = useRef({
    playerY: 0, velocity: 0, isJumping: false, currentSpeed: INITIAL_SPEED,
    isGravityInverted: false, gravityEndTime: 0, isFlying: false, flyEndTime: 0,
    isTiger: false, tigerEndTime: 0, invincible: false,
    obstacles: [], bonuses: [], frame: 0, score: 0, isGameOver: false
  });
  const [entities, setEntities] = useState({ obstacles: [], bonuses: [] });

  // RESPONSIVE
  useEffect(() => {
    const updateDimensions = () => {
        const isMobile = window.innerWidth < 768 || window.innerHeight < 500;
        const ground = isMobile ? 60 : 120;
        const ceiling = isMobile ? 60 : 120;
        const pSize = isMobile ? 70 : 100;
        dimensionsRef.current = { ground, ceiling, player: pSize };
        ceilingYRef.current = (window.innerHeight - ground - ceiling - pSize + 20) > 80 ? (window.innerHeight - ground - ceiling - pSize + 20) : 200;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', () => setTimeout(updateDimensions, 200));
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('asso').select('*').eq('status', 'publié');
      if (data) setAssos(data);
      setGameStatus('intro');
    };
    loadData();
  }, []);

  // JEU
  const handleJump = useCallback(() => {
    if (gameStatus !== 'playing' || gameState.current.isGameOver) return;
    const state = gameState.current;
    if (state.isFlying) return; 

    const currentCeiling = ceilingYRef.current;
    const onGround = !state.isGravityInverted && state.playerY <= 5;
    const onCeiling = state.isGravityInverted && state.playerY >= currentCeiling - 5;

    if ((onGround || onCeiling) && !state.isJumping) {
      state.velocity = state.isGravityInverted ? -JUMP_FORCE : JUMP_FORCE;
      state.isJumping = true;
    }
  }, [gameStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleJump(); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const updateGame = () => {
    if (gameState.current.isGameOver) return;
    const state = gameState.current;
    const now = Date.now();
    const currentCeiling = ceilingYRef.current;
    const dims = dimensionsRef.current;

    state.frame++;
    state.currentSpeed = Math.min(INITIAL_SPEED + (state.score / 300), MAX_SPEED);
    state.score += (state.currentSpeed / 50);
    setScore(Math.floor(state.score));

    if (state.gravityEndTime > now) { if (!state.isGravityInverted) { state.isGravityInverted = true; setGravityInverted(true); } }
    else { if (state.isGravityInverted) { state.isGravityInverted = false; setGravityInverted(false); state.isJumping = true; } }

    if (state.flyEndTime > now) {
        if (state.flyEndTime - now > 1000) {
            state.isFlying = true; setIsFlying(true); state.invincible = true;
            state.playerY += ((state.isGravityInverted ? 40 : currentCeiling - 40) - state.playerY) * 0.1; state.velocity = 0;
        } else { state.isFlying = false; setIsFlying(false); state.invincible = true; }
    } else { setIsFlying(false); if (!state.isTiger && now > state.flyEndTime + 1000) state.invincible = false; }

    if (state.tigerEndTime > now) { state.isTiger = true; setIsTiger(true); state.invincible = true; }
    else { state.isTiger = false; setIsTiger(false); if (state.flyEndTime < now) state.invincible = false; }

    if (!state.isFlying) {
        state.playerY += state.velocity;
        if (state.isGravityInverted) state.velocity += GRAVITY; else state.velocity -= GRAVITY;
        if (state.playerY <= 0) { state.playerY = 0; if (!state.isGravityInverted) { state.velocity = 0; state.isJumping = false; } }
        if (state.playerY >= currentCeiling) { state.playerY = currentCeiling; if (state.isGravityInverted) { state.velocity = 0; state.isJumping = false; } }
    }

    if (runnerRef.current) {
        runnerRef.current.style.bottom = `${dims.ground + state.playerY}px`;
        runnerRef.current.style.transform = state.isGravityInverted ? 'scaleY(-1)' : 'scaleY(1)';
        if (state.isJumping && !state.isFlying) runnerRef.current.classList.add('jumping'); else runnerRef.current.classList.remove('jumping');
    }

    if (state.frame % Math.max(50, Math.floor(SPAWN_RATE - (state.currentSpeed * 1.5))) === 0) spawnEntity(state, currentCeiling, dims);

    const move = state.currentSpeed / 10;
    state.obstacles.forEach(o => o.x -= move); state.obstacles = state.obstacles.filter(o => o.x > -20);
    state.bonuses.forEach(b => b.x -= move); state.bonuses = state.bonuses.filter(b => b.x > -20 && !b.collected);

    checkCollisions(state, dims);
    updateHUD(state, now);
    setEntities({ obstacles: state.obstacles, bonuses: state.bonuses });
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const spawnEntity = (state, ceilingY, dims) => {
      const rand = Math.random();
      const isOnCeiling = state.isGravityInverted;
      if (rand > 0.94 && !isOnCeiling && !state.obstacles.some(o => o.type==='vortex')) {
          state.obstacles.push({ id: Date.now(), x: 100, type: 'vortex', width: 80, height: 1000 }); return;
      }
      if (rand > 0.65) {
          const type = Math.random() > 0.85 ? 'tiger' : (Math.random() > 0.7 ? 'fly' : 'asso');
          const assoData = type === 'asso' && assos.length ? assos[Math.floor(Math.random() * assos.length)] : null;
          state.bonuses.push({ id: Date.now()+Math.random(), x: 100, y: isOnCeiling ? ceilingY-50 : 50, type, asso: assoData, collected: false }); return;
      }
      let h = 60; const rH = Math.random(); if (rH > 0.6) h = 90; if (rH > 0.9 && !isOnCeiling) h = 120;
      state.obstacles.push({ id: Date.now(), x: 100, y: isOnCeiling ? ceilingY : 0, isOnCeiling, type: h===120?'tall':(h===90?'medium':'small'), width: 60, height: h });
  };

  const checkCollisions = (state, dims) => {
      if (state.isFlying || state.isTiger || state.invincible) {
          state.bonuses.forEach(b => { if (b.x < 20 && b.x > 5) applyBonus(b); });
          if (state.isTiger) state.obstacles.forEach(o => { if (o.x < 15 && o.x > 5) { o.x = -100; setScore(s=>s+50); } });
          return;
      }
      const m = 20; const pL=10, pR=14, pB=state.playerY+m, pT=state.playerY+dims.player-m;
      state.obstacles.forEach(o => {
          if (pR > o.x+1 && pL < o.x+4) {
              if (o.type === 'vortex') { if (!o.triggered) { o.triggered = true; applyTerrainEffect(); } return; }
              let col = false;
              if (o.isOnCeiling) { if (pT > (o.y + dims.player - o.height + 10)) col = true; }
              else { if (pB < (o.y + o.height - 10)) col = true; }
              if (col) gameOver();
          }
      });
      state.bonuses.forEach(b => { if (b.x < 20 && b.x > 5 && Math.abs((state.playerY+dims.player/2) - (b.y + (dims.player*0.7)/2)) < dims.player) applyBonus(b); });
  };

  const applyTerrainEffect = () => { gameState.current.gravityEndTime = Date.now() + DURATION_GRAVITY; if (!gameState.current.isGravityInverted) gameState.current.velocity = 5; showMessage("VORTEX DU CHAOS !", "#8e44ad"); };
  const applyBonus = (b) => {
      b.collected = true; const now = Date.now();
      if (b.type === 'asso') { gameState.current.score += 100; showMessage(`+100 ${b.asso?.nom || 'PTS'}`, b.asso?.color || '#FFD700'); }
      if (b.type === 'fly') { gameState.current.flyEndTime = now + DURATION_FLIGHT; showMessage("VOL HERMÈS !", "#3498db"); }
      if (b.type === 'tiger') { gameState.current.tigerEndTime = now + DURATION_TIGER; showMessage("MODE TIGRE !", "#e74c3c"); }
  };
  const showMessage = (text, color) => { setBonusMessage({ text, color }); setTimeout(() => setBonusMessage(null), 2500); };
  
  const updateHUD = (state, now) => {
      const e = [];
      if (state.flyEndTime > now) e.push({ id: 'fly', icon: <FaFeatherAlt />, timer: ((state.flyEndTime-now)/1000).toFixed(1), type: 'fly' });
      if (state.tigerEndTime > now) e.push({ id: 'tiger', icon: <FaPaw />, timer: ((state.tigerEndTime-now)/1000).toFixed(1), type: 'tiger' });
      if (state.gravityEndTime > now) e.push({ id: 'grav', icon: <FaWind />, timer: ((state.gravityEndTime-now)/1000).toFixed(1), type: 'gravity' });
      setActiveEffects(e);
  };

  const startGame = () => {
    gameState.current = {
      playerY: 0, velocity: 0, isJumping: false, currentSpeed: INITIAL_SPEED, obstacles: [], bonuses: [], frame: 0, score: 0, isGameOver: false,
      isGravityInverted: false, gravityEndTime: 0, isFlying: false, flyEndTime: 0, isTiger: false, tigerEndTime: 0, invincible: false
    };
    setScore(0); setIsTiger(false); setIsFlying(false); setGravityInverted(false); setEntities({ obstacles: [], bonuses: [] });
    setGameStatus('playing');
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const gameOver = () => {
    gameState.current.isGameOver = true;
    cancelAnimationFrame(requestRef.current);
    if (player) saveScore(Math.floor(gameState.current.score));
    setGameStatus('gameover');
  };

  const handleAuthSubmit = async (e) => {
      e.preventDefault();
      if (authMode === 'register') {
          const res = await register(authForm.email, authForm.pseudo, authForm.password, authForm.newsletter);
          if (res.success) {
              setShowAuthModal(false);
              if (gameStatus === 'gameover' && score > 0) saveScore(score);
          }
          return;
      }
      if (authMode === 'login') {
          const res = await login(authForm.email, authForm.password);
          if (res.success) {
              setShowAuthModal(false);
              if (gameStatus === 'gameover' && score > 0) saveScore(score);
          }
      }
  };

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  // --- COMPOSANT LEADERBOARD (Réutilisable) ---
  const Leaderboard = ({ limit }) => (
      <div className="leaderboard-section">
          <div className="lb-tabs">
              <button className={leaderboardTab === 'weekly' ? 'active' : ''} onClick={() => setLeaderboardTab('weekly')}><FaCalendarAlt /> SEMAINE</button>
              <button className={leaderboardTab === 'alltime' ? 'active' : ''} onClick={() => setLeaderboardTab('alltime')}><FaTrophy /> LÉGENDE</button>
          </div>
          <ul className="lb-list">
              {(leaderboardTab === 'weekly' ? leaderboardWeekly : leaderboardAllTime).slice(0, limit).map((l, i) => (
                  <li key={i} className={player && player.pseudo === l.pseudo ? 'me' : ''}>
                      <span className="rank">#{i+1}</span>
                      <span className="name">{l.pseudo}</span>
                      <span className="score">{l.best_score || l.max_score}</span>
                  </li>
              ))}
              {(leaderboardTab === 'weekly' ? leaderboardWeekly : leaderboardAllTime).length === 0 && <li className="empty">Aucun héros...</li>}
          </ul>
      </div>
  );

  // --- RENDU ---
  
  // 1. INTRO
  if (gameStatus === 'intro') {
    return (
      <div className="greek-overlay">
        <Helmet><title>Hermes Quest</title></Helmet>
        {/* BOUTON RETOUR SITE */}
        <Link to="/" className="greek-back-btn"><FaHome /> Retour Site</Link>
        
        <div className="intro-screen">
          <div className="intro-content">
            <h1 className="greek-title-large">HERMES QUEST</h1>
            
            {player ? (
                <div className="player-welcome">
                    <p>Bienvenue, héros <strong>{player.pseudo}</strong></p>
                    <p className="best-score">Record : {player.best_score}</p>
                    <button className="greek-start-button" onClick={startGame}>COURIR</button>
                    <button className="greek-text-btn" onClick={logout}><FaSignOutAlt /> Déconnexion</button>
                </div>
            ) : (
                <div className="intro-actions">
                    <button className="greek-start-button" onClick={startGame}>COURIR (Invité)</button>
                    <button className="greek-button secondary" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>GRAVER SON NOM</button>
                </div>
            )}

            {/* LEADERBOARD SUR LE MENU PRINCIPAL (INTRO) - Scrollable */}
            <div className="intro-lb-container">
                <Leaderboard limit={50} />
            </div>
          </div>
        </div>
        
        {/* MODAL AUTH */}
        {showAuthModal && (
            <div className="auth-modal-overlay">
                <div className="auth-modal">
                    <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && (
                            <input type="text" placeholder="Pseudo Héroïque" required value={authForm.pseudo} onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} />
                        )}
                        <input type="email" placeholder="Email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} />
                        <input type="password" placeholder="Mot de passe secret" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} />
                        
                        {authMode === 'register' && (
                            <div className="newsletter-optin">
                                <input type="checkbox" id="newsOpt" checked={authForm.newsletter} onChange={e=>setAuthForm({...authForm, newsletter:e.target.checked})} />
                                <label htmlFor="newsOpt">Je m'inscris à la newsletter</label>
                            </div>
                        )}

                        {authError && <p className="error-text">{authError}</p>}
                        
                        <div className="modal-buttons">
                            <button type="submit" className="greek-button" disabled={authLoading}>{authLoading?'...':(authMode==='login'?'GO!':'S\'INSCRIRE')}</button>
                            <button type="button" className="greek-text-btn" onClick={() => setShowAuthModal(false)}>Annuler</button>
                        </div>
                        <p className="switch-auth" onClick={() => setAuthMode(authMode==='login'?'register':'login')}>
                            {authMode === 'login' ? "Pas de compte ? Créer une légende" : "Déjà un compte ? Connexion"}
                        </p>
                    </form>
                </div>
            </div>
        )}
      </div>
    );
  }

  // 2. JEU ACTIF
  const currentDims = dimensionsRef.current; // Variable définie ICI pour être sûr

  return (
    <>
      <div className="orientation-lock">
        <FaMobileAlt className="rotate-icon" />
        <h2>Tournez votre téléphone</h2>
        <p>L'aventure se vit à l'horizontale !</p>
      </div>

      <div className={`greek-runner-container ${gravityInverted ? 'gravity-flip' : ''}`} onMouseDown={handleJump} onTouchStart={handleJump}>
        <Helmet><title>Vers l'Olympe !</title></Helmet>
        
        {gameStatus === 'playing' && (
            <>
                <div className="greek-hud-score">
                    <span className="score-label">GLOIRE</span>
                    <span className="score-value">{score}</span>
                </div>
                <div className="effects-hud">
                    {activeEffects.map(e => (
                        <div key={e.id} className={`effect-badge ${e.type}`}>
                            <div className="effect-icon">{e.icon}</div>
                            <div className="effect-info"><span className="effect-timer">{e.timer}s</span></div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {bonusMessage && <div className="bonus-popup" style={{ color: bonusMessage.color }}>{bonusMessage.text}</div>}

        <div className="game-world" ref={gameAreaRef}>
          <div className="clouds-ground" style={{height: currentDims.ground}}></div>
          <div className="clouds-ceiling" style={{height: currentDims.ceiling}}></div>
          
          <div className={`player ${isTiger?'tiger-mode':''} ${isFlying?'flying-mode':''} ${gravityInverted?'gravity-inverted':''}`} ref={runnerRef} style={{ width: currentDims.player, height: currentDims.player }}>
              <div className="player-sprite"></div>
              {isTiger && <div className="tiger-aura"></div>} {isFlying && <div className="wings-effect"><FaFeatherAlt /></div>}
          </div>

          {entities.obstacles.map(o => (
            <div key={o.id} className={`obstacle ${o.type} ${o.isOnCeiling?'on-ceiling':''}`} style={{ left: `${o.x}%`, bottom: o.type==='vortex'?0:(o.isOnCeiling?'auto':`${currentDims.ground}px`), top: o.type==='vortex'?0:(o.isOnCeiling?`${currentDims.ceiling}px`:'auto'), width:`${o.width}px`, height: o.type==='vortex'?'100%':`${o.height}px` }}>
              {o.type==='vortex' ? <div className="vortex-column"></div> : <div className="greek-column"></div>}
            </div>
          ))}
          {entities.bonuses.map(b => (
            <div key={b.id} className={`bonus-item ${b.type}`} style={{ left: `${b.x}%`, bottom: `${currentDims.ground + b.y}px`, width: currentDims.player*0.7, height: currentDims.player*0.7 }}>
              {b.type==='asso' && <img src={b.asso?.logo} style={{borderColor:b.asso?.color}} alt=""/>}
              {b.type==='fly' && <div className="powerup-icon fly"><FaFeatherAlt /></div>}
              {b.type==='tiger' && <div className="powerup-icon tiger"><FaPaw /></div>}
            </div>
          ))}
        </div>

        {/* 3. GAME OVER */}
        {gameStatus === 'gameover' && (
          <div className="gameover-overlay animate-in">
            <h1 className="greek-text-red">CHUTE D'ICARE</h1>
            <div className="final-score-box">
              <p>Gloire Acquise</p>
              <h2>{score}</h2>
              {player && <p className="personal-best">Record : {player.best_score}</p>}
            </div>

            {!player && (
                <div className="guest-save-prompt">
                    <p>Inscrivez-vous pour sauver ce score !</p>
                    <button className="greek-button small" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>GRAVER MON NOM</button>
                </div>
            )}

            {/* LEADERBOARD GAME OVER (Limité à 10) */}
            <Leaderboard limit={10} />

            <div className="gameover-actions">
              <button className="greek-button" onClick={startGame}><FaRedo /> Réessayer</button>
              <button className="greek-button secondary" onClick={() => setGameStatus('intro')}><FaArrowLeft /> Menu Principal</button>
            </div>

            {/* MODAL AUTH (Réutilisation) */}
            {showAuthModal && (
                <div className="auth-modal-overlay">
                    <div className="auth-modal">
                        <h2>{authMode === 'login' ? 'Connexion' : 'Nouvelle Légende'}</h2>
                        <form onSubmit={handleAuthSubmit}>
                            {authMode === 'register' && (
                                <input type="text" placeholder="Pseudo Héroïque" required value={authForm.pseudo} onChange={e=>setAuthForm({...authForm, pseudo:e.target.value})} />
                            )}
                            <input type="email" placeholder="Email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} />
                            <input type="password" placeholder="Mot de passe" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} />
                            
                            {authMode === 'register' && (
                                <div className="newsletter-optin">
                                    <input type="checkbox" id="newsOpt" checked={authForm.newsletter} onChange={e=>setAuthForm({...authForm, newsletter:e.target.checked})} />
                                    <label htmlFor="newsOpt">Je m'inscris à la newsletter</label>
                                </div>
                            )}

                            {authError && <p className="error-text">{authError}</p>}
                            
                            <div className="modal-buttons">
                                <button type="submit" className="greek-button" disabled={authLoading}>{authLoading?'...':(authMode==='login'?'GO!':'S\'INSCRIRE')}</button>
                                <button type="button" className="greek-text-btn" onClick={() => setShowAuthModal(false)}>Annuler</button>
                            </div>
                            <p className="switch-auth" onClick={() => setAuthMode(authMode==='login'?'register':'login')}>
                                {authMode === 'login' ? "Pas de compte ? Créer une légende" : "Déjà un compte ? Connexion"}
                            </p>
                        </form>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default HermesRunnerPage;