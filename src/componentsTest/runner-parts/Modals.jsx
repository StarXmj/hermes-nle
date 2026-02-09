import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaRedo, FaArrowLeft, FaCoins, FaPlus } from 'react-icons/fa';
import ProgressionGraph from '../ProgressionGraph'; 
import './Modals.css';

const Modals = ({ 
    gameStatus, score, player, coinsSession, // ✅ On récupère coinsSession ici
    showAuth, authMode, authError, loading,
    showProgression, history, 
    leaderboardAllTime, leaderboardMonthly,
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
            {/* --- GAMEOVER --- */}
            {gameStatus === 'gameover' && (
                <div className="gameover-overlay">
                    <div className="gameover-content">
                        <h1 className="title-death">ÉCHEC CRITIQUE</h1>
                        
                        <div className="result-box">
                            {/* SCORE */}
                            <div className="score-display">
                                <span className="lbl">DISTANCE</span>
                                <span className="val">{Math.floor(score)} m</span>
                            </div>

                            {/* 💰 SECTION ARGENT (Nouveau) */}
                            <div className="coins-summary-box">
                                {/* Gain de la partie */}
                                <div className="coin-row session-gain">
                                    <span className="label">Butin :</span>
                                    <div className="value gain">
                                        <FaPlus size={10} style={{marginRight:4}}/> 
                                        {coinsSession || 0} <FaCoins style={{marginLeft:4}}/>
                                    </div>
                                </div>

                                <hr className="divider"/>

                                {/* Total Portefeuille */}
                                {player ? (
                                    <div className="coin-row total-wallet">
                                        <span className="label">Trésor Total :</span>
                                        <div className="value total">
                                            {player.coins || 0} <FaCoins style={{color:'#FFD700', marginLeft:4}}/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="guest-message">Connectez-vous pour épargner !</div>
                                )}
                            </div>

                            {/* Meilleur Score */}
                            {player && (
                                <div className="best-display" style={{marginTop:'10px', fontSize:'0.8rem', color:'#aaa'}}>
                                    Record personnel : {player.best_score ? player.best_score.toLocaleString() : 0}
                                </div>
                            )}
                        </div>

                        {/* ACTIONS */}
                        <div className="go-actions">
                            <button className="greek-btn-primary pulse" onClick={onRestart}>
                                <FaRedo style={{marginRight:5}}/> REJOUER
                            </button>
                            
                            {!player && (
                                <button className="greek-btn-secondary" onClick={onOpenAuth}>
                                    SAUVEGARDER CE SCORE
                                </button>
                            )}
                            
                            <button className="greek-btn-text" onClick={onMenu}>
                                <FaArrowLeft style={{marginRight:5}}/> MENU
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- AUTHENTIFICATION --- */}
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

            {/* --- PROGRESSION --- */}
            {showProgression && (
                <div className="auth-modal-overlay" onClick={onCloseProgression}>
                    <div className="auth-modal wide" onClick={e => e.stopPropagation()}>
                        <FaTimes className="close-btn" onClick={onCloseProgression} />
                        <h2 style={{color: '#DAA520', marginBottom: 10}}>MON ÉVOLUTION</h2>
                        
                        <ProgressionGraph 
                            scores={history} 
                            playerBestScore={player?.best_score} 
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