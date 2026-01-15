import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useHubSession = () => {
    const [session, setSession] = useState(null);
    const [players, setPlayers] = useState([]);
    const [opponents, setOpponents] = useState({}); 
    const [error, setError] = useState(null);
    
    const channelRef = useRef(null);

    // 1. HOST
    const createSession = async (hostId) => {
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        const { data, error } = await supabase
            .from('game_sessions')
            .insert([{ qr_code_str: code, status: 'WAITING', host_id: hostId }])
            .select()
            .single();
        if (error) { setError(error.message); return null; }
        setSession(data);
        return data;
    };

    // 2. PLAYER
    const joinSession = async (code, pseudo, avatarId) => {
        const { data: sessionData, error: sessionError } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('qr_code_str', code)
            .single();
        if (sessionError || !sessionData) { setError("Code session invalide"); return null; }

        const { data: playerData, error: joinError } = await supabase
            .from('session_players')
            .insert([{ session_id: sessionData.id, pseudo, avatar_id: avatarId }])
            .select()
            .single();
        if (joinError) { setError(joinError.message); return null; }
        
        setSession(sessionData);
        return { session: sessionData, player: playerData };
    };

    // 3. ÉCOUTE & BROADCAST
    const subscribeToSession = useCallback((targetSessionId, myPlayerId = null) => {
        if (!targetSessionId) return;
        if (channelRef.current && channelRef.current.topic === `realtime:room:${targetSessionId}`) return;
        if (channelRef.current) supabase.removeChannel(channelRef.current);

        console.log(`📡 Abonnement Room ${targetSessionId}`);

        const fetchInitialState = async () => {
            const { data } = await supabase.from('game_sessions').select('*').eq('id', targetSessionId).single();
            if (data) setSession(data);
            fetchPlayers(targetSessionId);
        };
        fetchInitialState();

        const channel = supabase.channel(`room:${targetSessionId}`, {
            config: { broadcast: { self: false } }
        })
        .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${targetSessionId}` }, 
            (payload) => setSession(prev => ({ ...prev, ...payload.new }))
        )
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${targetSessionId}` }, 
            () => fetchPlayers(targetSessionId)
        )
        // RÉCEPTION : On lit le champ 'isDead'
        .on('broadcast', { event: 'POS' }, ({ payload }) => {
            if (payload.id === myPlayerId) return;
            
            setOpponents(prev => ({
                ...prev,
                [payload.id]: {
                    y: payload.y,
                    isJumping: payload.isJumping,
                    isGravityInverted: payload.isGravityInverted,
                    avatar: payload.avatar,
                    pseudo: payload.pseudo,
                    isDead: payload.isDead, // <--- NOUVEAU CHAMP
                    lastUpdate: Date.now()
                }
            }));
        })
        .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    // 4. ENVOI : On ajoute isDead
    const broadcastPosition = (playerId, pseudo, avatar, y, isJumping, isGravityInverted, isDead = false) => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'POS',
                payload: { id: playerId, pseudo, avatar, y, isJumping, isGravityInverted, isDead }
            });
        }
    };

    const fetchPlayers = async (sid) => {
        const { data } = await supabase.from('session_players').select('*').eq('session_id', sid).order('score', { ascending: false });
        if (data) setPlayers(data);
    };

    const startSession = async (sid) => {
        setSession(prev => ({ ...prev, status: 'PLAYING' }));
        await supabase.from('game_sessions').update({ status: 'PLAYING' }).eq('id', sid);
    };

    const resetSession = async (sid) => {
        setSession(prev => ({ ...prev, status: 'WAITING' }));
        setOpponents({});
        await supabase.from('game_sessions').update({ status: 'WAITING' }).eq('id', sid);
        await supabase.from('session_players').update({ is_alive: true, score: 0 }).eq('session_id', sid);
        fetchPlayers(sid);
    };

    const updateScore = async (playerId, score, isAlive = true) => {
        await supabase.from('session_players').update({ score, is_alive: isAlive }).eq('id', playerId);
    };

    return { 
        session, players, opponents, error, 
        createSession, joinSession, subscribeToSession, 
        startSession, updateScore, resetSession, broadcastPosition 
    };
};