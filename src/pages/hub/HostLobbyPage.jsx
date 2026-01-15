import React, { useEffect } from 'react';
import { useHubSession } from '../../hooks/useHubSession';
import QRCodeDisplay from '../../components/hub/QRCodeDisplay';
import LiveLeaderboard from '../../components/hub/LiveLeaderboard';
import { FaPlay, FaUsers, FaSkull, FaRunning } from 'react-icons/fa';
import '../HermesRunnerPage.css';

const HostLobbyPage = () => {
    const { session, players, createSession, subscribeToSession, startSession, resetSession } = useHubSession();

    useEffect(() => {
        const init = async () => {
            const newSession = await createSession(null); 
            if (newSession) subscribeToSession(newSession.id);
        };
        init();
    }, []);

    if (!session) return <div className="greek-runner-container"><h1>Création du Temple...</h1></div>;
    const joinUrl = `${window.location.origin}/join?code=${session.qr_code_str}`;

    // COMPTAGE DES SURVIVANTS
    const survivorsCount = players.filter(p => p.is_alive).length;
    const totalPlayers = players.length;
    // La partie est considérée "finie" uniquement si des joueurs ont rejoint ET qu'ils sont tous morts
    const isRoundOver = session.status === 'PLAYING' && survivorsCount === 0 && totalPlayers > 0;
    // On peut lancer si on est en attente ET qu'il y a des joueurs
    const canLaunch = session.status === 'WAITING' && players.length > 0;

    return (
        <div className="greek-runner-container hub-host-container" style={{overflowY: 'auto', padding: '20px'}}>
            <div className="host-header">
                <h1>HERMES QUEST : HOST</h1>
                <div className="session-code">CODE: <span>{session.qr_code_str}</span></div>
            </div>

            <div className="host-content" style={{display: 'flex', gap: '40px', marginTop: '30px', justifyContent: 'center'}}>
                
                {/* QR CODE */}
                <div className="host-join-panel">
                    <h2>Rejoindre</h2>
                    <QRCodeDisplay value={joinUrl} size={300} />
                    <p style={{marginTop: '20px', fontSize: '1.2rem'}}>{joinUrl}</p>
                </div>

                {/* TABLEAU ET CONTRÔLES */}
                <div className="host-players-panel" style={{minWidth: '400px'}}>
                    <h2><FaUsers /> Joueurs ({players.length})</h2>
                    <LiveLeaderboard players={players} />
                    
                    <div className="host-controls" style={{marginTop: '30px', width: '100%'}}>
                        
                        {/* --- BOUTON UNIQUE D'ACTION --- */}
                        
                        {/* CAS 1 : PRÊT À LANCER */}
                        {canLaunch && (
                            <button 
                                className="greek-start-button" 
                                style={{marginTop: '30px', width: '100%', fontSize: '1.5rem'}}
                                onClick={() => startSession(session.id)}
                            >
                                <FaPlay /> LANCER LA COURSE
                            </button>
                        )}
                        
                        {/* CAS 2 : PARTIE FINIE (TOUS MORTS) -> ROUND SUIVANT */}
                        {isRoundOver && (
                            <div className="animate-in" style={{textAlign: 'center'}}>
                                <div style={{color: '#e74c3c', fontSize: '1.5rem', marginBottom: '15px', fontWeight: 'bold'}}>
                                    <FaSkull /> TOUS ÉLIMINÉS
                                </div>
                                <button 
                                    className="greek-button secondary" 
                                    style={{width: '100%', fontSize: '1.2rem', padding: '15px'}}
                                    onClick={() => resetSession(session.id)}
                                >
                                    🔄 ROUND SUIVANT (RESET)
                                </button>
                            </div>
                        )}

                        {/* CAS 3 : PARTIE EN COURS (PAS DE BOUTON) */}
                        {session.status === 'PLAYING' && !isRoundOver && (
                             <div style={{textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
                                <div style={{color: '#2ecc71', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
                                    <div><FaRunning className="pulse-icon" /> Partie en cours...</div>
                                    <div style={{background: '#2ecc71', color: 'black', padding: '5px 15px', borderRadius: '20px'}}>
                                        {survivorsCount} Survivant(s)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MESSAGE D'ATTENTE VIDE */}
                        {players.length === 0 && session.status === 'WAITING' && (
                            <p style={{textAlign: 'center', marginTop: '20px', color: '#ccc'}}>En attente de héros...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostLobbyPage;