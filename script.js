// script.js (Versione 5.4 - Finale e Corretta)
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const API_BASE_URL = '';
    let philosophyOptions = {};

    // RENDER PRINCIPALI
    function renderApp(status) {
        app.innerHTML = `
            <header><img src="https://i.imgur.com/zYf2oMh.png" alt="Nanabot Logo" class="avatar"><h1>Addestramento di <span id="bot-name">${status.name}</span></h1></header>
            <div class="progress-card">
                <div class="progress-bar-container"><div id="progress-bar" class="progress-bar" style="width: ${status.progress}%"></div></div>
                <p id="progress-label">Progresso Addestramento: <span class="math-inline">\{status\.progress\}%</p\>
</div\>
<div id\="mission\-area"\></div\>
<div class\="badges\-area"\><h3\>🏆 Badge Sbloccati</h3\><ul id\="badge\-list"\></span>{status.badges.length ? status.badges.map(b => `<li>${b}</li>`).join('') : '<li>Nessun badge ancora.</li>'}</ul></div>`;
    }
    
    function renderCurrentMission(status) {
        const missionArea = document.getElementById('mission-area');
        if (!missionArea) return;

        if (status.progress === 0 && status.badges.length === 0) {
            renderIntroScreen(missionArea, status);
        } else if (status.progress < 25) {
            renderMission1_Explanation(missionArea, status);
        } else if (status.progress < 50) {
            renderMission2_Explanation(missionArea, status);
        } else if (status.progress < 75) {
            renderMission3_Explanation(missionArea, status);
        } else if (status.progress < 100) {
            if (Object.keys(status.philosophy).length === 0) {
                renderMission4_Explanation(missionArea, status);
            } else {
                const nextTheme = status.themes_todo[0];
                if (nextTheme) {
                    renderPhilosophyMission(missionArea, nextTheme, status);
                }
            }
        } else {
            renderCompletionScreen(missionArea, status);
        }
    }

    function renderCompletionState(container, message) {
        container.innerHTML = `<div class="mission-card completion-card"><p class="completion-message">✅ ${message}</p><button id="next-mission-btn">Prossima Missione &rarr;</button></div>`;
        document.getElementById('next-mission-btn').addEventListener('click', fetchStatus);
    }

    // RENDER DELLE MISSIONI
    function renderIntroScreen(container, status) {
        container.innerHTML = `<div class="mission-card intro-card"><h2>Benvenuto, Master Trainer!</h2><p>Stai per iniziare l'addestramento di <strong>Nanabot</strong>. Attraverso 4 missioni, gli insegnerai a pensare e rispondere con il tuo stile unico.</p><button id="start-btn">Inizia l'Addestramento</button></div>`;
        document.getElementById('start-btn').addEventListener('click', () => renderMission1_Explanation(container, status));
    }

    function renderMission1_Explanation(container, status) {
        container.innerHTML = `<div class="mission-card"><h2>Missione 1: La Biblioteca della Verità</h2><p>I tuoi pazienti, tra una visita e l'altra, potrebbero fare a Nanabot domande generali di nutrizione, come 'A cosa servono le fibre?' o 'Qual è la differenza tra grassi saturi e insaturi?'.<br><br>Per evitare che Nanabot dia risposte generiche prese da internet o, peggio, consigli errati, dobbiamo costruire insieme la sua 'biblioteca' di base.</p><button id="start-mission-btn">Ho Capito, Inizia</button></div>`;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission1_Action(container, status));
    }
    function renderMission1_Action(container, status) {
        const SOURCES = ["Linee Guida CREA", "Istituto Superiore di Sanità (ISS)", "World Health Organization (WHO)", "EFSA"];
        const sourcesHtml = SOURCES.map((s, i) => `<li class="check-item"><input type="checkbox" id="source-<span class="math-inline">\{i\}" value\="</span>{s}" name="source"><label for="source-<span class="math-inline">\{i\}"\></span>{s}</label></li>`).join('');
        const exclusiveOptionHtml = `<li class="check-item"><input type="checkbox" id="source-none" name="source_exclusive"><label for="source-none" class="exclusive-option">Nessuna, Nanabot si deve basare solo sui miei contenuti</label></li>`;
        
        container.innerHTML = `<div class="mission-card"><h2>Missione 1: La Biblioteca della Verità</h2><p><strong>Seleziona le fonti che ritieni affidabili e che vuoi includere nella base di conoscenza di Nanabot:</strong></p><ul class="item-list"><span class="math-inline">\{sourcesHtml\}<hr\></span>{exclusiveOptionHtml}</ul><button id="confirm-btn" disabled>Conferma Fonti</button></div>`;
        
        const btn = document.getElementById('confirm-btn');
        const standardCheckboxes = container.querySelectorAll('input[name="source"]');
        const exclusiveCheckbox = container.querySelector('input[name="source_exclusive"]');
    
        const updateState = () => {
            const anyStandardChecked = [...standardCheckboxes].some(c => c.checked);
            const exclusiveChecked = exclusiveCheckbox.checked;
    
            standardCheckboxes.forEach(cb => cb.disabled = exclusiveChecked);
            exclusiveCheckbox.disabled = anyStandardChecked;
            btn.disabled = !anyStandardChecked && !exclusiveChecked;
        };
    
        standardCheckboxes.forEach(cb => cb.addEventListener('change', updateState));
        exclusiveCheckbox.addEventListener('change', updateState);
    
        btn.addEventListener('click', async e => {
            e.target.disabled = true;
            let selectedSources = [];
            if (!exclusiveCheckbox.checked) {
                selectedSources = [...standardCheckboxes].filter(c => c.checked).map(c => c.value);
            }
            await completeMission(1, { sources: selectedSources });
        });
    }

    function renderMission2_Explanation(container, status) {
        container.innerHTML = `<div class="mission-card"><h2>Missione 2: Il Protocollo di Sicurezza</h2><p>La sicurezza del paziente è la priorità assoluta. In questa missione, non insegniamo a Nanabot cosa rispondere, ma <b>quando è il momento di fare un passo indietro e chiamare te</b>.<br><br>Trasformeremo Nanabot in una sentinella intelligente che vigila sulle conversazioni, pronta a segnalarti subito le situazioni che richiedono la tua esperienza.<br><br>Lo faremo in due passaggi:<br>1. <b>Parole Chiave di Allerta</b>: Per intercettare termini delicati.<br>2. <b>Controlli di Coerenza</b>: Per evitare consigli contraddittori.</p><button id="start-mission-btn">Ho Capito, Configura i Trigger</button></div>`;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission2_Keywords(container, status));
    }

    function renderMission2_Keywords(container, status) {
        const allKeywords = { "Condizioni Mediche": ["diabete", "ipertensione", "colesterolo", "reflusso", "gastrite", "tiroide"], "Stati Fisiologici": ["gravidanza", "allattamento", "menopausa"], "Farmaci/Integratori": ["farmaco", "antibiotico", "cortisone", "pillola"], "Sintomi Preoccupanti": ["dolore", "nausea", "allergia", "intolleranza"] };
        let selectedKeywords = new Set(status.config.security.keywords);

        container.innerHTML = `<div class="mission-card"><h2>Missione 2: Il Protocollo di Sicurezza</h2><h4 class="step-title">Passo 1 di 2: Imposta le Parole Chiave di Allerta</h4><p>Queste parole sono dei "sensori". Ogni volta che un paziente ne userà una, Nanabot ti invierà una notifica immediata, permettendoti di intervenire.<br><b>Esempio:</b> se imposti "gravidanza", una domanda come "posso usare la stevia in gravidanza?" arriverà subito a te.<br><br><i>Seleziona le parole dall'elenco, oppure digitala una nuova e premi Invio per aggiungerla.</i></p><div class="smart-selector-container"><div id="selector-input-area" class="selector-input-area"></div><div id="selector-dropdown" class="selector-dropdown hidden"></div></div><div class="mission-footer"><button id="next-step-btn">Prosegui &rarr;</button></div></div>`;
        
        const inputArea = document.getElementById('selector-input-area');
        const dropdown = document.getElementById('selector-dropdown');

        const renderSelected = () => {
            const tagsHtml = [...selectedKeywords].map(kw => `<span class="tag"><span class="math-inline">\{kw\}<span class\="close" data\-kw\="</span>{kw}">&times;</span></span>`).join('');
            const inputHtml = `<input type="text" id="keyword-search-input" placeholder="${selectedKeywords.size > 0 ? '' : 'Cerca, seleziona o digita una nuova parola e premi Invio'}">`;
            inputArea.innerHTML = tagsHtml + inputHtml;
            document.getElementById('keyword-search-input').focus();
            addInputListeners();
        };

        const renderDropdown = (filter = '') => {
            let itemsHtml = ''; let hasResults = false;
            for (const [category, words] of Object.entries(allKeywords)) {
                const filteredWords = words.filter(w => !selectedKeywords.has(w) && w.toLowerCase().includes(filter.toLowerCase()));
                if (filteredWords.length > 0) {
                    hasResults = true; itemsHtml += `<div class="dropdown-category">${category}</div>`;
                    itemsHtml += filteredWords.map(w => `<div class="dropdown-item" data-kw="<span class="math-inline">\{w\}"\></span>{w}</div>`).join('');
                }
            }
            dropdown.innerHTML = hasResults ? itemsHtml : '<div class="dropdown-item no-results">Nessun risultato</div>';
            dropdown.classList.remove('hidden');
            dropdown.querySelectorAll('.dropdown-item:not(.no-results)').forEach(item => item.addEventListener('click', (e) => selectKeyword(e.target.dataset.kw)));
        };
        
        const selectKeyword = (kw) => { selectedKeywords.add(kw); renderSelected(); renderDropdown(); };
        const deselectKeyword = (kw) => { selectedKeywords.delete(kw); renderSelected(); renderDropdown(document.getElementById('keyword-search-input').value); };

        function addInputListeners() {
            const currentInput = document.getElementById('keyword-search-input');
            currentInput.addEventListener('input', () => renderDropdown(currentInput.value));
            currentInput.addEventListener('focus', () => renderDropdown(currentInput.value));
            currentInput.addEventListener('keydown', (e) => { 
                if(e.key === 'Enter' && e.target.value.trim()){ 
                    e.preventDefault(); 
                    selectKeyword(e.target.value.trim().toLowerCase()); 
                } 
            });
        }
        
        inputArea.addEventListener('click', (e) => { 
            if(e.target.classList.contains('close')) { deselectKeyword(e.target.dataset.kw); } 
            else if (e.target.id === 'selector-input-area') { document.getElementById('keyword-search-input').focus(); }
        });
        document.addEventListener('click', (e) => { if (!e.target.closest('.smart-selector-container')) dropdown.classList.add('hidden'); });
        document.getElementById('next-step-btn').addEventListener('click', () => renderMission2_Coherence(container, status, [...selectedKeywords]));

        renderSelected();
    }

    function renderMission2_Coherence(container, status, keywordsFromStep1) {
        const coherenceChecks = status.config.security.coherence_checks;
        const coherenceHtml = Object.entries(coherenceChecks).map(([key, value]) => `<div class="toggle-item"><label for="check-<span class="math-inline">\{key\}"\></span>{key}</label><label class="toggle-switch"><input type="checkbox" id="check-<span class="math-inline">\{key\}" data\-key\="</span>{key}" ${value ? 'checked' : ''}><span class="slider"></span></label></div>`).join('');
        container.innerHTML = `<div class="mission-card"><h2>Missione 2: Il Protocollo di Sicurezza</h2><h4 class="step-title">Passo 2 di 2: Attiva i Controlli di Coerenza</h4><p>Questa è una rete di sicurezza aggiuntiva per impedire a Nanabot di dare consigli contraddittori.<br><b>Esempio:</b> se attivi "Celiachia", Nanabot non suggerirà <b>mai</b> una ricetta con glutine a un paziente celiaco, ma chiederà il tuo intervento.<br><br><i>Attiva i controlli che ritieni fondamentali.</i></p><div class="coherence-grid">${coherenceHtml}</div><button id="confirm-btn">Salva Protocollo e Procedi</button></div>`;
        document.getElementById('confirm-btn').addEventListener('click', async (e) => {
            e.target.disabled = true;
            const coherenceConfig = {};
            document.querySelectorAll('.toggle-switch input').forEach(t => coherenceConfig[t.dataset.key] = t.checked);
            await completeMission(2, { keywords: keywordsFromStep1, coherence_checks: coherenceConfig });
        });
    }

    function renderMission3_Explanation(container, status) {
        container.innerHTML = `<div class="mission-card"><h2>Missione 3: Il Motore Proattivo</h2><p>Nanabot può darti un aiuto ancora più concreto se gli permetti di accedere ad alcune delle tue risorse. Qui puoi decidere con precisione quali fonti di conoscenza potrà usare.</p><button id="start-mission-btn">Ho Capito, Imposta i Permessi</button></div>`;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission3_Action(container, status));
    }
    function renderMission3_Action(container, status) {
        const resources = status.config.resources;
        container.innerHTML = `<div class="mission-card"><h2>Missione 3: Il Motore Proattivo</h2><p>Seleziona a quali informazioni può accedere Nanabot per formulare risposte intelligenti e personalizzate.</p><div class="resource-section"><div class="resource-header"><div class="resource-header-info"><label for="res-patient">DATI DEL PAZIENTE</label></div><label class="toggle-switch"><input type="checkbox" data-key="patient_plans" ${resources.patient_plans ? 'checked' : ''}><span class="slider"></span></label></div><p class="resource-description">Permette a Nanabot di consultare la dieta del singolo paziente per rispondere a domande come "Posso mangiare le mandorle stasera?".</p></div><div class="resource-section"><div class="resource-header"><div class="resource-header-info"><label for="res-my-content">LA TUA LIBRERIA DI CONTENUTI</label></div><label class="toggle-switch"><input type="checkbox" data-key="my_content" ${resources.my_content ? 'checked' : ''}><span class="slider"></span></label></div><p class="resource-description">Abilita Nanabot a suggerire le tue ricette e a linkare i tuoi articoli quando un paziente fa una domanda pertinente.</p></div><div class="resource-section"><div class="resource-header"><div class="resource-header-info"><label for="res-external">LIBRERIA ESTERNA APPROVATA</label></div><label class="toggle-switch"><input type="checkbox" data-key="external_content" ${resources.external_content ? 'checked' : ''}><span class="slider"></span></label></div><p class="resource-description">Se attivato, Nanabot potrà attingere anche dalla libreria di consigli di altri nutrizionisti che hai approvato.</p></div><button id="confirm-btn">Attiva Motore e Conferma Permessi</button></div>`;
        document.getElementById('confirm-btn').addEventListener('click', async e => { 
            e.target.disabled = true; 
            const resourceConfig = {}; 
            document.querySelectorAll('.toggle-switch input').forEach(t => resourceConfig[t.dataset.key] = t.checked); 
            await completeMission(3, resourceConfig); 
        });
    }
    
    function renderMission4_Explanation(container, status) {
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 4: L'Albero della Filosofia</h2>
                <p>
                    Siamo all'ultima e più importante missione. Finora abbiamo costruito la conoscenza di Nanabot e le sue regole di sicurezza. Ora è il momento di dargli un'anima: <b>la tua</b>.
                </p>
                <p>
                    Ti presenteremo una serie di situazioni tipiche (la gestione dello sgarro, un calo di motivazione, ecc.). Per ciascuna, dovrai scegliere la filosofia di risposta che più ti rappresenta. Le tue scelte forgeranno la personalità di Nanabot, assicurando che comunichi con i tuoi pazienti usando il tuo stesso tono, la tua stessa empatia e il tuo stesso approccio.
                </p>
                <button id="start-mission-4-btn">Inizia a forgiare la sua Personalità</button>
            </div>`;
        
        document.getElementById('start-mission-4-btn').addEventListener('click', () => {
            const firstTheme = status.themes_todo[0];
            if (firstTheme) renderPhilosophyMission(container, firstTheme, status);
        });
    }

    function renderPhilosophyMission(container, theme, status) {
        if (!philosophyOptions || !philosophyOptions[theme]) return;

        let optionsHtml = Object.entries(philosophyOptions[theme]).map(([key, text]) => {
            const title = text.match(/\[(.*?)\]/)[1]; 
            const description = text.split('] ')[1];
            return `<div class="philosophy-card" data-choice="${key}"><h5>Approccio ${key}: <span class="math-inline">\{title\}</h5\><p\></span>{description}</p></div>`;
        }).join('');
        
        const themeIndex = Object.keys(status.philosophy).length + 1;
        const totalThemes = Object.keys(philosophyOptions).length;

        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 4: L'Albero della Filosofia</h2>
                <p><strong class="step-title">Tema <span class="math-inline">\{themeIndex\}/</span>{totalThemes}: <span class="math-inline">\{theme\}</strong\></p\>
<p\>Scegli l'approccio che più ti rappresenta\. Nanabot lo userà per comunicare con i tuoi pazienti con la tua stessa voce\.</p\>
<div class\="options\-grid"\></span>{optionsHtml}</div>
            </div>`;
            
        container.querySelectorAll('.philosophy-card').forEach(card => card.addEventListener('click', async (e) => {
            document.querySelectorAll('.philosophy-card').forEach(c => c.style.pointerEvents = 'none');
            e.currentTarget.classList.add('selected');
            await fetch(`${API_BASE_URL}/api/select_philosophy`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ theme, choice: e.currentTarget.dataset.choice }) });
            fetchStatus();
        }));
    }

    function renderCompletionScreen(container, status) {
        container.innerHTML = `
            <div class="mission-card completion-card">
                <h2>🎉 Addestramento Completato!</h2>
                <p>Nanabot è pronto.</p>
                <div class="final-actions">
                    <button id="reset-btn" class="btn-secondary">Ricomincia Addestramento</button>
                    <button id="discover-btn" class="btn-primary">Scopri il tuo Nanabot!</button>
                </div>
            </div>`;
        
        document.getElementById('reset-btn').addEventListener('click', resetApp);
        document.getElementById('discover-btn').addEventListener('click', () => {
            alert("Perfetto! Da qui verrai reindirizzato alla dashboard per interagire con il tuo Nanabot appena addestrato.");
        });
    }
    
    // FUNZIONI DI COMUNICAZIONE
    async function completeMission(missionNumber, data) {
        try {
            const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/complete\_mission/</span>{missionNumber}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Errore di rete');
    
            await fetchStatus( (status) => {
                renderCompletionState(document.getElementById('mission-area'), result.message);
            });
    
        } catch (error) {
            console.error("Errore missione:", error);
            alert("Errore nel completare la missione: " + error.message);
        }
    }

    async function resetApp() { await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST' }); fetchStatus(); }
    
    async function fetchStatus(callback) {
        try { 
            const response = await fetch(`${API_BASE_URL}/api/status`);
            if (!response.ok) throw new Error('Errore di connessione');
            const status = await response.json(); 
            
            if (Object.keys(philosophyOptions).length === 0 && status.progress >= 75) { 
                philosophyOptions = await (await fetch(`${API_BASE_URL}/api/philosophy_options`)).json(); 
            }
            
            renderApp(status); 
            renderCurrentMission(status);

            if (typeof callback === 'function') {
                callback(status);
            }

        } catch (error) { 
            app.innerHTML = `<div class="mission-card" style="text-align: center; border-color: #c00;"><h2 style="color: #c00;">⚠️ Errore di Connessione</h2><p>Impossibile comunicare con il server. Assicurati che il backend Python (app.py) sia in esecuzione e riprova.</p><button onclick="location.reload()">Ricarica la pagina</button></div>`; 
            console.error("Errore di connessione:", error);
        }
    }

    // AVVIO
    fetchStatus();
});
}
{
type: uploaded file
fileName: api/index.py
fullContent:
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- DATI E CLASSE ---
PHILOSOPHY_OPTIONS = {
    "Gestione dello Sgarro": {
        "A": "[METODICO SCIENTIFICO] Lo 'sgarro' è un dato. Analizziamolo per compensare il bilancio calorico settimanale senza impatti.",
        "B": "[COACH MOTIVAZIONALE] Non è uno sgarro, ma un'esperienza. Nessun senso di colpa! Domani è un nuovo giorno per ripartire con energia.",
        "C": "[OLISTICO INTEGRATO] Ascolta come reagisce il tuo corpo. Probabilmente era un cibo pro-infiammatorio. Torniamo subito a nutrire l'organismo.",
        "D": "[BUONGUSTAIO FLESSIBILE] Perfetto, spero te lo sia goduto! La vita è fatta di questi piaceri. Dal prossimo pasto si torna al piano, con serenità."
    },
    "Motivazione": {
        "A": "[METODICO SCIENTIFICO] La motivazione si basa sui dati. Guarda i grafici: la tua composizione corporea sta migliorando. I numeri non mentono.",
        "B": "[COACH MOTIVAZIONALE] Ricorda il 'perché' hai iniziato! Celebriamo ogni piccola vittoria, come aver bevuto più acqua o aver resistito a una tentazione.",
        "C": "[OLISTICO INTEGRATO] Senti la nuova energia che hai? Come dormi meglio? La vera motivazione viene dal tuo benessere interiore, non solo dallo specchio.",
        "D": "[BUONGUSTAIO FLESSIBILE] Non devi essere perfetto, devi essere costante. Pensa a questo percorso come a un'abitudine piacevole, non a un sacrificio."
    },
    "Vita Sociale": {
        "A": "[METODICO SCIENTIFICO] Prima di una cena fuori, pianifica. Controlla il menù online e pre-calcola le scelte migliori per non deviare dai tuoi target.",
        "B": "[COACH MOTIVAZIONALE] La socialità è una sfida che puoi vincere. Fissa un obiettivo: un solo bicchiere di vino e scegli l'opzione più sana che ti ispira. Puoi farcela!",
        "C": "[OLISTICO INTEGRATO] La convivialità nutre lo spirito. Scegli luoghi che offrono cibi freschi e reali. Concentrati sulla compagnia e mangia lentamente.",
        "D": "[BUONGUSTAIO FLESSIBILE] Vai e divertiti! La regola dell'80/20 esiste per questo. Scegli quello che ti va, ma con un occhio di riguardo, e vivi il momento."
    },
    "Integrazione": {
        "A": "[METODICO SCIENTIFICO] Gli integratori sono strumenti di precisione. Usali solo a seguito di analisi che dimostrino una reale carenza e a dosaggi specifici.",
        "B": "[COACH MOTIVAZIONALE] Considera gli integratori un piccolo aiuto per supportare i tuoi grandi sforzi! Non sono una magia, ma un modo per dare al corpo quel 5% in più.",
        "C": "[OLISTICO INTEGRATO] Prima cerca i nutrienti dal cibo 'vero'. Se serve, scegli integratori naturali, biodisponibili e di altissima qualità.",
        "D": "[BUONGUSTAIO FLESSIBILE] Mangia bene e non avrai bisogno di pillole. Un'alimentazione varia è l'integratore migliore e più piacevole che esista."
    }
}
THEMES = list(PHILOSOPHY_OPTIONS.keys())

class DigitalAssistant:
    def __init__(self, name="Nanabot"):
        self.name = name; self.level = 1; self.training_progress = 0; self.unlocked_badges = []; self.philosophy = {}
        self.config = { 
            "sources": [], 
            "security": {
                "keywords": ["diabete", "gravidanza", "farmaco", "dolore"], 
                "coherence_checks": {
                    "Celiachia (Senza Glutine)": True, 
                    "Dieta Vegana": True,
                    "Dieta Vegetariana": True,
                    "Intolleranza al Lattosio": True,
                    "Allergie Note": False,
                    "Favismo": False
                }
            }, 
            "resources": {"patient_plans": True, "my_content": True, "external_content": False} 
        }
    def complete_mission(self, mission_number, data):
        if mission_number == 1 and "🏅 Guardiano della Scienza" not in self.unlocked_badges:
            self.training_progress += 25; self.add_badge("🏅 Guardiano della Scienza"); self.config["sources"] = data.get("sources", [])
            return "Perfetto! D'ora in poi Nanabot si baserà solo sui dati scientifici che hai approvato."
        elif mission_number == 2 and "🛡️ Sentinella della Salute" not in self.unlocked_badges:
            self.training_progress += 25; self.add_badge("🛡️ Sentinella della Salute"); self.config["security"] = data
            return "Ottimo! Le antenne di Nanabot ora sono sintonizzate per intercettare le informazioni critiche."
        elif mission_number == 3 and "🚀 Motore Proattivo" not in self.unlocked_badges:
            self.training_progress += 25; self.add_badge("🚀 Motore Proattivo"); self.config["resources"] = data
            return "Fantastico! Hai dato a Nanabot le chiavi della tua 'dispensa di sapienza'."
        return None
    def set_philosophy(self, theme, choice_key):
        if len(self.philosophy) < len(THEMES): self.philosophy[theme] = PHILOSOPHY_OPTIONS[theme][choice_key]
        if len(self.philosophy) == len(THEMES) and "🏆 Master Trainer" not in self.unlocked_badges:
            self.training_progress = 100; self.add_badge("🏆 Master Trainer")
            return "Congratulazioni, Master Trainer! La personalità di Nanabot è forgiata a tua immagine e somiglianza."
        return None
    def add_badge(self, badge: str):
        if badge not in self.unlocked_badges: self.unlocked_badges.append(badge)
    def get_status(self):
        return {'name': self.name, 'progress': self.training_progress, 'badges': self.unlocked_badges, 'philosophy': self.philosophy, 'config': self.config, 'themes_todo': [t for t in THEMES if t not in self.philosophy]}

# --- FLASK APP ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
nanabot = DigitalAssistant()

@app.route('/api/status', methods=['GET'])
def status(): return jsonify(nanabot.get_status())

@app.route('/api/philosophy_options', methods=['GET'])
def philosophy_options(): return jsonify(PHILOSOPHY_OPTIONS)

@app.route('/api/complete_mission/<int:mission_number>', methods=['POST'])
def handle_mission_completion(mission_number):
    message = nanabot.complete_mission(mission_number, request.get_json())
    return jsonify({'success': True, 'message': message}) if message else (jsonify({'success': False, 'message': 'Missione già completata o dati non validi'}), 400)

@app.route('/api/select_philosophy', methods=['POST'])
def handle_philosophy_selection():
    data = request.get_json()
    message = nanabot.set_philosophy(data.get('theme'), data.get('choice'))
    return jsonify({'success': True, 'message': message, 'final_mission_complete': bool(message)})

@app.route('/api/reset', methods=['POST'])
def reset():
    global nanabot; nanabot = DigitalAssistant()
    return jsonify({'success': True, 'message': 'Addestramento resettato!'})
}