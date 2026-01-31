import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaRedo, FaArrowLeft } from 'react-icons/fa';
import ProgressionGraph from '../ProgressionGraph'; 
import './Modals.css';

const Modals = ({ 
    gameStatus, score, player, 
    showAuth, authMode, authError, loading,
    showProgression, history, 
    leaderboardAllTime, leaderboardMonthly, // ✅ On récupère les deux
    onCloseAuth, onCloseProgression, onSwitchAuth,
    onRestart, onMenu, onAuthSubmit, onOpenAuth
}) => {
    const [email, setEmail] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAuthSubmit(email, pseudo, password);
    };

    return (
        <>
            {/* GAMEOVER */}
            {gameStatus === 'gameover' && (
                <div className="gameover-overlay">
                    <div className="gameover-content">
                        <h1 className="title-death">CHUTE D'ICARE</h1>
                        <div className="result-box">
                            <div className="score-display">
                                <span className="lbl">SCORE FINAL</span>
                                <span className="val">{Math.floor(score)}</span>
                            </div>
                            {player && (
                                <div className="best-display">
                                    Record personnel : {player.best_score ? player.best_score.toLocaleString() : 0}
                                </div>
                            )}
                        </div>
                        <div className="go-actions">
                            <button className="greek-btn-primary" onClick={onRestart}><FaRedo/> REJOUER</button>
                            {!player && (
                                <button className="greek-btn-secondary" onClick={onOpenAuth}>ENREGISTRER CE SCORE</button>
                            )}
                            <button className="greek-btn-text" onClick={onMenu}><FaArrowLeft/> MENU</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AUTH */}
            {showAuth && (
                <div className="auth-modal-overlay" onClick={onCloseAuth}>
                    <div className="auth-modal" onClick={e => e.stopPropagation()}>
                        <FaTimes className="close-btn" onClick={onCloseAuth} />
                        <h2>{authMode === 'login' ? 'CONNEXION' : 'NOUVELLE LÉGENDE'}</h2>
                        
                        {authError && <div className="auth-error-message">⚠️ {authError}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            {authMode === 'register' && (
                                <input type="text" placeholder="Pseudo" required value={pseudo} onChange={e => setPseudo(e.target.value)} />
                            )}
                            <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" required value={password} onChange={e => setPassword(e.target.value)} />
                                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash/> : <FaEye/>}</span>
                            </div>
                            
                            {/* Bouton désactivé si chargement */}
                            <button type="submit" className="greek-btn-primary full-width" disabled={loading}>
                                {loading ? '...' : (authMode === 'login' ? 'GO !' : 'VALIDER')}
                            </button>
                        </form>
                        
                        <p className="switch-auth" onClick={onSwitchAuth}>
                            {authMode === 'login' ? "Créer un compte" : "J'ai déjà un compte"}
                        </p>
                    </div>
                </div>
            )}

            {/* PROGRESSION */}
            {showProgression && (
                <div className="auth-modal-overlay" onClick={onCloseProgression}>
                    <div className="auth-modal wide" onClick={e => e.stopPropagation()}>
                        <FaTimes className="close-btn" onClick={onCloseProgression} />
                        <h2 style={{color: '#DAA520', marginBottom: 10}}>MON ÉVOLUTION</h2>
                        
                        {/* ✅ On passe tout au composant graphique */}
                        <ProgressionGraph 
                            scores={history} 
                            playerBestScore={player?.best_score} // Best score global du profil
                            leaderboardAllTime={leaderboardAllTime}
                            leaderboardMonthly={leaderboardMonthly}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Modals;