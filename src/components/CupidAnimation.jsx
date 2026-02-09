import React, { useEffect, useState } from 'react';
import './CupidAnimation.css';

const CupidAnimation = ({ onImpact, onComplete }) => {
    const [step, setStep] = useState('hidden'); 
    const [styleVars, setStyleVars] = useState({});
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const calculateTrajectory = () => {
            // 1. Détection Mobile / Desktop
            const isMobile = window.innerWidth < 1024;
            const targetId = isMobile ? 'theme-toggle-mobile' : 'theme-toggle-desktop';
            const btn = document.getElementById(targetId);
            
            // Sécurité
            if (!btn || btn.offsetParent === null) {
                console.log("Cible introuvable :", targetId);
                return false; 
            }

            const rect = btn.getBoundingClientRect();
            
            // 2. Coordonnées Cible (Fin)
            const endX = rect.left + rect.width / 2;
            const endY = rect.top + rect.height / 2;
            
            // 3. Coordonnées Départ (Archer)
            const startX = window.innerWidth * 0.1; 
            const startY = window.innerHeight * 0.85; 

            // 4. Calcul des Angles
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Angle brut (pour le déplacement de la flèche)
            const rawAngleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            // Angle corrigé (pour l'orientation de l'emoji Arc 🏹)
            // L'emoji pointe naturellement vers le haut-droite (-45°).
            // Pour l'aligner à 0° (droite), il faut ajouter 45°.
            const archerAngleDeg = rawAngleDeg + 45; 

            setStyleVars({
                '--start-x': `${startX}px`,
                '--start-y': `${startY}px`,
                '--end-x': `${endX}px`,
                '--end-y': `${endY}px`,
                '--angle-arrow': `${rawAngleDeg}deg`,    // Angle trajectoire
                '--angle-archer': `${archerAngleDeg}deg` // Angle visuel arc
            });
            return true;
        };

        const checkInterval = setInterval(() => {
            if (calculateTrajectory()) {
                clearInterval(checkInterval);
                setStep('aiming');
                setTimeout(() => setStep('shooting'), 1500);
                setTimeout(() => {
                    setStep('impact');
                    if (onImpact) onImpact();
                    if (onComplete) setTimeout(onComplete, 2000);
                }, 2200); 
            }
        }, 100);

        const timeoutSafety = setTimeout(() => clearInterval(checkInterval), 5000);
        return () => { clearInterval(checkInterval); clearTimeout(timeoutSafety); };
    }, [onImpact, onComplete]);

    // Gestion particules
    useEffect(() => {
        let pInterval;
        if (step === 'shooting') {
            pInterval = setInterval(() => {
                const id = Date.now();
                setParticles(p => [...p, { id, style: { top: (Math.random()*20-10)+'px', left: (Math.random()*20-10)+'px' }}]);
                setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 600);
            }, 30);
        }
        return () => clearInterval(pInterval);
    }, [step]);

    if (step === 'hidden') return null;

    return (
        <div className="cupid-overlay" style={styleVars}>
            {/* On utilise --angle-archer pour l'image de l'arc */}
            <div className={`cupid-archer ${step}`}>🏹</div>

            {step === 'shooting' && (
                <div className="cupid-arrow-container">
                    <div className="better-arrow">
                        <div className="arrow-tail">💕</div>
                        <div className="arrow-shaft"></div>
                        <div className="arrow-tip">❤️</div>
                    </div>
                    <div className="particle-trail">
                        {particles.map(p => <span key={p.id} className="trail-sparkle" style={p.style}>✨</span>)}
                    </div>
                </div>
            )}
            
            {step === 'impact' && (
                <div className="impact-hearts" style={{ left: styleVars['--end-x'], top: styleVars['--end-y'] }}>💘</div>
            )}
        </div>
    );
};

export default CupidAnimation;