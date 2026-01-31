import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProgressionGraph = ({ scores, playerBestScore, leaderboardAllTime, leaderboardMonthly }) => {
    const [viewMode, setViewMode] = useState('season');

    // Nom du mois pour l'affichage
    const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' }).toUpperCase();

    // 1. FILTRAGE STRICT (> 300 pts)
    const filteredData = useMemo(() => {
        if (!scores || scores.length === 0) return { list: [], best: 0, dateBest: null };

        let validScores = scores.filter(s => s.score > 300);

        if (viewMode === 'season') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            validScores = validScores.filter(s => new Date(s.created_at) >= startOfMonth);
        }

        const chronoList = [...validScores].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        let periodBest = 0;
        let periodBestDate = null;
        
        if (chronoList.length > 0) {
            const maxObj = chronoList.reduce((prev, current) => (prev.score > current.score) ? prev : current);
            periodBest = maxObj.score;
            periodBestDate = maxObj.created_at;
        }

        return { list: chronoList, best: periodBest, dateBest: periodBestDate };
    }, [scores, viewMode]);

    // 2. STATS & TENDANCE
    const stats = useMemo(() => {
        const { list } = filteredData;
        if (list.length === 0) return null;

        const values = list.map(s => s.score);
        const dates = list.map(s => s.created_at);

        // Moyenne
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = Math.floor(sum / values.length);

        // Médiane
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.floor((sorted[mid - 1] + sorted[mid]) / 2);

        // Tendance (Pente)
        const n = values.length;
        let slope = 0;
        let trendValues = values;

        if (n > 1) {
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            for (let i = 0; i < n; i++) {
                sumX += i; sumY += values[i]; sumXY += i * values[i]; sumXX += i * i;
            }
            slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            trendValues = values.map((_, i) => slope * i + intercept);
        }
        
        // Labels & Couleurs
        let trendLabel = "Neutre";
        let trendColor = "#888";
        if (slope >= 10) { trendLabel = "🔥 Fulgurante"; trendColor = "#FF4444"; }
        else if (slope >= 2) { trendLabel = "🚀 Rapide"; trendColor = "#DAA520"; }
        else if (slope > 0.5) { trendLabel = "📈 Positive"; trendColor = "#00FF00"; }
        else if (slope > -0.5) { trendLabel = "➡️ Stable"; trendColor = "#AAA"; }
        else { trendLabel = "📉 En Baisse"; trendColor = "#FF8888"; }

        // ✅ L'AFFICHAGE DU CHIFFRE (+12.5 pts/jeu)
        const performanceVal = slope.toFixed(1);
        const trendDisplay = `${slope > 0 ? '+' : ''}${performanceVal} pts/jeu`;

        return { mean, median, values, dates, trendValues, trendLabel, trendDisplay, trendColor };
    }, [filteredData]);

    // 3. CLASSEMENT
    const rankingData = useMemo(() => {
        const { best } = filteredData;
        if (!best || best === 0) return null;
        const refLeaderboard = viewMode === 'season' ? leaderboardMonthly : leaderboardAllTime;
        if (!refLeaderboard || refLeaderboard.length === 0) return null;

        const allScores = refLeaderboard.map(p => p.best_score).sort((a, b) => b - a);
        const totalPlayers = allScores.length;
        const myRankIndex = allScores.findIndex(s => s <= best);
        const myRank = myRankIndex === -1 ? totalPlayers : myRankIndex + 1;
        const percentile = (myRank / totalPlayers) * 100;
        const betterThan = 100 - percentile;

        let title = "", sub = "", color = "";
        if (myRank === 1) { title = "👑 DIEU DE L'OLYMPE"; sub = "Numéro 1 absolu !"; color = "#E056FD"; }
        else if (percentile <= 1) { title = "🏛️ LÉGENDE VIVANTE (Top 1%)"; sub = "Domination totale."; color = "#FFD700"; }
        else if (percentile <= 10) { title = "⚔️ HÉROS D'ÉLITE (Top 10%)"; sub = "L'Olympe est proche."; color = "#00FFFF"; }
        else if (percentile <= 30) { title = "🦁 GUERRIER REDOUTABLE"; sub = `Mieux que ${Math.floor(betterThan)}% des joueurs !`; color = "#00FF00"; }
        else if (percentile <= 60) { title = "🦅 ATHLÈTE PROMETTEUR"; sub = `Top 60% atteint.`; color = "#DAA520"; }
        else { title = "🔥 ESPOIR EN DEVENIR"; sub = "Chaque score compte."; color = "#AAA"; }

        return { title, sub, color };
    }, [filteredData, viewMode, leaderboardAllTime, leaderboardMonthly]);

    // Styles
    const tabStyle = (mode) => ({
        flex: 1, padding: '8px',
        background: viewMode === mode ? '#333' : 'transparent',
        border: `1px solid ${viewMode === mode ? '#DAA520' : '#444'}`,
        color: viewMode === mode ? '#DAA520' : '#888',
        cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
        transition: 'all 0.2s', borderRadius: '4px'
    });

    if (!stats) return (
        <div className="progression-container">
             <div className="tab-container">
                <button style={tabStyle('season')} onClick={() => setViewMode('season')}>{currentMonthName}</button>
                <button style={tabStyle('alltime')} onClick={() => setViewMode('alltime')}>LÉGENDE</button>
            </div>
            <div className="no-data">Aucune partie validée (&gt;300 pts).</div>
        </div>
    );

    const options = { 
        responsive: true, maintainAspectRatio: false, 
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: 'rgba(0,0,0,0.9)', titleColor: '#888', bodyColor: '#DAA520', displayColors: false, callbacks: { title: (c) => new Date(c[0].label).toLocaleDateString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}), label: (c) => c.dataset.label !== 'Tendance' ? `Score : ${c.raw}` : null } } },
        scales: { x: { display: false }, y: { display: true, position: 'right', grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color:'#666', font:{size:9}, maxTicksLimit: 3 } } },
        elements: { point: { radius: 0, hitRadius: 20, hoverRadius: 6 } }
    };

    const data = {
        labels: stats.dates,
        datasets: [
            { label: 'Score', data: stats.values, borderColor: '#DAA520', backgroundColor: (ctx) => { const g = ctx.chart.ctx.createLinearGradient(0,0,0,200); g.addColorStop(0,'rgba(218,165,32,0.5)'); g.addColorStop(1,'rgba(218,165,32,0.0)'); return g; }, fill: true, tension: 0.3, borderWidth: 2 },
            { label: 'Tendance', data: stats.trendValues, borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderDash: [5, 5] }
        ],
    };

    let dateRecordStr = filteredData.dateBest ? new Date(filteredData.dateBest).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : '-';

    return (
        <div className="progression-container">
            <div className="tab-container">
                <button className={`tab-btn ${viewMode==='season'?'active':''}`} onClick={() => setViewMode('season')}>{currentMonthName}</button>
                <button className={`tab-btn ${viewMode==='alltime'?'active':''}`} onClick={() => setViewMode('alltime')}>LÉGENDE</button>
            </div>

            {rankingData && (
                <div className="ranking-card" style={{ borderColor: rankingData.color, boxShadow: `0 0 10px ${rankingData.color}15` }}>
                    <div className="ranking-title" style={{ color: rankingData.color }}>{rankingData.title}</div>
                    <div className="ranking-sub">{rankingData.sub}</div>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-box"><span className="label">MOYENNE</span><span className="value">{stats.mean.toLocaleString()}</span></div>
                <div className="stat-box"><span className="label">MÉDIANE</span><span className="value">{stats.median.toLocaleString()}</span></div>
                <div className="stat-box highlight"><span className="label">RECORD ({dateRecordStr})</span><span className="value gold">{filteredData.best.toLocaleString()}</span></div>
                <div className="stat-box">
                    <span className="label">TENDANCE</span>
                    <span className="value" style={{color: stats.trendColor, fontSize: '0.85rem'}}>{stats.trendLabel}</span>
                    {/* ✅ ICI LE CHIFFRE AJOUTÉ */}
                    <span style={{fontSize: '0.6rem', color: '#666', marginTop:'2px'}}>{stats.trendDisplay}</span>
                </div>
            </div>

            <div className="graph-wrapper"><Line data={data} options={options} /></div>
            
            <div style={{textAlign:'center', fontSize:'0.7rem', color:'#666', marginTop:'5px', fontStyle:'italic'}}>
                {viewMode === 'season' 
                    ? <>{currentMonthName} : <strong>{filteredData.list.length}</strong> parties validées</>
                    : <>Historique global : <strong>{filteredData.list.length}</strong> parties validées</>
                }
            </div>
        </div>
    );
};

export default ProgressionGraph;