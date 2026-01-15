import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHubSession } from '../../hooks/useHubSession';
import { FaSpinner, FaGhost, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import '../HermesRunnerPage.css';

const PlayerLobbyPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { session, players, subscribeToSession } = useHubSession();
    
    // État local pour gérer l'affichage précis
    const [statusMessage, setStatusMessage] = useState("Connexion au Temple...");
    const [isEliminated, setIsEliminated] = useState(false);

    // 1. Initialisation
    useEffect(() => {
        if (!state?.sessionId) { 
            navigate('/join'); 
            return; 
        }
        // On s'abonne pour recevoir le signal "START" ou "RESET"
        subscribeToSession(state.sessionId);
    }, []); 

    // 2. Le Cerveau du Lobby (Redirection vs Attente)
    useEffect(() => {
        if (!session) return;

        // On cherche notre profil dans la liste des joueurs reçue du serveur
        const me = players.find(p => p.id === state.playerId);
        
        // IMPORTANT : Si on ne nous trouve pas encore dans la liste, on attend (chargement)
        // Cela évite de nous considérer "vivant" par défaut et de nous renvoyer dans le jeu par erreur.
        if (!me) {
            setStatusMessage("Récupération de votre statut...");
            return;
        }

        // Mise à jour de l'état visuel (Mort ou Vivant ?)
        setIsEliminated(!me.is_alive);

        // --- LOGIQUE DE REDIRECTION ---
        
        if (session.status === 'PLAYING') {
            if (me.is_alive) {
                // CAS A : La partie est en cours ET je suis vivant -> GO !
                navigate('/multiplayer-run', { state: state });
            } else {
                // CAS B : La partie tourne MAIS je suis mort -> J'attends
                setStatusMessage("En attente de la fin du round...");
            }
        } 
        
        else if (session.status === 'WAITING') {
            // CAS C : L'hôte a fait "Reset", on attend le prochain départ
            setStatusMessage("L'Hôte prépare la prochaine course...");
            // Si l'hôte a reset, tout le monde repasse 'is_alive=true', donc l'écran va changer tout seul
        }

    }, [session, players, navigate, state]);

    // --- RENDER (AFFICHAGE) ---

    return (
        <div className="greek-runner-container" style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
        }}>
            
            {/* SCÉNARIO 1 : JOUEUR ÉLIMINÉ (Attente fin de partie) */}
            {session?.status === 'PLAYING' && isEliminated && (
                <div className="lobby-state eliminated animate-in">
                    <div style={{
                        width: '100px', height: '100px', margin: '0 auto 20px',
                        background: 'rgba(255, 0, 0, 0.1)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #e74c3c'
                    }}>
                        <FaGhost style={{fontSize: '3rem', color: '#e74c3c'}} />
                    </div>
                    <h2 className="greek-text-red">ÉLIMINÉ</h2>
                    <p style={{fontSize: '1.1rem', marginTop: '10px', color: '#ddd'}}>
                        Bravo pour ta course !<br/>
                        Regarde l'écran principal pour suivre les survivants.
                    </p>
                    <div className="status-badge" style={{marginTop: '30px', background: '#333'}}>
                        {statusMessage}
                    </div>
                </div>
            )}

            {/* SCÉNARIO 2 : EN ATTENTE DU DÉPART (Classique ou après Reset) */}
            {session?.status === 'WAITING' && (
                <div className="lobby-state waiting animate-in">
                    <FaSpinner className="loading-icon" style={{fontSize: '4rem', color: '#DAA520', marginBottom: '20px'}} />
                    <h2 style={{color: '#fff'}}>PROCHAIN ROUND</h2>
                    <p style={{margin: '10px 0'}}>Préparez-vous à courir !</p>
                    
                    <div className="player-card-mini" style={{
                        marginTop: '30px', padding: '15px', 
                        background: 'rgba(218, 165, 32, 0.1)', 
                        border: '1px solid #DAA520', borderRadius: '10px'
                    }}>
                        <FaCheckCircle style={{color: '#2ecc71', marginRight: '10px'}} />
                        <strong>Connecté : </strong> {players.find(p => p.id === state.playerId)?.pseudo || 'Héros'}
                    </div>

                    <p className="greek-text-small" style={{marginTop: '20px', opacity: 0.6}}>
                        Regardez l'écran géant
                    </p>
                </div>
            )}

            {/* SCÉNARIO 3 : CHARGEMENT INITIAL */}
            {!session && (
                <div className="lobby-loading">
                    <h2>Connexion...</h2>
                </div>
            )}

        </div>
    );
};

export default PlayerLobbyPage;