import React from 'react';
import PlayerAvatar from './PlayerAvatar';
import './HubStyles.css'; // À créer si besoin, ou utiliser du style inline

const LiveLeaderboard = ({ players }) => {
    return (
        <div className="live-leaderboard">
            <h3>CLASSEMENT EN DIRECT</h3>
            <ul className="leaderboard-list">
                {players.map((p, index) => (
                    <li key={p.id} className={`lb-item rank-${index + 1} ${!p.is_alive ? 'eliminated' : ''}`}>
                        <span className="lb-rank">#{index + 1}</span>
                        <PlayerAvatar avatarId={p.avatar_id} size="1.5rem" />
                        <span className="lb-name">{p.pseudo}</span>
                        <span className="lb-score">{p.score} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LiveLeaderboard;