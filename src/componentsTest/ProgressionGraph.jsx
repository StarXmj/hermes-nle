import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressionGraph = ({ scores, bestScore, bestScoreDate }) => {

    // 1. CALCULS STATISTIQUES
    const stats = useMemo(() => {
        if (!scores || scores.length === 0) return null;

        // Préparation des données (Chronologique : Vieux -> Récent)
        const chronoScores = [...scores].reverse();
        const values = chronoScores.map(s => s.score);
        const dates = chronoScores.map(s => s.created_at);

        // A. MOYENNE & MÉDIANE
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = Math.floor(sum / values.length);

        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 
            ? sorted[mid] 
            : Math.floor((sorted[mid - 1] + sorted[mid]) / 2);

        // B. RÉGRESSION LINÉAIRE (Calcul de la pente "m")
        const n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;           // X = Numéro de la partie (0, 1, 2...)
            sumY += values[i];   // Y = Score
            sumXY += i * values[i];
            sumXX += i * i;
        }

        // La Pente (Slope) : Combien de points gagnés par partie en moyenne
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Ligne de tendance pour le graph
        const trendValues = values.map((_, i) => slope * i + intercept);
        
        // C. CLASSIFICATION DE L'ÉVOLUTION
        let trendLabel = "Stable";
        let trendColor = "#888"; // Gris
        
        // On arrondit pour l'affichage (ex: +12.5)
        const performanceVal = slope.toFixed(1);
        const sign = slope > 0 ? '+' : '';
        const trendDisplay = `${sign}${performanceVal} pts/jeu`;

        if (slope >= 10) {
            trendLabel = "🔥 Fulgurante";
            trendColor = "#FF4444"; // Rouge feu
        } else if (slope >= 2) {
            trendLabel = "🚀 Rapide";
            trendColor = "#DAA520"; // Or
        } else if (slope > 0.5) {
            trendLabel = "📈 Positive";
            trendColor = "#00FF00"; // Vert
        } else if (slope > -0.5) {
            trendLabel = "➡️ Stable";
            trendColor = "#AAA"; 
        } else {
            trendLabel = "📉 En Baisse";
            trendColor = "#FF8888"; // Rouge clair
        }

        return { mean, median, values, dates, trendValues, trendLabel, trendDisplay, trendColor };
    }, [scores]);

    if (!stats) return <div className="no-data">Aucune donnée récente.</div>;

    // 2. CONFIG CHART.JS
    const data = {
        labels: stats.dates,
        datasets: [
            {
                label: 'Score',
                data: stats.values,
                borderColor: '#DAA520',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(218, 165, 32, 0.5)');
                    gradient.addColorStop(1, 'rgba(218, 165, 32, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHitRadius: 15, // Zone de touche large pour mobile
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#FFF',
                pointHoverBorderColor: '#DAA520',
                borderWidth: 2,
            },
            {
                label: 'Tendance',
                data: stats.trendValues,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                tension: 0
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#888',
                bodyColor: '#DAA520',
                displayColors: false,
                callbacks: {
                    title: (c) => {
                        const d = new Date(c[0].label);
                        return !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit' }) : '';
                    },
                    label: (c) => c.dataset.label !== 'Tendance' ? `Score : ${c.raw}` : null
                }
            }
        },
        scales: {
            x: { display: false },
            y: { 
                display: true, position: 'right', 
                grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                ticks: { color: '#666', font: { size: 9 }, maxTicksLimit: 3 }
            }
        }
    };

    let dateRecord = 'Inconnue';
    if (bestScoreDate) {
        const d = new Date(bestScoreDate);
        if (!isNaN(d.getTime())) dateRecord = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return (
        <div className="progression-container">
            {/* GRILLE DE STATS */}
            <div className="stats-grid">
                <div className="stat-box">
                    <span className="label">MOYENNE</span>
                    <span className="value">{stats.mean.toLocaleString()}</span>
                </div>
                
                <div className="stat-box">
                    <span className="label">MÉDIANE</span>
                    <span className="value">{stats.median.toLocaleString()}</span>
                </div>
                
                <div className="stat-box highlight">
                    <span className="label">RECORD ({dateRecord})</span>
                    <span className="value gold">{bestScore ? bestScore.toLocaleString() : 0}</span>
                </div>
                
                {/* CASE TENDANCE : Avec classification et chiffre précis */}
                <div className="stat-box">
                    <span className="label">TENDANCE</span>
                    <span className="value" style={{color: stats.trendColor, fontSize: '0.9rem'}}>
                        {stats.trendLabel}
                    </span>
                    <span style={{fontSize: '0.65rem', color: '#666', marginTop:'2px'}}>
                        {stats.trendDisplay}
                    </span>
                </div>
            </div>

            <div className="graph-wrapper">
                <Line data={data} options={options} />
            </div>

            <div style={{textAlign:'center', fontSize:'0.7rem', color:'#666', marginTop:'5px'}}>
                Analyse sur vos {scores.length} dernières parties
            </div>
        </div>
    );
};

export default ProgressionGraph;