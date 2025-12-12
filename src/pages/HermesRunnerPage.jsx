// src/pages/HermesRunnerPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRedo, FaFeatherAlt, FaPaw, FaWind, FaMobileAlt } from 'react-icons/fa';
import './HermesRunnerPage.css';

// --- CONFIGURATION ---
const GRAVITY = 0.6; 
const JUMP_FORCE = 13.5; 
const INITIAL_SPEED = 6; 
const MAX_SPEED = 20; 
const MAX_JUMP_HEIGHT = 160; 

// Temps des effets
const DURATION_FLIGHT = 5000;
const DURATION_TIGER = 6000;
const DURATION_GRAVITY = 8000;
const WARNING_TIME = 2000;

function HermesRunnerPage() {
  const [gameStatus, setGameStatus] = useState('loading');
  const [assos, setAssos] = useState([]);
  const [score, setScore] = useState(0);
  const [bonusMessage, setBonusMessage] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]);
  
  // États de jeu
  const [isTiger, setIsTiger] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [gravityInverted, setGravityInverted] = useState(false);

  // --- DIMENSIONS DYNAMIQUES ---
  // On utilise des états pour que React mette à jour l'affichage si on change d'orientation
  const [dimensions, setDimensions] = useState({
    groundHeight: 120,
    ceilingHeight: 120,
    playerSize: 100
  });

  const requestRef = useRef();
  const runnerRef = useRef(null);
  const gameAreaRef = useRef(null);
  const ceilingYRef = useRef(300); // Plafond jouable (exclut les bandes nuages)

  const gameState = useRef({
    playerY: 0, 
    velocity: 0, 
    isJumping: false,
    currentSpeed: INITIAL_SPEED,
    isGravityInverted: false, gravityEndTime: 0,
    isFlying: false, flyEndTime: 0,
    isTiger: false, tigerEndTime: 0,
    invincible: false,
    obstacles: [], 
    bonuses: [], 
    frame: 0, 
    score: 0, 
    isGameOver: false,
    spawnTimer: 0 
  });

  const [entities, setEntities] = useState({ obstacles: [], bonuses: [] });

  // GESTION RESPONSIVE ET ORIENTATION
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Détection Mobile (Petit écran ou mode paysage smartphone)
      const isMobile = width < 768 || height < 500;

      // Valeurs réduites pour mobile
      const newGround = isMobile ? 50 : 120;
      const newCeiling = isMobile ? 50 : 120;
      const newPlayerSize = isMobile ? 60 : 100;

      setDimensions({
        groundHeight: newGround,
        ceilingHeight: newCeiling,
        playerSize: newPlayerSize
      });

      // Calcul de la zone jouable verticale
      const playableHeight = height - newGround - newCeiling - newPlayerSize + 10;
      ceilingYRef.current = playableHeight > 80 ? playableHeight : 200;
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => setTimeout(handleResize, 200));
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
    }
  }, []);

  // Chargement Assos
  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('asso').select('*').eq('status', 'publié');
      if (data) setAssos(data);
      setGameStatus('intro');
    };
    loadData();
  }, []);

  // Saut
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
      if (e.code === 'Space' || e.code === 'ArrowUp') { 
          e.preventDefault(); 
          handleJump(); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  // --- BOUCLE DE JEU ---
  const updateGame = () => {
    if (gameState.current.isGameOver) return;
    const state = gameState.current;
    const now = Date.now();
    const currentCeiling = ceilingYRef.current;

    state.frame++;
    
    // Vitesse Crescendo Doux
    const targetSpeed = INITIAL_SPEED + (state.score / 300);
    state.currentSpeed = Math.min(targetSpeed, MAX_SPEED);
    state.score += (state.currentSpeed / 50);
    setScore(Math.floor(state.score));

    // --- ETATS ---
    if (state.gravityEndTime > now) {
        if (!state.isGravityInverted) { 
            state.isGravityInverted = true; 
            setGravityInverted(true); 
            if (state.playerY < 50) state.velocity = 5; 
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
            const flightHeight = state.isGravityInverted ? 30 : currentCeiling - 30;
            state.playerY += (flightHeight - state.playerY) * 0.1;
            state.velocity = 0;
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
        if (state.flyEndTime < now - 1000) state.invincible = false;
    }

    // --- PHYSIQUE ---
    if (!state.isFlying) {
        state.playerY += state.velocity;
        if (state.isGravityInverted) state.velocity += GRAVITY; 
        else state.velocity -= GRAVITY;

        if (state.playerY <= 0) {
            state.playerY = 0;
            if (!state.isGravityInverted) { state.velocity = 0; state.isJumping = false; }
        }
        if (state.playerY >= currentCeiling) {
            state.playerY = currentCeiling;
            if (state.isGravityInverted) { state.velocity = 0; state.isJumping = false; }
        }
    }

    // --- DOM (Position Joueur) ---
    if (runnerRef.current) {
        // Utilise la hauteur dynamique du sol
        runnerRef.current.style.bottom = `${dimensions.groundHeight + state.playerY}px`;
        
        const rotation = state.isGravityInverted ? 'scaleY(-1)' : 'scaleY(1)';
        runnerRef.current.style.transform = rotation;
        
        if (state.isJumping && !state.isFlying) runnerRef.current.classList.add('jumping');
        else runnerRef.current.classList.remove('jumping');
    }

    // --- SPAWN ---
    state.spawnTimer -= state.currentSpeed;
    if (state.spawnTimer <= 0) {
        spawnEntity(state, currentCeiling);
        const minGap = 450 + (state.currentSpeed * 8); 
        const randomGap = Math.random() * 300;
        state.spawnTimer = minGap + randomGap;
    }

    // --- DÉPLACEMENT ---
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

  const spawnEntity = (state, ceilingY) => {
      const rand = Math.random();
      const isOnCeiling = state.isGravityInverted;
      
      // On adapte la taille des obstacles si on est sur mobile
      // (On détecte mobile via la hauteur du sol, astuce simple)
      const isMobile = dimensions.groundHeight < 80;

      // 1. BONUS (35%)
      if (rand > 0.65) {
          const rBonus = Math.random();
          let type = 'asso';
          if (rBonus > 0.85) type = 'tiger'; 
          else if (rBonus > 0.70) type = 'fly';

          let assoData = null;
          if (type === 'asso' && assos.length > 0) assoData = assos[Math.floor(Math.random() * assos.length)];

          // Hauteur adaptative
          const randomJumpHeight = 20 + Math.random() * (MAX_JUMP_HEIGHT - 60); 
          const yPos = isOnCeiling ? ceilingY - randomJumpHeight : randomJumpHeight;

          state.bonuses.push({ id: Date.now() + Math.random(), x: 110, y: yPos, type: type, asso: assoData, collected: false });
          return;
      }

      // 2. OBSTACLE
      if (rand < 0.05 && !state.isGravityInverted && state.gravityEndTime < Date.now()) {
          state.obstacles.push({ id: Date.now(), x: 110, type: 'vortex', width: 80, height: 1000 });
          return;
      }

      const types = ['small', 'medium', 'tall'];
      const typeRand = Math.random();
      let type = 'small';
      if (typeRand > 0.6) type = 'medium';
      if (typeRand > 0.9) type = 'tall';

      let height = 50;
      if (type === 'medium') height = isMobile ? 70 : 90; 
      if (type === 'tall') height = isMobile ? 90 : 110;  

      // Largeur réduite sur mobile
      const width = isMobile ? 50 : 70;

      state.obstacles.push({
          id: Date.now(), x: 110, 
          y: isOnCeiling ? ceilingY : 0, 
          isOnCeiling: isOnCeiling,
          type: type, width: width, height: height
      });
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

  const checkCollisions = (state) => {
    // Hitbox adaptative
    const pLeft = 12; 
    const pRight = 14; 
    
    const pBottom = state.playerY + 15; 
    const pTop = state.playerY + dimensions.playerSize - 15; // Utilise la taille dynamique

    state.obstacles.forEach(obs => {
      const obsLeft = obs.x + 1; 
      const obsRight = obs.x + 3; // Hitbox obstacle fine

      if (obsLeft < pRight && obsRight > pLeft) {
        if (obs.type === 'vortex') {
            if (!obs.triggered) { obs.triggered = true; applyTerrainEffect(); }
            return; 
        }

        let collision = false;
        if (obs.isOnCeiling) {
            const obsBottomLimit = obs.y - obs.height + 5; 
            if (pTop > obsBottomLimit) collision = true;
        } else {
            const obsTopLimit = obs.height - 5; 
            if (pBottom < obsTopLimit) collision = true;
        }

        if (collision) {
          if (state.invincible || state.isTiger) {
            obs.x = -100; setScore(s => s + 50); showMessage("BOUM !", "#fff");
          } else {
            gameOver();
          }
        }
      }
    });

    state.bonuses.forEach(bonus => {
      if (bonus.x < 18 && bonus.x > 8) {
        const bY = bonus.y; 
        const playerCenter = state.playerY + (dimensions.playerSize/2);
        const bonusCenter = bY + (dimensions.playerSize < 80 ? 25 : 35); // Centre du bonus approx
        if (Math.abs(playerCenter - bonusCenter) < 60) applyBonus(bonus);
      }
    });
  };

  const applyTerrainEffect = () => {
      const now = Date.now();
      gameState.current.gravityEndTime = now + DURATION_GRAVITY;
      showMessage("VORTEX DU CHAOS !", "#8e44ad");
  };

  const applyBonus = (bonus) => {
    bonus.collected = true;
    const state = gameState.current;
    const now = Date.now();

    switch (bonus.type) {
      case 'asso':
        state.score += 10; 
        showMessage(`+10 ${bonus.asso ? bonus.asso.nom : 'POINTS'}`, bonus.asso ? bonus.asso.color : '#FFD700');
        break;
      case 'fly':
        state.flyEndTime = now + DURATION_FLIGHT;
        showMessage("VOL HERMÈS !", "#3498db");
        break;
      case 'tiger':
        state.tigerEndTime = now + DURATION_TIGER;
        showMessage("MODE TIGRE !", "#e74c3c");
        break;
      default: break;
    }
  };

  const showMessage = (text, color) => {
    setBonusMessage({ text, color });
    setTimeout(() => setBonusMessage(null), 4000);
  };

  const startGame = () => {
    gameState.current = {
      playerY: 0, velocity: 0, isJumping: false,
      currentSpeed: INITIAL_SPEED, obstacles: [], bonuses: [],
      frame: 0, score: 0, isGameOver: false,
      isGravityInverted: false, gravityEndTime: 0,
      isFlying: false, flyEndTime: 0,
      isTiger: false, tigerEndTime: 0,
      invincible: false,
      spawnTimer: 0
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

  return (
    <>
      <div className="orientation-lock">
        <FaMobileAlt className="rotate-icon" />
        <h2>Tournez votre téléphone</h2>
        <p>Hermes Quest se joue uniquement à l'horizontale.</p>
      </div>

      <div 
          className={`greek-runner-container ${gravityInverted ? 'gravity-flip' : ''}`} 
          onMouseDown={handleJump} 
          onTouchStart={handleJump}
      >
        <Helmet><title>Hermes Quest</title></Helmet>
        
        {/* INTRO */}
        {gameStatus === 'intro' && (
          <div className="greek-overlay">
            <Link to="/" className="greek-back-btn"><FaArrowLeft /> Olympe</Link>
            <div className="intro-screen">
              <div className="waterfall-container">
                {[0, 1, 2, 3].map((colIndex) => (
                  <div key={colIndex} className={`waterfall-column col-${colIndex}`}>
                    {[...shuffleArray(assos), ...shuffleArray(assos)].map((asso, i) => (
                      <div key={i} className="mini-card" style={{ borderColor: asso.color || '#DAA520' }}>
                        {asso.logo ? <img src={asso.logo} alt="" /> : <span style={{color: asso.color}}>{asso.nom ? asso.nom[0] : '?'}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="intro-content">
                <h1 className="greek-title-large">HERMES QUEST</h1>
                <p className="intro-subtitle">Vitesse Divine & Sauts Légendaires</p>
                <p style={{color:'#fff', marginBottom:'1.5rem', fontSize:'0.8rem', opacity:0.9}}>
                    Tapez pour sauter • Évitez les colonnes
                </p>
                <button className="greek-start-button" onClick={startGame}><span className="text">COURIR</span></button>
              </div>
            </div>
          </div>
        )}

        {/* HUD EN JEU */}
        {gameStatus === 'playing' && (
            <>
                <Link to="/" className="greek-back-btn" style={{top: '15px', left: '15px', padding: '6px 12px'}}><FaArrowLeft /></Link>
                <div className="greek-hud-score">
                    <span className="score-label">SCORE</span>
                    <span className="score-value">{score}</span>
                </div>
                <div className="effects-hud">
                    {activeEffects.map(effect => (
                        <div key={effect.id} className={`effect-badge ${effect.type} ${effect.warning ? 'warning' : ''}`}>
                            <div className="effect-icon">{effect.icon}</div>
                            <div className="effect-info">
                                {effect.timer && <span className="effect-timer">{effect.timer}s</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {bonusMessage && (
          <div className="bonus-popup" style={{ color: bonusMessage.color || '#DAA520' }}>
            {bonusMessage.text}
          </div>
        )}

        <div className="game-world" ref={gameAreaRef}>
          {/* Les hauteurs sont gérées par CSS Media Queries, ici on met juste les divs */}
          <div className="clouds-ground"></div>
          <div className="clouds-ceiling"></div>

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
                  // Utilisation des dimensions dynamiques
                  bottom: obs.type === 'vortex' ? 0 : (obs.isOnCeiling ? 'auto' : `${dimensions.groundHeight}px`),
                  top: obs.type === 'vortex' ? 0 : (obs.isOnCeiling ? `${dimensions.ceilingHeight}px` : 'auto'),
                  width: `${obs.width}px`,
                  height: obs.type === 'vortex' ? '100%' : `${obs.height}px`
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
                  bottom: `${dimensions.groundHeight + bonus.y}px`
              }}
            >
              {bonus.type === 'asso' && bonus.asso && <img src={bonus.asso.logo} alt="" style={{borderColor: bonus.asso.color}} />}
              {bonus.type === 'fly' && <div className="powerup-icon fly"><FaFeatherAlt /></div>}
              {bonus.type === 'tiger' && <div className="powerup-icon tiger"><FaPaw /></div>}
            </div>
          ))}
        </div>

        {gameStatus === 'gameover' && (
          <div className="gameover-overlay animate-in">
            <h1 className="greek-text-red">ÉCHEC</h1>
            <div className="final-score-box">
              <p>Score Final</p>
              <h2>{score}</h2>
            </div>
            <div className="gameover-actions">
              <button className="greek-button" onClick={startGame}><FaRedo /> Rejouer</button>
              <Link to="/" className="greek-button secondary"><FaArrowLeft /> Quitter</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HermesRunnerPage;