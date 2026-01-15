import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHubSession } from '../../hooks/useHubSession';
import '../HermesRunnerPage.css';
import { FaFeatherAlt, FaPaw, FaMobileAlt, FaTimes } from 'react-icons/fa';
import PlayerAvatar from '../../components/hub/PlayerAvatar';

// --- RNG ---
const cyrb128 = (str) => {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    return (h1^h2^h3^h4) >>> 0;
};
const mulberry32 = (a) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// CONSTANTES
const GRAVITY = 0.55; 
const JUMP_FORCE = 12; 
const INITIAL_SPEED = 6; 
const MAX_SPEED = 18; 
const SPAWN_RATE = 110; 
const GROUND_HEIGHT = 120;
const CEILING_HEIGHT = 120;
const PLAYER_SIZE = 100;
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function MultiplayerRunner() {
  const [score, setScore] = useState(0);
  const [bonusMessage, setBonusMessage] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]);
  
  const [countdown, setCountdown] = useState(3); 
  const [showDeathScreen, setShowDeathScreen] = useState(false); // Nouvel état pour l'écran "Mort"
  const gameActiveRef = useRef(false); 
  
  const [entities, setEntities] = useState({ obstacles: [], bonuses: [] });
  const [isTiger, setIsTiger] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [gravityInverted, setGravityInverted] = useState(false);

  const { state: navState } = useLocation();
  const navigate = useNavigate();
  const { updateScore, broadcastPosition, subscribeToSession, players, opponents } = useHubSession(); 
  
  const rngRef = useRef(null); 
  const lastFrameTimeRef = useRef(0);
  const dimensionsRef = useRef({ ground: GROUND_HEIGHT, ceiling: CEILING_HEIGHT, player: PLAYER_SIZE });
  const requestRef = useRef();
  const runnerRef = useRef(null);
  const gameAreaRef = useRef(null);
  const ceilingYRef = useRef(300);
  
  const myAvatarId = useRef('hermes');

  const gameState = useRef({
    playerY: 0, velocity: 0, isJumping: false, currentSpeed: INITIAL_SPEED,
    isGravityInverted: false, gravityEndTime: 0, isFlying: false, flyEndTime: 0,
    isTiger: false, tigerEndTime: 0, invincible: false,
    obstacles: [], bonuses: [], frame: 0, score: 0, isGameOver: false
  });

  // --- INIT ---
  useEffect(() => {
    if (!navState?.playerId) { navigate('/join'); return; }
    subscribeToSession(navState.sessionId, navState.playerId);
    
    const seed = cyrb128(navState.sessionCode || "DEFAULT");
    rngRef.current = mulberry32(seed);

    const updateDimensions = () => {
        const isMobile = window.innerWidth < 768 || window.innerHeight < 500;
        const ground = isMobile ? 60 : 120;
        const ceiling = isMobile ? 60 : 120;
        const pSize = isMobile ? 70 : 100;
        dimensionsRef.current = { ground, ceiling, player: pSize };
        const h = window.innerHeight - ground - ceiling - pSize + 20;
        ceilingYRef.current = h > 80 ? h : 200;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    launchCountdownSequence();

    return () => {
        window.removeEventListener('resize', updateDimensions);
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (players.length > 0 && navState?.playerId) {
        const me = players.find(p => p.id === navState.playerId);
        if (me) myAvatarId.current = me.avatar_id;
    }
  }, [players, navState]);

  // --- LOGIQUE DÉPART ---
  const launchCountdownSequence = () => {
      gameActiveRef.current = false; 
      gameState.current = {
        playerY: 0, velocity: 0, isJumping: false, currentSpeed: INITIAL_SPEED,
        isGravityInverted: false, gravityEndTime: 0, isFlying: false, flyEndTime: 0,
        isTiger: false, tigerEndTime: 0, invincible: false,
        obstacles: [], bonuses: [], frame: 0, score: 0, isGameOver: false
      };
      setScore(0);
      setShowDeathScreen(false);
      setEntities({ obstacles: [], bonuses: [] });
      setCountdown(3);

      startGameLoop(); 

      let count = 3;
      const timer = setInterval(() => {
          count--;
          if (count > 0) {
              setCountdown(count);
          } else if (count === 0) {
              setCountdown("GO !");
          } else {
              clearInterval(timer);
              setCountdown(null);
              gameActiveRef.current = true; 
          }
      }, 1000);
  };

  const startGameLoop = () => {
    lastFrameTimeRef.current = 0; 
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleJump = useCallback(() => {
    if (!gameActiveRef.current || gameState.current.isGameOver) return;
    const state = gameState.current;
    if (state.isFlying) return; 
    const currentCeiling = ceilingYRef.current;
    const onGround = !state.isGravityInverted && state.playerY <= 5;
    const onCeiling = state.isGravityInverted && state.playerY >= currentCeiling - 5;
    if ((onGround || onCeiling) && !state.isJumping) {
      state.velocity = state.isGravityInverted ? -JUMP_FORCE : JUMP_FORCE;
      state.isJumping = true;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleJump(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  // --- GAME LOOP ---
  const updateGame = (timestamp) => {
    if (gameState.current.isGameOver) return; 
    if (!gameActiveRef.current) {
        requestRef.current = requestAnimationFrame(updateGame);
        return;
    }

    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < FRAME_INTERVAL) { requestRef.current = requestAnimationFrame(updateGame); return; }
    lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

    const state = gameState.current;
    const now = Date.now();
    const currentCeiling = ceilingYRef.current;
    const dims = dimensionsRef.current;

    state.frame++;
    state.currentSpeed = Math.min(INITIAL_SPEED + (state.score / 300), MAX_SPEED);
    state.score += (state.currentSpeed / 50);
    setScore(Math.floor(state.score));

    // SYNC
    if (navState?.playerId) {
        if (state.frame % 60 === 0) updateScore(navState.playerId, Math.floor(state.score), true);
        if (state.frame % 6 === 0) {
            const myPseudo = players.find(p => p.id === navState.playerId)?.pseudo || 'Moi';
            broadcastPosition(
                navState.playerId, 
                myPseudo, 
                myAvatarId.current, 
                state.playerY, 
                state.isJumping, 
                state.isGravityInverted,
                false 
            );
        }
    }

    // PHYSIQUE
    if (state.gravityEndTime > now) { if (!state.isGravityInverted) { state.isGravityInverted = true; setGravityInverted(true); } }
    else { if (state.isGravityInverted) { state.isGravityInverted = false; setGravityInverted(false); state.isJumping = true; } }

    if (state.flyEndTime > now) {
        const timeLeft = state.flyEndTime - now;
        if (timeLeft > 1000) {
            state.isFlying = true; setIsFlying(true); state.invincible = true; 
            const flightY = state.isGravityInverted ? 40 : currentCeiling - 40;
            state.playerY += (flightY - state.playerY) * 0.1; state.velocity = 0;
        } else { state.isFlying = false; setIsFlying(false); state.invincible = true; }
    } else {
        setIsFlying(false); 
        if (!state.isTiger && (now > state.flyEndTime + 1000)) state.invincible = false;
    }

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
        const rotation = state.isGravityInverted ? 'scaleY(-1)' : 'scaleY(1)';
        runnerRef.current.style.transform = rotation;
        if (state.isJumping && !state.isFlying) runnerRef.current.classList.add('jumping');
        else runnerRef.current.classList.remove('jumping');
    }

    if (state.frame % Math.max(50, Math.floor(SPAWN_RATE - (state.currentSpeed * 1.5))) === 0) spawnEntity(state, currentCeiling);

    const moveFactor = state.currentSpeed / 10;
    state.obstacles.forEach(o => o.x -= moveFactor);
    state.obstacles = state.obstacles.filter(o => o.x > -20);
    state.bonuses.forEach(b => b.x -= moveFactor);
    state.bonuses = state.bonuses.filter(b => b.x > -20 && !b.collected);

    checkCollisions(state, dims);
    updateHUD(state, now);
    setEntities({ obstacles: state.obstacles, bonuses: state.bonuses });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const spawnEntity = (state, ceilingY) => {
      const rng = rngRef.current || Math.random;
      const rand = rng();
      const isOnCeiling = state.isGravityInverted;
      if (rand > 0.94 && !isOnCeiling && !state.obstacles.some(o => o.type==='vortex')) {
          state.obstacles.push({ id: Date.now() + rng(), x: 100, type: 'vortex', width: 80, height: 1000 }); return;
      }
      if (rand > 0.75) { 
          const type = rng() > 0.6 ? 'tiger' : 'fly';
          state.bonuses.push({ id: Date.now() + rng(), x: 100, y: isOnCeiling ? ceilingY-50 : 50, type, collected: false }); return;
      }
      let h = 60; const rH = rng(); if (rH > 0.6) h = 90; if (rH > 0.9 && !isOnCeiling) h = 120;
      state.obstacles.push({ id: Date.now() + rng(), x: 100, y: isOnCeiling ? ceilingY : 0, isOnCeiling, type: h===120?'tall':(h===90?'medium':'small'), width: 60, height: h });
  };

  const checkCollisions = (state, dims) => {
    if (state.isFlying || state.isTiger || state.invincible) {
        state.bonuses.forEach(bonus => { if (bonus.x < 20 && bonus.x > 5) applyBonus(bonus); });
        if (state.isTiger) { state.obstacles.forEach(o => { if (o.x < 15 && o.x > 5) { o.x = -100; setScore(s => s + 50); } }); }
        return; 
    }
    const margin = 20; const pLeft = 10; const pRight = 14; const pBottom = state.playerY + margin; const pTop = state.playerY + dims.player - margin; 
    state.obstacles.forEach(obs => {
      const obsLeft = obs.x + 1; const obsRight = obs.x + 4; 
      if (pRight > obsLeft && pLeft < obsRight) {
        if (obs.type === 'vortex') { if (!obs.triggered) { obs.triggered = true; applyTerrainEffect(); } return; }
        let collision = false;
        if (obs.isOnCeiling) { if (pTop > (obs.y + dims.player - obs.height + 10)) collision = true; }
        else { if (pBottom < (obs.y + obs.height - 10)) collision = true; }
        if (collision) gameOver();
      }
    });
    state.bonuses.forEach(bonus => {
      if (bonus.x < 20 && bonus.x > 5 && Math.abs((state.playerY + dims.player / 2) - (bonus.y + (dims.player * 0.7) / 2)) < dims.player) applyBonus(bonus);
    });
  };

  const applyTerrainEffect = () => { gameState.current.gravityEndTime = Date.now() + DURATION_GRAVITY; if (!gameState.current.isGravityInverted) gameState.current.velocity = 5; showMessage("VORTEX DU CHAOS !", "#8e44ad"); };
  const applyBonus = (b) => {
      b.collected = true; const now = Date.now();
      if (b.type === 'asso') { gameState.current.score += SCORE_BONUS_ASSO; showMessage(`+${SCORE_BONUS_ASSO} PTS`, '#FFD700'); }
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

  // --- GAME OVER AUTOMATIQUE ---
  const gameOver = () => {
    gameState.current.isGameOver = true;
    cancelAnimationFrame(requestRef.current);
    
    // 1. Notifier la DB (Status: Mort)
    if (navState?.playerId) updateScore(navState.playerId, Math.floor(gameState.current.score), false);
    
    // 2. Notifier les autres (Fantôme Mort)
    const myPseudo = players.find(p => p.id === navState.playerId)?.pseudo || 'Moi';
    broadcastPosition(
        navState.playerId, 
        myPseudo, 
        myAvatarId.current, 
        gameState.current.playerY, 
        false, 
        gameState.current.isGravityInverted, 
        true 
    );

    // 3. Afficher l'écran "Éliminé" et renvoyer au lobby après 2 secondes
    setShowDeathScreen(true);
    setTimeout(() => {
        navigate('/lobby', { state: navState });
    }, 2000);
  };

  const currentDims = dimensionsRef.current;

  return (
    <>
      <div className="orientation-lock"><FaMobileAlt className="rotate-icon" /><h2>Tournez votre téléphone</h2></div>

      <div className={`greek-runner-container ${gravityInverted ? 'gravity-flip' : ''}`} onMouseDown={handleJump} onTouchStart={handleJump}>
        
        {/* COUNTDOWN */}
        {countdown !== null && (
            <div className="countdown-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999
            }}>
                <h1 style={{fontSize: '6rem', color: '#DAA520', textShadow: '0 0 20px black', animation: 'pulse 0.8s infinite'}}>{countdown}</h1>
            </div>
        )}

        {/* ECRAN MORT (TEMPORAIRE AVANT REDIRECTION) */}
        {showDeathScreen && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#e74c3c'
            }}>
                <FaTimes style={{fontSize: '5rem', marginBottom: '20px'}} />
                <h1 style={{fontSize: '3rem', textTransform: 'uppercase'}}>Éliminé</h1>
                <p style={{color: 'white', marginTop: '10px'}}>Retour au lobby...</p>
            </div>
        )}

        <div className="greek-hud-score"><span className="score-label">SESSION</span><span className="score-value">{score}</span></div>
        <div className="effects-hud">
            {activeEffects.map(e => (<div key={e.id} className={`effect-badge ${e.type}`}><div className="effect-icon">{e.icon}</div><div className="effect-info"><span className="effect-timer">{e.timer}s</span></div></div>))}
        </div>

        {bonusMessage && <div className="bonus-popup" style={{ color: bonusMessage.color }}>{bonusMessage.text}</div>}

        <div className="game-world" ref={gameAreaRef}>
          <div className="clouds-ground" style={{height: currentDims.ground}}></div>
          <div className="clouds-ceiling" style={{height: currentDims.ceiling}}></div>

          {Object.entries(opponents).map(([id, op]) => (
              <div key={id} className={`opponent-ghost`}
                  style={{ 
                      position: 'absolute', width: currentDims.player, height: currentDims.player,
                      bottom: op.isGravityInverted ? 'auto' : `${currentDims.ground + op.y}px`,
                      top: op.isGravityInverted ? `${currentDims.ceiling + op.y}px` : 'auto',
                      transform: op.isGravityInverted ? 'scaleY(-1)' : 'none',
                      left: '20px', 
                      opacity: op.isDead ? 0.3 : 0.5,
                      filter: op.isDead ? 'grayscale(100%) brightness(0.5)' : 'grayscale(100%)',
                      zIndex: 5, transition: 'all 0.1s linear'
                  }}
              >
                  <span style={{
                      position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
                      background: op.isDead ? '#333' : 'rgba(0,0,0,0.7)', 
                      color: op.isDead ? '#aaa' : 'white', 
                      textDecoration: op.isDead ? 'line-through' : 'none',
                      padding: '2px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap',
                      pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                      {op.pseudo} {op.isDead && '💀'}
                  </span>
                  <div className="ghost-sprite" style={{width:'100%', height:'100%', position: 'relative'}}>
                      <PlayerAvatar avatarId={op.avatar || 'hermes'} size="100%" />
                      {op.isDead && (
                          <div style={{position: 'absolute', top:0, left:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <FaTimes style={{color: 'red', fontSize: '3rem', filter: 'drop-shadow(0 0 5px black)'}} />
                          </div>
                      )}
                  </div>
              </div>
          ))}

          <div className={`player ${isTiger?'tiger-mode':''} ${isFlying?'flying-mode':''} ${gravityInverted?'gravity-inverted':''}`} ref={runnerRef} style={{ width: currentDims.player, height: currentDims.player, zIndex: 10 }}>
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
              {b.type==='fly' && <div className="powerup-icon fly"><FaFeatherAlt /></div>}
              {b.type==='tiger' && <div className="powerup-icon tiger"><FaPaw /></div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MultiplayerRunner;