import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaMobileAlt, FaExpand } from 'react-icons/fa';

const MobileGameManager = () => {
    const location = useLocation();
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Liste des pages où on veut forcer le mode JEU
    const gameRoutes = ['/join', '/lobby', '/multiplayer-run', '/host', '/runner'];
    const isGamePage = gameRoutes.includes(location.pathname);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
            // Si on passe en paysage, on tente de scroller pour cacher la barre (Hack iOS)
            if (window.innerWidth > window.innerHeight) {
                window.scrollTo(0, 1);
            }
        };
        
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    const enterImmersion = () => {
        // 1. Demander le Plein Écran (Android / PC)
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(); // Safari (parfois inactif sur iPhone, mais on tente)
        }
        
        // 2. Hack iOS : Scroller pour essayer de cacher la barre d'adresse
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);

        // 3. Valider l'état (Pour faire disparaître ce menu)
        setIsFullscreen(true);

        // 4. Verrouillage orientation (Android uniquement - Crash safe)
        try {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        } catch (e) {
            // Ignorer sur iOS qui ne supporte pas le lock
        }
    };

    if (!isGamePage) return null;

    // SCÉNARIO 1 : En Portrait -> Rideau noir bloquant
    if (isPortrait) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', // ✅ dvh ici aussi
                backgroundColor: '#000', zIndex: 999999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', textAlign: 'center', padding: '20px'
            }}>
                <FaMobileAlt className="rotate-icon" style={{fontSize: '4rem', marginBottom: '20px', animation: 'spin 2s infinite'}} />
                <h2 style={{textTransform: 'uppercase', fontFamily: 'Arial'}}>Tournez votre téléphone</h2>
                <p>Le jeu ne fonctionne qu'en mode paysage.</p>
                
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        25% { transform: rotate(90deg); }
                        100% { transform: rotate(90deg); }
                    }
                `}</style>
            </div>
        );
    }

    // SCÉNARIO 2 : Paysage mais pas encore "activé" par le joueur
    // On affiche ce bouton sur iOS aussi pour garantir que l'utilisateur est prêt
    if (!isFullscreen && !document.fullscreenElement) { 
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', // ✅ dvh
                backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 999998,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#DAA520'
            }}>
                <h1 style={{marginBottom: '30px'}}>MODE IMMERSIF</h1>
                <button 
                    onClick={enterImmersion}
                    style={{
                        padding: '20px 40px', fontSize: '1.5rem', fontWeight: 'bold',
                        backgroundColor: '#DAA520', color: 'black', border: 'none', borderRadius: '50px',
                        display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(218, 165, 32, 0.6)'
                    }}
                >
                    <FaExpand /> LANCER LE JEU
                </button>
                <p style={{marginTop: '20px', color: '#fff', opacity: 0.7, fontSize: '0.9rem'}}>
                    (Touchez pour optimiser l'écran)
                </p>
            </div>
        );
    }

    return null; 
};

export default MobileGameManager;