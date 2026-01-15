import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHubSession } from '../../hooks/useHubSession';
import PlayerAvatar from '../../components/hub/PlayerAvatar';
import '../HermesRunnerPage.css';

const AVATARS = ['hermes', 'cat', 'ghost', 'robot'];

const PlayerJoinPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { joinSession, error } = useHubSession();
    
    const [pseudo, setPseudo] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('hermes');
    const [code, setCode] = useState(searchParams.get('code') || '');

    const handleJoin = async (e) => {
        e.preventDefault();
        const result = await joinSession(code.toUpperCase(), pseudo, selectedAvatar);
        if (result) {
            // On stocke les infos pour la page suivante
            navigate('/lobby', { state: { 
                sessionId: result.session.id, 
                playerId: result.player.id,
                sessionCode: result.session.qr_code_str 
            }});
        }
    };

    return (
        <div className="greek-runner-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div className="auth-modal" style={{position: 'relative', display: 'block'}}>
                <h2>Rejoindre l'Olympe</h2>
                <form onSubmit={handleJoin}>
                    <input 
                        type="text" 
                        placeholder="Code Session (ex: A1B2)" 
                        value={code} 
                        onChange={e => setCode(e.target.value)}
                        required 
                    />
                    <input 
                        type="text" 
                        placeholder="Ton Pseudo de Héros" 
                        value={pseudo} 
                        onChange={e => setPseudo(e.target.value)}
                        required 
                        maxLength={12}
                    />
                    
                    <div className="avatar-selector" style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
                        {AVATARS.map(av => (
                            <div 
                                key={av} 
                                onClick={() => setSelectedAvatar(av)}
                                style={{
                                    padding: '10px', 
                                    border: selectedAvatar === av ? '2px solid #DAA520' : '2px solid transparent',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <PlayerAvatar avatarId={av} />
                            </div>
                        ))}
                    </div>

                    {error && <p className="error-text">{error}</p>}
                    <button type="submit" className="greek-button primary">PRÊT AU COMBAT</button>
                </form>
            </div>
        </div>
    );
};

export default PlayerJoinPage;