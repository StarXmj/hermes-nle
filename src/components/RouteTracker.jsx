// src/components/RouteTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Envoie un "pageview" à chaque changement de route
    // ReactGA gère intelligemment l'envoi uniquement si l'init a été fait
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null; // Ce composant est invisible
};

export default RouteTracker;