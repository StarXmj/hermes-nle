import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

const VersionControl = ({ currentVersion }) => {
    useEffect(() => {
        if (!currentVersion || currentVersion === "...") return;

        // 1. Fonction pour tout nettoyer et recharger
        const forceUpdate = (serverVersion) => {
            console.log(`🚀 MISE À JOUR FORCÉE : ${currentVersion} -> ${serverVersion}`);
            
            // A. Tuer le Service Worker (PWA) qui retient l'ancien site
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                        registration.unregister();
                    }
                });
            }

            // B. Vider le cache local
            localStorage.clear(); // Attention: sauvegarde le token user avant si besoin, ou cible juste la version
            
            // C. Vider le cache de l'application
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach(name => caches.delete(name));
                });
            }

            // D. Recharger en forçant le serveur (Bypass cache)
            window.location.reload(true);
        };

        // 2. Vérification Initiale (Au chargement de la page)
        const checkInitialVersion = async () => {
            const { data } = await supabase
                .from('game_config')
                .select('value')
                .eq('key', 'version')
                .single();

            if (data && data.value !== currentVersion) {
                forceUpdate(data.value);
            }
        };

        checkInitialVersion();

        // 3. Écoute Temps Réel (Le "Kill Switch")
        const channel = supabase
            .channel('version_broadcast')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'game_config', filter: 'key=eq.version' },
                (payload) => {
                    const newVersion = payload.new.value;
                    if (newVersion !== currentVersion) {
                        forceUpdate(newVersion);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentVersion]);

    return null; // Invisible
};

export default VersionControl;