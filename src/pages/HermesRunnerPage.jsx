// src/pages/HermesRunnerPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRedo, FaShieldAlt, FaBolt, FaFeatherAlt, FaPaw, FaWind } from 'react-icons/fa';
import './HermesRunnerPage.css';

// --- CONFIGURATION ---
const GRAVITY = 0.6;
const JUMP_FORCE = 13;
const SPEED_INCREMENT = 0.0015;
const INITIAL_SPEED = 7;
const MAX_SPEED = 22; 
const SPAWN_RATE = 110;

// Temps
const DURATION_FLIGHT = 4000;
const DURATION_TIGER = 5000;
const DURATION_GRAVITY = 8000;
const WARNING_TIME = 1500;

const GROUND_HEIGHT = 120;
const CEILING_HEIGHT = 120;
const PLAYER_SIZE = 100;

function HermesRunnerPage() {
  const [gameStatus, setGameStatus] = useState('loading');
  const [assos, setAssos] = useState([]);
  const [score, setScore] = useState(0);
  const [bonusMessage, setBonusMessage] = useState(null);
  
  const [activeEffects, setActiveEffects] = useState([]);
  const [isTiger, setIsTiger] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [gravityInverted, setGravityInverted] = useState(false);

  const requestRef = useRef();
  const runnerRef = useRef(null);
  const gameAreaRef = useRef(null);
  const ceilingYRef = useRef(300);

  const gameState = useRef({
    playerY: 0, velocity: 0, isJumping: false,
    currentSpeed: INITIAL_SPEED,
    isGravityInverted: false, gravityEndTime: 0,
    isFlying: false, flyEndTime: 0,
    isTiger: false, tigerEndTime: 0,
    invincible: false,
    obstacles: [], bonuses: [], frame: 0, score: 0, isGameOver: false
  });

  const [entities, setEntities] = useState({ obstacles: [], bonuses: [] });

  useEffect(() => {
    const updateDimensions = () => {
      const playableHeight = window.innerHeight - GROUND_HEIGHT - CEILING_HEIGHT - PLAYER_SIZE + 20;
      ceilingYRef.current = playableHeight > 100 ? playableHeight : 300;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
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
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleJump(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const updateGame = () => {
    if (gameState.current.isGameOver) return;
    const state = gameState.current;
    const now = Date.now();
    const currentCeiling = ceilingYRef.current;

    state.frame++;
    const targetSpeed = INITIAL_SPEED + (state.score / 150);
    state.currentSpeed = Math.min(targetSpeed, MAX_SPEED);
    state.score += (state.currentSpeed / 50);
    setScore(Math.floor(state.score));

    // --- ETATS ---
    if (state.gravityEndTime > now) {
        if (!state.isGravityInverted) { 
            state.isGravityInverted = true; 
            setGravityInverted(true); 
        }
    } else {
        if (state.isGravityInverted) { 
            state.isGravityInverted = false; 
            setGravityInverted(false); 
            state.isJumping = true; 
        }
    }

    if (state.flyEndTime > now) {
        const timeLeft = state.flyEndTime - now;
        if (timeLeft > 1000) {
            state.isFlying = true; setIsFlying(true);
            state.playerY = currentCeiling - 50; state.velocity = 0;
        } else {
            state.isFlying = false; setIsFlying(false); state.invincible = true; 
        }
    } else {
        setIsFlying(false); if (!state.isTiger) state.invincible = false;
    }

    if (state.tigerEndTime > now) {
        state.isTiger = true; setIsTiger(true); state.invincible = true;
    } else {
        state.isTiger = false; setIsTiger(false);
        if (state.flyEndTime < now) state.invincible = false;
    }

    // --- PHYSIQUE ---
    if (!state.isFlying) {
        state.playerY += state.velocity;
        if (state.isGravityInverted) state.velocity += GRAVITY; else state.velocity -= GRAVITY;

        if (state.playerY <= 0) {
            state.playerY = 0;
            if (!state.isGravityInverted) { state.velocity = 0; state.isJumping = false; }
        }
        if (state.playerY >= currentCeiling) {
            state.playerY = currentCeiling;
            if (state.isGravityInverted) { state.velocity = 0; state.isJumping = false; }
        }
    }

    // --- MISE À JOUR DU DOM ---
    if (runnerRef.current) {
        runnerRef.current.style.bottom = `${GROUND_HEIGHT + state.playerY}px`;
        
        // GESTION ROTATION (Gravité)
        // Si gravité inversée => Tête en bas (scaleY -1)
        // Sinon => Normal (scaleY 1)
        // Note: Le CSS ne doit PAS avoir de transform par défaut pour que ça marche.
        const rotation = state.isGravityInverted ? 'scaleY(-1)' : 'scaleY(1)';
        runnerRef.current.style.transform = rotation;
        
        if (state.isJumping && !state.isFlying) runnerRef.current.classList.add('jumping');
        else runnerRef.current.classList.remove('jumping');
    }

    // --- SPAWN ---
    if (state.frame % Math.floor(SPAWN_RATE / (state.currentSpeed / 5)) === 0) {
        spawnEntity(state, currentCeiling);
    }

    // Déplacement
    const moveFactor = state.currentSpeed / 10;
    state.obstacles.forEach(obs => obs.x -= moveFactor);
    state.obstacles = state.obstacles.filter(o => o.x > -20);
    state.bonuses.forEach(b => b.x -= moveFactor);
    state.bonuses = state.bonuses.filter(b => b.x > -20 && !b.collected);

    checkCollisions(state);
    updateHUD(state, now);

    setEntities({ obstacles: state.obstacles, bonuses: state.bonuses });
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const updateHUD = (state, now) => {
      const effects = [];
      if (state.flyEndTime > now) {
          const timeLeft = state.flyEndTime - now;
          effects.push({ id: 'fly', label: 'VOL', type: 'fly', icon: <FaFeatherAlt />, warning: timeLeft < 1000, timer: (timeLeft / 1000).toFixed(1) });
      }
      if (state.tigerEndTime > now) {
          const timeLeft = state.tigerEndTime - now;
          effects.push({ id: 'tiger', label: 'TIGRE', type: 'tiger', icon: <FaPaw />, warning: timeLeft < WARNING_TIME, timer: (timeLeft / 1000).toFixed(1) });
      }
      if (state.gravityEndTime > now) {
          const timeLeft = state.gravityEndTime - now;
          effects.push({ id: 'gravity', label: 'VORTEX', type: 'gravity', icon: <FaWind />, warning: timeLeft < WARNING_TIME, timer: (timeLeft / 1000).toFixed(1) });
      }
      setActiveEffects(effects);
  };

  const spawnEntity = (state, ceilingY) => {
      const rand = Math.random();
      
      // VORTEX (10%)
      if (rand > 0.90) {
          const hasVortex = state.obstacles.some(o => o.type === 'vortex' && o.x > 50);
          if (!hasVortex) {
              state.obstacles.push({ id: Date.now(), x: 100, type: 'vortex', width: 80, height: 1000 });
          }
          return;
      }

      // BONUS (30%)
      if (rand > 0.60) {
          const rBonus = Math.random();
          let type = 'asso';
          if (rBonus > 0.8) type = 'tiger';
          else if (rBonus > 0.6) type = 'fly';

          let assoData = null;
          if (type === 'asso' && assos.length > 0) assoData = assos[Math.floor(Math.random() * assos.length)];

          const isOnCeiling = state.isGravityInverted;
          
          // --- CORRECTION MAJEURE ICI : HAUTEUR DES BONUS ---
          // On les met à 20px du sol (ou du plafond inversé).
          // C'est très bas, donc facile à attraper en courant ou petit saut.
          const yPos = isOnCeiling ? 20 : ceilingY - 20; 

          state.bonuses.push({
              id: Date.now() + Math.random(),
              x: 100, y: yPos, type: type, asso: assoData, collected: false
          });
          return;
      }

      // OBSTACLE (60%)
      const isOnCeiling = state.isGravityInverted;
      const types = ['small', 'medium', 'tall'];
      const type = types[Math.floor(Math.random() * types.length)];
      let height = 70;
      if (type === 'medium') height = 110;
      if (type === 'tall') height = 160;

      state.obstacles.push({
          id: Date.now(), x: 100, y: isOnCeiling ? ceilingY : 0, isOnCeiling: isOnCeiling,
          type: type, width: 70, height: height
      });
  };

  const checkCollisions = (state) => {
    const pLeft = 10; const pRight = 16; 
    const pBottom = state.playerY; const pTop = state.playerY + PLAYER_SIZE - 15; 

    state.obstacles.forEach(obs => {
      const obsLeft = obs.x + 1; const obsRight = obs.x + 4; 
      if (pRight > obsLeft && pLeft < obsRight) {
        if (obs.type === 'vortex') {
            if (!obs.triggered) { obs.triggered = true; applyTerrainEffect(); }
            return; 
        }
        let collision = false;
        if (obs.isOnCeiling) {
            if (pTop > (obs.y - obs.height + 15)) collision = true;
        } else {
            if (pBottom < (obs.y + obs.height - 15)) collision = true;
        }
        if (collision) {
          if (state.invincible || state.isTiger) {
            obs.x = -100; setScore(s => s + 50);
          } else {
            gameOver();
          }
        }
      }
    });

    state.bonuses.forEach(bonus => {
      if (bonus.x < 18 && bonus.x > 8) {
        const bBottom = bonus.y; const bTop = bonus.y + 70;
        if (pTop > bBottom && pBottom < bTop) applyBonus(bonus);
      }
    });
  };

  const applyTerrainEffect = () => {
      const now = Date.now();
      gameState.current.gravityEndTime = now + DURATION_GRAVITY;
      if (!gameState.current.isGravityInverted) gameState.current.isJumping = true;
      showMessage("VORTEX DU CHAOS !", "#8e44ad");
  };

  const applyBonus = (bonus) => {
    bonus.collected = true;
    const state = gameState.current;
    const now = Date.now();

    switch (bonus.type) {
      case 'asso':
        state.score += 100;
        showMessage(`+100 ${bonus.asso.nom}`, bonus.asso.color);
        break;
      case 'fly':
        state.flyEndTime = now + DURATION_FLIGHT;
        showMessage("VOL HERMÈS !", "#3498db");
        break;
      case 'tiger':
        state.tigerEndTime = now + DURATION_TIGER;
        showMessage("TIGRE ROUGE !", "#e74c3c");
        break;
      default: break;
    }
  };

  const showMessage = (text, color) => {
    setBonusMessage({ text, color });
    setTimeout(() => setBonusMessage(null), 2500);
  };

  const startGame = () => {
    gameState.current = {
      playerY: 0, velocity: 0, isJumping: false,
      currentSpeed: INITIAL_SPEED, obstacles: [], bonuses: [],
      frame: 0, score: 0, isGameOver: false,
      isGravityInverted: false, gravityEndTime: 0,
      isFlying: false, flyEndTime: 0,
      isTiger: false, tigerEndTime: 0,
      invincible: false
    };
    setScore(0);
    setIsTiger(false); setIsFlying(false); setGravityInverted(false);
    setEntities({ obstacles: [], bonuses: [] });
    setGameStatus('playing');
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const gameOver = () => {
    gameState.current.isGameOver = true;
    cancelAnimationFrame(requestRef.current);
    setGameStatus('gameover');
  };

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  if (gameStatus === 'intro') {
    return (
      <div className="greek-overlay">
        <Helmet><title>Hermes Quest</title></Helmet>
        <Link to="/" className="greek-back-btn"><FaArrowLeft /> Olympe</Link>
        <div className="intro-screen">
          <div className="waterfall-container">
            {[0, 1, 2, 3].map((colIndex) => (
              <div key={colIndex} className={`waterfall-column col-${colIndex}`}>
                {[...shuffleArray(assos), ...shuffleArray(assos)].map((asso, i) => (
                  <div key={i} className="mini-card" style={{ borderColor: asso.color || '#DAA520' }}>
                    {asso.logo ? <img src={asso.logo} alt="" /> : <span style={{color: asso.color}}>{asso.nom[0]}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="intro-content">
            <h1 className="greek-title-large">HERMES QUEST</h1>
            <p className="intro-subtitle">Survivez au Chaos. Collectionnez la Gloire.</p>
            <button className="greek-start-button" onClick={startGame}><span className="text">LANCER</span></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        className={`greek-runner-container ${gravityInverted ? 'gravity-flip' : ''}`} 
        onMouseDown={handleJump} 
        onTouchStart={handleJump}
    >
      <Helmet><title>Vers l'Olympe !</title></Helmet>
      
      <div className="greek-hud-score">
        <span className="score-label">GLOIRE</span>
        <span className="score-value">{score}</span>
      </div>

      <div className="effects-hud">
        {activeEffects.map(effect => (
            <div key={effect.id} className={`effect-badge ${effect.type} ${effect.warning ? 'warning' : ''}`}>
                <div className="effect-icon">{effect.icon}</div>
                <div className="effect-info">
                    <span className="effect-label">{effect.label}</span>
                    {effect.timer && <span className="effect-timer">{effect.timer}s</span>}
                </div>
            </div>
        ))}
      </div>

      {bonusMessage && (
        <div className="bonus-popup" style={{ color: bonusMessage.color || '#DAA520' }}>
          {bonusMessage.text}
        </div>
      )}

      <div className="game-world" ref={gameAreaRef}>
        <div className="clouds-ground"></div>
        <div className="clouds-ceiling"></div>

        {/* JOUEUR */}
        <div 
            className={`player ${isTiger ? 'tiger-mode' : ''} ${isFlying ? 'flying-mode' : ''} ${gravityInverted ? 'gravity-inverted' : ''}`} 
            ref={runnerRef}
        >
            <div className="player-sprite"></div>
            {isTiger && <div className="tiger-aura"></div>}
            {isFlying && <div className="wings-effect"><FaFeatherAlt /></div>}
        </div>

        {entities.obstacles.map(obs => (
          <div 
            key={obs.id} 
            className={`obstacle ${obs.type} ${obs.isOnCeiling ? 'on-ceiling' : ''}`} 
            style={{ 
                left: `${obs.x}%`, 
                bottom: obs.isOnCeiling ? 'auto' : `${GROUND_HEIGHT}px`,
                top: obs.isOnCeiling ? `${CEILING_HEIGHT}px` : 'auto',
                width: `${obs.width}px`,
                height: obs.type === 'vortex' ? '100%' : `${obs.height}px`,
                top: obs.type === 'vortex' ? 0 : (obs.isOnCeiling ? `${CEILING_HEIGHT}px` : 'auto')
            }}
          >
            {obs.type === 'vortex' ? <div className="vortex-column"></div> : <div className="greek-column"></div>}
          </div>
        ))}

        {entities.bonuses.map(bonus => (
          <div 
            key={bonus.id} 
            className={`bonus-item ${bonus.type}`}
            style={{ 
                left: `${bonus.x}%`, 
                bottom: `${GROUND_HEIGHT + bonus.y}px`
            }}
          >
            {bonus.type === 'asso' && <img src={bonus.asso.logo} alt="" style={{borderColor: bonus.asso.color}} />}
            {bonus.type === 'fly' && <div className="powerup-icon fly"><FaFeatherAlt /></div>}
            {bonus.type === 'tiger' && <div className="powerup-icon tiger"><FaPaw /></div>}
          </div>
        ))}
      </div>

      {gameStatus === 'gameover' && (
        <div className="gameover-overlay animate-in">
          <h1 className="greek-text-red">CHUTE D'ICARE</h1>
          <div className="final-score-box">
            <p>Gloire Acquise</p>
            <h2>{score}</h2>
          </div>
          <div className="gameover-actions">
            <button className="greek-button" onClick={startGame}><FaRedo /> Réessayer</button>
            <Link to="/" className="greek-button secondary"><FaArrowLeft /> Olympe</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HermesRunnerPage;