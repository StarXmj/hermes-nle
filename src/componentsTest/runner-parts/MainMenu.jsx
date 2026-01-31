import React from 'react';
import { FaChartLine, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './MainMenu.css';

const MainMenu = ({ player, onlinePlayers, version, onStart, onLogout, onLoadHistory, onOpenAuth }) => {
    return (
        <div className="menu-left">
            <h1 className="menu-title">HERMES<br/>QUEST</h1>
            
            <div className="menu-buttons">
                {player ? (
                    <>
                        {/* ✅ CORRECTION COULEUR NOM JOUEUR */}
                        <div className="player-info" style={{color: '#ccc', marginBottom: '10px', fontSize: '1.1rem'}}>
                            Héros : <strong style={{color:'#DAA520', fontSize:'1.2rem'}}>{player.pseudo}</strong>
                        </div>
                        
                        <button className="greek-btn-primary" onClick={onStart}>JOUER</button>
                        <button className="greek-btn-secondary" onClick={onLoadHistory}>
                            <FaChartLine style={{marginRight:8}}/> PROGRESSION
                        </button>
                        <button className="greek-btn-text" onClick={onLogout}>
                            <FaSignOutAlt style={{marginRight:5}}/> Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <button className="greek-btn-primary" onClick={onStart}>JOUER (INVITÉ)</button>
                        <button className="greek-btn-secondary" onClick={onOpenAuth}>SAUVEGARDER MA PARTIE</button>
                    </>
                )}
                
                {/* Compteur Live */}
                <div className="online-counter">
                    <div className="pulsing-dot"></div>
                    <span style={{fontWeight:'bold', color:'#fff'}}>{onlinePlayers}</span> HÉROS EN LIGNE
                </div>

                {/* ✅ VERSION MARQUÉE */}
                <div style={{marginTop: 'auto', display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center'}}>
                    <p style={{fontSize:'0.75rem', color:'#555', margin:0}}>v{version}</p>
                    <Link to="/" className="greek-btn-text" style={{fontSize:'0.8rem'}}>
                        <FaHome style={{marginRight:5}}/> Quitter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;