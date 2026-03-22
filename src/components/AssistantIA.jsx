// src/components/AssistantIA.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaTimes, FaPaperPlane, FaUser, FaSpinner } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown'; 
import './AssistantIA.css';

// 🎲 LISTE DES QUESTIONS D'EXEMPLE
const exampleQuestions = [
  "C'est quand le gala ?",
  "Qui est la présidente ?",
  "Comment on adhère à l'asso ?",
  "Où se trouve votre local ?",
  "C'est quoi les prochains événements ?",
  "Il y a une soirée prévue jeudi ?",
  "Combien coûte la cotisation ?"
];

function AssistantIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  // État pour la question d'exemple qui tourne
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Salut ! Je suis **Pythia**, l'IA d'Hermès. Pose-moi une question sur l'asso ou le campus ! \n\n*Note : Pour m'aider à apprendre, nos échanges sont sauvegardés anonymement. Ne partage pas de mots de passe ou d'infos sensibles !*" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔄 ROTATION ALÉATOIRE DES QUESTIONS
  useEffect(() => {
    // Si le chat est ouvert, pas besoin de faire tourner le texte en arrière-plan
    if (isOpen) return;

    const intervalId = setInterval(() => {
      setCurrentExampleIndex((prevIndex) => {
        let nextIndex;
        // Tire un nouveau numéro au hasard jusqu'à ce qu'il soit différent de l'actuel
        do {
          nextIndex = Math.floor(Math.random() * exampleQuestions.length);
        } while (nextIndex === prevIndex);
        return nextIndex;
      });
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(intervalId); // Nettoyage quand le composant est détruit
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input.trim();
    
    const historyForAI = messages
      .slice(1)
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text
      }));
    
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat_ai', {
        body: { question: userQuestion, history: historyForAI, session_id: sessionId }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data && data.reponse) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reponse }]);
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Oups, j'ai eu un petit bug technique avec mes visions oracle !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="pythia-trigger-wrapper">
          <div className="pythia-tooltip">
            <strong>Une question ?</strong><br/>
            {/* Affichage de la question dynamique */}
            Ex: <em style={{ transition: 'opacity 0.3s ease-in-out' }}>{exampleQuestions[currentExampleIndex]}</em>
          </div>
          <button className="ai-trigger-btn" onClick={() => setIsOpen(true)}>
            <img src="/Pythia.png" alt="Pythia AI" className="pythia-logo-trigger" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="ai-chat-window-large ai-widget-container">
          <div className="ai-chat-header">
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/Pythia.png" alt="Pythia" className="pythia-logo-header" />
              <strong style={{fontSize: '1.2rem'}}>Pythia</strong>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="ai-chat-messages-large">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? (
                    <img src="/Pythia.png" alt="Pythia" className="pythia-logo-msg" />
                  ) : (
                    <FaUser color="#555" size={20} />
                  )}
                </div>
                <div className={`message-content ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body">
                      <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-row assistant">
                <div className="message-avatar">
                  <img src="/Pythia.png" alt="Pythia" className="pythia-logo-msg" style={{ opacity: 0.7 }} />
                </div>
                <div className="message-content assistant typing">
                  <FaSpinner className="spin" /> Pythia consulte l'oracle...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-footer">
            <form onSubmit={handleSend} className="ai-chat-input-large">
              <textarea 
                rows="2"
                placeholder="Pose ta question à Pythia..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()}>
                <FaPaperPlane size={18} />
              </button>
            </form>
            <p className="ai-disclaimer">
              Pythia est une IA et peut faire des erreurs, y compris sur des personnes de l'association. En écrivant, vous acceptez l'enregistrement anonyme du chat.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AssistantIA;