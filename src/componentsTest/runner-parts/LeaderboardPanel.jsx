import React, { useState, useMemo } from 'react';
import { FaCrown, FaHourglassHalf, FaInfoCircle } from 'react-icons/fa';
import './LeaderboardPanel.css';

const LeaderboardPanel = ({ leaderboardAllTime, leaderboardMonthly, timeLeft, player }) => {
    const [tab, setTab] = useState('season');
    const [showLegend, setShowLegend] = useState(false);

    // ✅ NOM DU MOIS ACTUEL (ex: "JANVIER")
    const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' }).toUpperCase();

    // 1. CHOIX DE LA LISTE
    const currentList = tab === 'season' ? leaderboardMonthly : leaderboardAllTime;

    // 2. CALCUL DES BADGES
    const { bestPhenixId, bestTitanId, bestVirtuoseId } = useMemo(() => {
        if (!currentList || currentList.length === 0) return {};
        let eligible = currentList.filter(p => p.total_games >= 20);
        if (eligible.length === 0) eligible = currentList;

        let phenix = null, titan = null, virtuose = null;
        if (eligible.length > 0) {
            const maxSlope = Math.max(...eligible.map(p => p.progression_slope || -999));
            if (maxSlope > 0) phenix = eligible.find(p => p.progression_slope === maxSlope);
            const maxMean = Math.max(...eligible.map(p => p.mean_score || 0));
            if (maxMean > 0) titan = eligible.find(p => p.mean_score === maxMean);
            const maxMedian = Math.max(...eligible.map(p => p.median_score || 0));
            if (maxMedian > 0) virtuose = eligible.find(p => p.median_score === maxMedian);
        }
        return {
            bestPhenixId: phenix ? (phenix.id || phenix.pseudo) : null,
            bestTitanId: titan ? (titan.id || titan.pseudo) : null,
            bestVirtuoseId: virtuose ? (virtuose.id || virtuose.pseudo) : null
        };
    }, [currentList]);

    return (
        <div className="menu-right">
            {/* EN-TÊTE */}
            <div className="lb-header">
                {tab === 'season' ? (
                    <><FaHourglassHalf style={{color: '#DAA520'}}/> <span style={{color: '#DAA520'}}>{currentMonthName} • {timeLeft}</span></>
                ) : (
                    <><FaCrown style={{color: '#E056FD'}}/> <span style={{color: '#E056FD', textShadow: '0 0 10px rgba(224, 86, 253, 0.4)'}}>HALL OF FAME</span></>
                )}
            </div>
            
            {/* ONGLETS */}
            <div className="lb-tabs">
                <button className={tab==='season'?'active':''} onClick={()=>setTab('season')}>
                    {currentMonthName}
                </button>
                <button className={tab==='alltime'?'active':''} onClick={()=>setTab('alltime')}>
                    LÉGENDE
                </button>
            </div>
            
            {/* LISTE DES JOUEURS */}
            <ul className="lb-list">
                {currentList && currentList.length > 0 ? currentList.map((l, i) => {
                    const playerId = l.id || l.pseudo;
                    const isMe = player && player.pseudo === l.pseudo;
                    const scoreValue = l.best_score ?? l.score ?? 0;
                    
                    // Badges
                    const badges = [];
                    if (playerId === bestPhenixId) badges.push({ icon: "🔥", title: "LE PHÉNIX" });
                    if (playerId === bestTitanId) badges.push({ icon: "🗿", title: "LE TITAN" });
                    if (playerId === bestVirtuoseId) badges.push({ icon: "🎻", title: "LE VIRTUOSE" });

                    // ✅ CLASSE POUR LE PODIUM (1, 2, 3)
                    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

                    return (
                        <li key={i} className={`${isMe ? 'me' : ''} ${rankClass}`}>
                            <div className="rank-col">
                                {i === 0 ? <span className="medal gold">🥇</span> : 
                                 i === 1 ? <span className="medal silver">🥈</span> : 
                                 i === 2 ? <span className="medal bronze">🥉</span> : 
                                 <span className="rank">#{i+1}</span>}
                            </div>
                            
                            <div className="name-col">
                                {l.pseudo || 'Anonyme'}
                                <div className="badges-row">
                                    {badges.map((b, idx) => (
                                        <span key={idx} title={b.title} className="badge-icon">{b.icon}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="score-col">
                                {scoreValue.toLocaleString('fr-FR')}
                            </div>
                        </li>
                    );
                }) : (
                    <li className="empty">Chargement...</li>
                )}
            </ul>

            {/* LÉGENDE */}
            <div className="legend-trigger" onClick={() => setShowLegend(!showLegend)}>
                <span><FaInfoCircle/> Trophées Uniques (+20 parties)</span>
                <span>{showLegend ? '▼' : '▶'}</span>
            </div>

            {showLegend && (
                <div className="legend-panel">
                    <div className="legend-title">👑 TITRES UNIQUES (Calculés sur 20+ parties)</div>
                    <div className="legend-item">
                        <span>🔥 <strong>LE PHÉNIX</strong></span>
                        <p>Celui qui progresse le plus vite. L'étoile montante du classement.</p>
                    </div>
                    <div className="legend-item">
                        <span>🗿 <strong>LE TITAN</strong></span>
                        <p>La machine de guerre. Il a la plus grosse moyenne de points.</p>
                    </div>
                    <div className="legend-item">
                        <span>🎻 <strong>LE VIRTUOSE</strong></span>
                        <p>La régularité parfaite. Sa médiane est imbattable.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPanel;