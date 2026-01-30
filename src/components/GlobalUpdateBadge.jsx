import React, { useState, useEffect, useRef } from 'react';
import { FaSyncAlt, FaArrowUp, FaBug } from 'react-icons/fa';

const GlobalUpdateBadge = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [serverVersion, setServerVersion] = useState(null);
    
    // On utilise useRef pour garder la version en mémoire même si le composant fait des siennes
    const localVersionRef = useRef(null);

    // 1. LOGIQUE DE VÉRIFICATION (Toutes les minutes)
    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Anti-cache : on ajoute l'heure pour forcer le navigateur à lire le vrai fichier
                const response = await fetch(`/version.json?t=${new Date().getTime()}`);
                
                if (!response.ok) return; // Si 404 ou erreur, on arrête
                
                const data = await response.json();
                const fetchedVersion = data.version;

                // Cas 1 : Premier chargement réussi (on stocke la version de base)
                if (localVersionRef.current === null) {
                    localVersionRef.current = fetchedVersion;
                    console.log(`[UpdateSystem] Version initiale chargée : v${fetchedVersion}`);
                } 
                // Cas 2 : On a déjà une version, on compare avec celle du serveur
                else if (fetchedVersion !== localVersionRef.current) {
                    console.log(`[UpdateSystem] Nouvelle version détectée ! (v${localVersionRef.current} -> v${fetchedVersion})`);
                    setServerVersion(fetchedVersion);
                    setUpdateAvailable(true);
                }
            } catch (error) {
                // Silencieux pour ne pas gêner le joueur, mais utile en dev
                // console.warn("Vérification maj impossible (hors ligne ?)");
            }
        };

        // Premier check immédiat
        checkVersion();

        // Check toutes les 60 secondes
        const interval = setInterval(checkVersion, 60000);

        return () => clearInterval(interval);
    }, []);

    const reloadApp = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(reg => reg.unregister());
            });
        }
        window.location.reload(true);
    };

    // --- MODE DEV : BOUTON DE TEST ---
    // Si on est en local et que rien ne s'affiche, on montre un bouton rouge pour tester le design
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    if (isLocalhost && !updateAvailable) {
        return (
            <button 
                onClick={() => { setServerVersion("TEST-1.5"); setUpdateAvailable(true); }}
                style={{
                    position: 'fixed', bottom: 10, left: 10, zIndex: 999999,
                    background: 'rgba(255, 0, 0, 0.5)', color: 'white', border: 'none',
                    padding: '5px 10px', borderRadius: '5px', fontSize: '0.7rem', cursor: 'pointer'
                }}
            >
                <FaBug /> TEST UPDATE UI
            </button>
        );
    }
    // ---------------------------------

    // Si pas de mise à jour, on n'affiche rien
    if (!updateAvailable) return null;

    // 2. AFFICHAGE (Bandeau Flottant Global)
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            animation: 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {/* Bulle d'info */}
            <div style={{
                background: '#DAA520', // Or
                color: '#000',
                padding: '10px 20px',
                borderRadius: '8px',
                marginBottom: '10px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <FaArrowUp /> Mise à jour v{serverVersion} disponible !
            </div>

            {/* Bouton d'action */}
            <button 
                onClick={reloadApp}
                style={{
                    background: '#111',
                    color: '#fff',
                    border: '2px solid #DAA520',
                    padding: '12px 25px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(218, 165, 32, 0.4)',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <FaSyncAlt className="spin-icon" /> INSTALLER MAINTENANT
            </button>

            <style>{`
                @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .spin-icon { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default GlobalUpdateBadge;