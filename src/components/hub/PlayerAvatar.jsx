import React from 'react';
import { FaUserAstronaut, FaGhost, FaRobot, FaCat } from 'react-icons/fa';

const PlayerAvatar = ({ avatarId, size = '2rem' }) => {
    const getIcon = () => {
        switch(avatarId) {
            case 'cat': return <FaCat />;
            case 'ghost': return <FaGhost />;
            case 'robot': return <FaRobot />;
            default: return <FaUserAstronaut />;
        }
    };

    return (
        <div className="player-avatar" style={{ fontSize: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon()}
        </div>
    );
};

export default PlayerAvatar;