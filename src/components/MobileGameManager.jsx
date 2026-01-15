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
        };
        
        // Écouter le redimensionnement (rotation)
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const enterImmersion = () => {
        // 1. Demander le Plein Écran (Cache la barre URL)
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        }
        setIsFullscreen(true);

        // 2. Tenter de verrouiller l'orientation (Android seulement)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => console.log("Verrouillage orientation non supporté"));
        }
    };

    // Si on n'est pas sur une page de jeu, on ne fait rien
    if (!isGamePage) return null;

    // SCÉNARIO 1 : En Portrait -> On bloque tout avec un rideau noir
    if (isPortrait) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
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

    // SCÉNARIO 2 : En Paysage mais pas Plein Écran -> Bouton pour cacher la barre
    if (!isFullscreen && !document.fullscreenElement) { // Check double sécurité
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 999998,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#DAA520'
            }}>
                <h1 style={{marginBottom: '30px'}}>PRÊT À ENTRER ?</h1>
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
                <p style={{marginTop: '20px', color: '#fff', opacity: 0.7}}>Cela masquera la barre de navigation</p>
            </div>
        );
    }

    return null; // Tout est bon, on laisse voir le jeu
};

export default MobileGameManager;