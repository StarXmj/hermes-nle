import React, { useEffect, useState } from 'react';
import { FaTimes, FaScroll, FaGamepad, FaGift, FaHandshake, FaExternalLinkAlt, FaCalculator } from 'react-icons/fa';
import './ExtensionPanel.css';

const ExtensionPanel = ({ isActive, onClose, version }) => {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        fetch('/version.json')
            .then(res => res.json())
            .then(data => setInfo(data))
            .catch(err => console.error("Erreur chargement infos", err));
    }, []);

    return (
        <div className={`extension-view-container ${isActive ? 'active' : ''}`}>
            
            <div className="nav-arrow-btn nav-left" onClick={onClose}>❮</div>

            <div className="ext-content-wrapper">
                <div className="ext-header-sticky">
                    <h2>ARCHIVES D'HERMÈS <span className="version-tag">v{version}</span></h2>
                    <FaTimes className="close-icon-mobile" onClick={onClose} />
                </div>

                <div className="ext-scroll-area">
                    
                    {/* --- 1. MISE À JOUR --- */}
                    <section className="ext-section">
                        <div className="sec-title"><FaScroll/> MISE À JOUR : {info?.name}</div>
                        <p className="update-date">Déployée le {info?.date}</p>
                        <ul className="patch-list">
                            {info?.patchNotes?.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    </section>

                    {/* --- 2. TUTO --- */}
                    <section className="ext-section">
                        <div className="sec-title"><FaGamepad/> GUIDE DU HÉROS</div>
                        <div className="tuto-grid">
                            <div className="tuto-box">
                                <h4>🕹️ CONTRÔLES</h4>
                                {info?.tutorial?.controls.map((t, i) => <p key={i}>{t}</p>)}
                            </div>
                            <div className="tuto-box">
                                <h4><FaCalculator/> CALCUL DU SCORE</h4>
                                <ul className="math-list">
                                    {info?.tutorial?.scoring.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* --- 3. RÉCOMPENSES (TOP 3) --- */}
                    <section className="ext-section">
                        <div className="sec-title"><FaGift/> RÉCOMPENSES DE SAISON</div>
                        <p className="season-end-alert">⚠️ {info?.rewards?.seasonEnd}</p>
                        
                        <div className="rewards-list">
                            {info?.rewards?.tiers?.map((reward, i) => (
                                <div key={i} className={`reward-card rank-${reward.rank}`}>
                                    <div className="reward-rank-badge">#{reward.rank}</div>
                                    <div className="reward-content">
                                        <h3>{reward.emoji} {reward.title}</h3>
                                        <p>{reward.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- 4. PARTENAIRES --- */}
                    <section className="ext-section">
                        <div className="sec-title"><FaHandshake/> NOS PARTENAIRES</div>
                        <div className="partner-grid">
                            {info?.partners?.map((p, i) => (
                                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="partner-btn">
                                    {p.name} <FaExternalLinkAlt size={12}/>
                                </a>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default ExtensionPanel;