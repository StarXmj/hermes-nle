// src/pages/AdminKnowledgePage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaBrain, FaSave, FaSpinner, FaCrosshairs, FaBookOpen, FaDatabase, FaSync, FaFilePdf, FaHistory, FaTrash, FaGraduationCap, FaUser, FaRobot } from 'react-icons/fa';

// --- IMPORT PDF.JS (VERSION 3) ---
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

import './AdminActionsPage.css'; 

function AdminKnowledgePage() {
  const [activeTab, setActiveTab] = useState('faq');

  const [faqData, setFaqData] = useState({ titre: '', contenu: '', categorie: 'faq', source_url: '' });
  const [corpusData, setCorpusData] = useState({ titre: '', contenu: '', categorie: 'corpus', source_url: '' });
  const [pdfFile, setPdfFile] = useState(null); 
  
  // Nouveaux états pour les Logs
  const [groupedLogs, setGroupedLogs] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [importProgress, setImportProgress] = useState(null);

  // ----------------------------------------------------
  // 📥 SOUMISSION FAQ (Enseigner une info précise)
  // ----------------------------------------------------
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('add_knowledge', {
        body: faqData
      });

      if (error) throw new Error("Erreur de communication avec le serveur.");
      if (data?.error) throw new Error(data.error);

      setMessage({ type: 'success', text: "L'IA a bien mémorisé cette information précise !" });
      setFaqData({ titre: '', contenu: '', categorie: 'faq', source_url: '' }); 
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 🧠 LECTURE PDF V3
  // ----------------------------------------------------
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const loadingTask = pdfjsLib.getDocument(typedarray);
          const pdf = await loadingTask.promise;
          let fullText = "";
          
          setImportProgress(`Lecture du PDF (${pdf.numPages} pages)...`);
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + " \n\n ";
          }
          
          resolve(fullText.replace(/\s+/g, ' ').trim());
        } catch (error) {
          console.error("🔥 CRASH PDF.js V3 :", error);
          reject(new Error(`Impossible de lire ce PDF même avec l'ancien moteur.`));
        }
      };
      
      reader.onerror = () => reject(new Error("Erreur locale de lecture du fichier."));
      reader.readAsArrayBuffer(file);
    });
  };

  // ✂️ CHUNKING
  const chunkTextWithOverlap = (text, titreBase) => {
    const CHUNK_SIZE = 1500; 
    const OVERLAP = 300;     
    const chunks = [];
    if (text.length === 0) return chunks;

    for (let i = 0; i < text.length; i += (CHUNK_SIZE - OVERLAP)) {
      const morceau = text.slice(i, i + CHUNK_SIZE);
      chunks.push({
        titre: `${titreBase} (Partie ${chunks.length + 1})`,
        contenu: morceau,
        categorie: corpusData.categorie,
        source_url: corpusData.source_url
      });
      if (i + CHUNK_SIZE >= text.length) break;
    }
    return chunks;
  };

  // ----------------------------------------------------
  // 🧽 SOUMISSION MODE CORPUS (PDF / Texte Brut)
  // ----------------------------------------------------
  const handleCorpusSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setImportProgress("Démarrage du traitement...");

    try {
      let chunksToProcess = [];

      if (pdfFile) {
        setImportProgress("Extraction du texte brut depuis le PDF...");
        const rawText = await extractTextFromPDF(pdfFile);
        if (rawText.length < 50) throw new Error("Le PDF semble vide ou illisible.");
        
        setImportProgress("Découpage intelligent du PDF (Chunking)...");
        chunksToProcess = chunkTextWithOverlap(rawText, corpusData.titre);
      } else {
        const rawParagraphs = corpusData.contenu.split(/\n\s*\n/);
        const paragraphesNettoyes = rawParagraphs.map(p => p.trim()).filter(p => p.length > 50);
        chunksToProcess = paragraphesNettoyes.map((p, index) => ({
           titre: `${corpusData.titre} (Partie ${index + 1}/${paragraphesNettoyes.length})`,
           contenu: p,
           categorie: corpusData.categorie,
           source_url: corpusData.source_url
        }));
      }

      if (chunksToProcess.length === 0) throw new Error("Aucun contenu valide trouvé.");

      let successCount = 0;
      for (let i = 0; i < chunksToProcess.length; i++) {
        setImportProgress(`Vectorisation de la partie ${i + 1} sur ${chunksToProcess.length}...`);
        const { error } = await supabase.functions.invoke('add_knowledge', { body: chunksToProcess[i] });
        if (!error) successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setMessage({ type: 'success', text: `Succès ! Le document a été découpé en ${successCount} morceaux vectorisés.` });
      setCorpusData({ titre: '', contenu: '', categorie: 'corpus', source_url: '' });
      setPdfFile(null); 
      document.getElementById('pdf-upload').value = ""; 

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
      setImportProgress(null);
    }
  };

  // ----------------------------------------------------
  // 🔄 SYNCHRONISATION EN MASSE
  // ----------------------------------------------------
  const handleSyncAnciennesDonnees = async () => { /* Reste identique */ };

  // ----------------------------------------------------
  // 🕵️‍♂️ GESTION DES LOGS DE CONVERSATION
  // ----------------------------------------------------
  const fetchLogs = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // On récupère les logs triés du plus vieux au plus récent (pour l'ordre de lecture du chat)
      const { data, error } = await supabase
        .from('chat_logs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // Grouper par Session ID
        const grouped = {};
        data.forEach(log => {
          if (!grouped[log.session_id]) grouped[log.session_id] = [];
          grouped[log.session_id].push(log);
        });

        // Convertir en tableau et trier pour que la session la plus RÉCENTE soit en haut
        const sortedSessions = Object.keys(grouped).map(sessionId => {
          const messages = grouped[sessionId];
          const latestDate = new Date(messages[messages.length - 1].created_at);
          return { sessionId, messages, latestDate };
        }).sort((a, b) => b.latestDate - a.latestDate);

        setGroupedLogs(sortedSessions);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Erreur lors de la récupération des logs." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Évite d'ouvrir l'accordéon si on clique sur supprimer
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation de l'historique ?")) return;
    
    try {
      const { error } = await supabase.from('chat_logs').delete().eq('session_id', sessionId);
      if (error) throw error;
      
      setGroupedLogs(prev => prev.filter(s => s.sessionId !== sessionId));
      if (expandedSessionId === sessionId) setExpandedSessionId(null);
      setMessage({ type: 'success', text: "Conversation supprimée." });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Erreur lors de la suppression." });
    }
  };

  // L'ACTION MAGIQUE : Prendre la question de l'utilisateur et basculer sur FAQ
  const handleTeachAI = (userQuestion) => {
    setFaqData({ titre: userQuestion, contenu: '', categorie: 'faq', source_url: '' });
    setActiveTab('faq');
    setMessage({ type: 'success', text: "Veuillez rédiger la bonne réponse à cette question pour que l'IA l'apprenne." });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const tabStyle = (isActive) => ({
    flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '8px',
    border: 'none', backgroundColor: isActive ? '#9333ea' : '#f3f4f6', color: isActive ? 'white' : '#4b5563',
    transition: 'all 0.3s ease'
  });

  return (
    <main className="page-section">
      <Helmet><title>Base de Connaissance IA | Admin</title></Helmet>

      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1><FaBrain style={{color: '#9333ea', marginRight: '10px'}} /> Cerveau de l'IA</h1>
        <p>Alimentez la base de données et surveillez les conversations.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button style={tabStyle(activeTab === 'faq')} onClick={() => { setActiveTab('faq'); setMessage(null); setImportProgress(null); }}>
          <FaCrosshairs /> Info Précise
        </button>
        <button style={tabStyle(activeTab === 'corpus')} onClick={() => { setActiveTab('corpus'); setMessage(null); setImportProgress(null); }}>
          <FaBookOpen /> Grand Corpus / PDF
        </button>
        <button style={tabStyle(activeTab === 'sync')} onClick={() => { setActiveTab('sync'); setMessage(null); setImportProgress(null); }}>
          <FaSync /> Synchro Auto
        </button>
        {/* NOUVEL ONGLET LOGS */}
        <button style={tabStyle(activeTab === 'logs')} onClick={() => { setActiveTab('logs'); setMessage(null); setImportProgress(null); fetchLogs(); }}>
          <FaHistory /> Historique & Apprentissage
        </button>
      </div>

      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
          {message.text}
        </div>
      )}

      {importProgress && (
        <div style={{ padding: '15px', marginBottom: '15px', background: '#f3f4f6', borderRadius: '8px', color: '#9333ea', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaSpinner className="spin" /> {importProgress}
        </div>
      )}

      {/* TABS EXISTANTS : FAQ, CORPUS, SYNC ... */}
      {activeTab === 'faq' && (
        <form onSubmit={handleFaqSubmit} className="admin-form">
           <div style={{ marginBottom: '15px', color: '#6b7280', fontSize: '0.9rem' }}>
            <em>Utilisez ce mode pour des questions fermées, des prix, des horaires ou des adresses exactes.</em>
          </div>

          <div className="form-group">
            <label>Question de l'étudiant / Titre de l'info *</label>
            <input type="text" required value={faqData.titre} onChange={e => setFaqData({...faqData, titre: e.target.value})} placeholder="Ex: Prix du Master ou C'est quand le gala ?" />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Catégorie</label>
              <select value={faqData.categorie} onChange={e => setFaqData({...faqData, categorie: e.target.value})}>
                <option value="faq">FAQ / Prix</option>
                <option value="orientation">Orientation / Plan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lien Source (Optionnel)</label>
              <input type="url" value={faqData.source_url} onChange={e => setFaqData({...faqData, source_url: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Réponse exacte de l'IA *</label>
            <textarea required rows="4" value={faqData.contenu} onChange={e => setFaqData({...faqData, contenu: e.target.value})} placeholder="Ex: L'inscription coûte 254€." />
          </div>

          <button type="submit" className="cta-button" disabled={loading} style={{ background: '#9333ea', width: '100%' }}>
            {loading ? <><FaSpinner className="spin" /> Apprentissage...</> : <><FaSave /> Enseigner l'Info</>}
          </button>
        </form>
      )}

      {activeTab === 'corpus' && (
        /* Code du Corpus inchangé */
        <form onSubmit={handleCorpusSubmit} className="admin-form">
          <div className="form-group">
            <label>Nom du Document (Ex: Guide des Formations UPPA 2026) *</label>
            <input type="text" required value={corpusData.titre} onChange={e => setCorpusData({...corpusData, titre: e.target.value})} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Catégorie</label>
              <select value={corpusData.categorie} onChange={e => setCorpusData({...corpusData, categorie: e.target.value})}>
                <option value="documents_pdf">Document PDF Universitaire</option>
                <option value="corpus">Histoire / Valeurs</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lien Public du PDF (Optionnel)</label>
              <input type="url" value={corpusData.source_url} onChange={e => setCorpusData({...corpusData, source_url: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ padding: '20px', border: '2px dashed #9333ea', borderRadius: '8px', textAlign: 'center', backgroundColor: '#faf5ff' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#9333ea', fontWeight: 'bold', cursor: 'pointer' }}>
              <FaFilePdf style={{ fontSize: '24px', verticalAlign: 'middle', marginRight: '10px' }} />
              Importer un fichier PDF
            </label>
            <input type="file" id="pdf-upload" accept=".pdf" onChange={(e) => { setPdfFile(e.target.files[0]); setCorpusData({...corpusData, contenu: ''}); }} />
            {pdfFile && <p style={{ color: '#166534', marginTop: '10px', fontWeight: 'bold' }}>📄 Fichier sélectionné : {pdfFile.name}</p>}
          </div>
          <p style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold', color: '#6b7280' }}>OU</p>
          <div className="form-group">
            <label>Contenu Brut (Si vous n'avez pas de PDF)</label>
            <textarea rows="6" value={corpusData.contenu} disabled={pdfFile !== null} onChange={e => setCorpusData({...corpusData, contenu: e.target.value})} placeholder="Collez l'intégralité du texte ici..." />
          </div>
          <button type="submit" className="cta-button" disabled={loading || (!pdfFile && corpusData.contenu.trim() === '')} style={{ background: '#28a745', width: '100%', marginTop: '15px' }}>
            {loading ? <><FaSpinner className="spin" /> Traitement en cours...</> : <><FaDatabase /> Analyser et Importer le document</>}
          </button>
        </form>
      )}

      {activeTab === 'sync' && (
        <div className="admin-form" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ marginBottom: '15px' }}>Rattrapage de l'historique</h2>
          <button onClick={handleSyncAnciennesDonnees} className="cta-button" disabled={loading} style={{ background: '#ef4444', width: '100%', maxWidth: '400px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            {loading ? <><FaSpinner className="spin" /> Synchronisation en cours...</> : <><FaSync /> FORCER LA SYNCHRONISATION</>}
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* NOUVEL ONGLET : LOGS & APPRENTISSAGE */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="admin-form" style={{ padding: '0' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <FaHistory color="#9333ea" /> Historique des Conversations
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' }}>
              Consultez ce que les étudiants demandent à l'IA. Si l'IA n'a pas su répondre, cliquez sur "Enseigner" pour lui apprendre la réponse.
            </p>
          </div>

          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}><FaSpinner className="spin" size={30} /></div>
          ) : groupedLogs.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Aucune conversation enregistrée pour le moment.</div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                {groupedLogs.map(session => (
                   <div key={session.sessionId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      
                      {/* En-tête de la session (Cliquable) */}
                      <div 
                        onClick={() => setExpandedSessionId(expandedSessionId === session.sessionId ? null : session.sessionId)}
                        style={{ 
                          padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', 
                          alignItems: 'center', backgroundColor: expandedSessionId === session.sessionId ? '#f9fafb' : 'white',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', color: '#111827' }}>Session ID: {session.sessionId.substring(0,8)}...</strong>
                          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            {session.latestDate.toLocaleString('fr-FR')} — {session.messages.length} interaction(s)
                          </span>
                        </div>
                        <button onClick={(e) => handleDeleteSession(session.sessionId, e)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                          <FaTrash size={16} />
                        </button>
                      </div>

                      {/* Corps de la conversation (Accordéon) */}
                      {expandedSessionId === session.sessionId && (
                         <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                            {session.messages.map((log, idx) => (
                               <div key={log.id} style={{ marginBottom: '25px' }}>
                                  
                                  {/* Bulle Utilisateur */}
                                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                     <div style={{ marginTop: '3px', color: '#4b5563' }}><FaUser /></div>
                                     <div style={{ flex: 1 }}>
                                        <div style={{ background: '#e5e7eb', padding: '10px 15px', borderRadius: '8px 8px 8px 0', display: 'inline-block', color: '#111827' }}>
                                           {log.user_message}
                                        </div>
                                        {/* BOUTON ENSEIGNER MAGIQUE */}
                                        <div style={{ marginTop: '5px' }}>
                                          <button 
                                            onClick={() => handleTeachAI(log.user_message)}
                                            style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                                          >
                                            <FaGraduationCap /> Enseigner la réponse à l'IA
                                          </button>
                                        </div>
                                     </div>
                                  </div>

                                  {/* Bulle IA */}
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                     <div style={{ marginTop: '3px', color: '#9333ea' }}><FaRobot /></div>
                                     <div style={{ flex: 1 }}>
                                        <div style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', padding: '10px 15px', borderRadius: '8px 8px 0 8px', display: 'inline-block', color: '#4c1d95', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                           {log.ai_response}
                                        </div>
                                        {/* Sources utilisées par l'IA */}
                                        {log.sources_used && log.sources_used.length > 0 && (
                                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                                            <em>Sources lues : {log.sources_used.join(', ')}</em>
                                          </div>
                                        )}
                                     </div>
                                  </div>

                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
        </div>
      )}

    </main>
  );
}

export default AdminKnowledgePage;