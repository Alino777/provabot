// script.js (Versione 5.4 – Corretta)
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const API_BASE_URL = '/api';
    let philosophyOptions = {};

    // RENDER PRINCIPALI
    function renderApp(status) {
        app.innerHTML = `
            <header>
                <img src="https://i.imgur.com/zYf2oMh.png" alt="Nanabot Logo" class="avatar">
                <h1>Addestramento di <span id="bot-name">${status.name}</span></h1>
            </header>
            <div class="progress-card">
                <div class="progress-bar-container">
                    <div id="progress-bar" class="progress-bar" style="width: ${status.progress}%"></div>
                </div>
                <p id="progress-label">Progresso Addestramento: ${status.progress}%</p>
            </div>
            <div id="mission-area"></div>
            <div class="badges-area">
                <h3>🏆 Badge Sbloccati</h3>
                <ul id="badge-list">
                    ${status.badges.length
                        ? status.badges.map(b => `<li>${b}</li>`).join('')
                        : '<li>Nessun badge ancora.</li>'}
                </ul>
            </div>
        `;
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
        container.innerHTML = `
            <div class="mission-card completion-card">
                <p class="completion-message">✅ ${message}</p>
                <button id="next-mission-btn">Prossima Missione &rarr;</button>
            </div>
        `;
        document.getElementById('next-mission-btn').addEventListener('click', fetchStatus);
    }

    // MISSIONE 1
    function renderIntroScreen(container, status) {
        container.innerHTML = `
            <div class="mission-card intro-card">
                <h2>Benvenuto, Master Trainer!</h2>
                <p>Stai per iniziare l'addestramento di <strong>Nanabot</strong>. Attraverso 4 missioni, gli insegnerai a pensare e rispondere con il tuo stile unico.</p>
                <button id="start-btn">Inizia l'Addestramento</button>
            </div>
        `;
        document.getElementById('start-btn').addEventListener('click', () => renderMission1_Explanation(container, status));
    }

    function renderMission1_Explanation(container, status) {
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 1: La Biblioteca della Verità</h2>
                <p>I tuoi pazienti, tra una visita e l'altra, potrebbero fare a Nanabot domande generali di nutrizione, come 'A cosa servono le fibre?' o 'Qual è la differenza tra grassi saturi e insaturi?'.<br><br>Per evitare che Nanabot dia risposte generiche prese da internet o, peggio, consigli errati, dobbiamo costruire insieme la sua 'biblioteca' di base.</p>
                <button id="start-mission-btn">Ho Capito, Inizia</button>
            </div>
        `;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission1_Action(container, status));
    }

    function renderMission1_Action(container, status) {
        const SOURCES = ["Linee Guida CREA", "Istituto Superiore di Sanità (ISS)", "World Health Organization (WHO)", "EFSA"];
        const sourcesHtml = SOURCES.map((s, i) => `
            <li class="check-item">
                <input type="checkbox" id="source-${i}" value="${s}" name="source">
                <label for="source-${i}">${s}</label>
            </li>
        `).join('');
        const exclusiveOptionHtml = `
            <li class="check-item">
                <input type="checkbox" id="source-none" name="source_exclusive">
                <label for="source-none" class="exclusive-option">Nessuna, Nanabot si deve basare solo sui miei contenuti</label>
            </li>
        `;

        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 1: La Biblioteca della Verità</h2>
                <p><strong>Seleziona le fonti che ritieni affidabili e che vuoi includere nella base di conoscenza di Nanabot:</strong></p>
                <ul class="item-list">
                    ${sourcesHtml}
                    <hr>
                    ${exclusiveOptionHtml}
                </ul>
                <button id="confirm-btn" disabled>Conferma Fonti</button>
            </div>
        `;

        const btn = container.querySelector('#confirm-btn');
        const standardCheckboxes = container.querySelectorAll('input[name="source"]');
        const exclusiveCheckbox = container.querySelector('input[name="source_exclusive"]');

        const updateState = () => {
            const anyChecked = Array.from(standardCheckboxes).some(c => c.checked);
            const exclusiveChecked = exclusiveCheckbox.checked;
            standardCheckboxes.forEach(c => c.disabled = exclusiveChecked);
            exclusiveCheckbox.disabled = anyChecked;
            btn.disabled = !anyChecked && !exclusiveChecked;
        };

        standardCheckboxes.forEach(c => c.addEventListener('change', updateState));
        exclusiveCheckbox.addEventListener('change', updateState);

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            let selectedSources = [];
            if (!exclusiveCheckbox.checked) {
                selectedSources = Array.from(standardCheckboxes).filter(c => c.checked).map(c => c.value);
            }
            await completeMission(1, { sources: selectedSources });
        });
    }

    // MISSIONE 2
    function renderMission2_Explanation(container, status) {
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 2: Il Protocollo di Sicurezza</h2>
                <p>La sicurezza del paziente è la priorità assoluta. In questa missione, non insegniamo a Nanabot cosa rispondere, ma <strong>quando è il momento di fare un passo indietro e chiamare te</strong>.<br><br>Lo faremo in due passaggi:<br>1. <strong>Parole Chiave di Allerta</strong>: per intercettare termini delicati.<br>2. <strong>Controlli di Coerenza</strong>: per evitare consigli contraddittori.</p>
                <button id="start-mission-btn">Ho Capito, Configura i Trigger</button>
            </div>
        `;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission2_Keywords(container, status));
    }

    function renderMission2_Keywords(container, status) {
        const allKeywords = {
            "Condizioni Mediche": ["diabete", "ipertensione", "colesterolo", "reflusso", "gastrite", "tiroide"],
            "Stati Fisiologici": ["gravidanza", "allattamento", "menopausa"],
            "Farmaci/Integratori": ["farmaco", "antibiotico", "cortisone", "pillola"],
            "Sintomi Preoccupanti": ["dolore", "nausea", "allergia", "intolleranza"]
        };
        let selectedKeywords = new Set(status.config.security.keywords);

        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 2: Il Protocollo di Sicurezza</h2>
                <h4 class="step-title">Passo 1 di 2: Imposta le Parole Chiave di Allerta</h4>
                <p>Queste parole sono dei "sensori". Ogni volta che un paziente ne userà una, Nanabot ti invierà una notifica immediata, permettendoti di intervenire.<br><strong>Esempio:</strong> se imposti "gravidanza", una domanda come "posso usare la stevia in gravidanza?" arriverà subito a te.<br><br><em>Seleziona le parole dall'elenco, oppure digita una nuova e premi Invio per aggiungerla.</em></p>
                <div class="smart-selector-container">
                    <div id="selector-input-area" class="selector-input-area"></div>
                    <div id="selector-dropdown" class="selector-dropdown hidden"></div>
                </div>
                <div class="mission-footer">
                    <button id="next-step-btn">Prosegui &rarr;</button>
                </div>
            </div>
        `;

        const inputArea = container.querySelector('#selector-input-area');
        const dropdown = container.querySelector('#selector-dropdown');

        const renderSelected = () => {
            const tagsHtml = Array.from(selectedKeywords).map(kw => `
                <span class="tag">
                    ${kw}<span class="close" data-kw="${kw}">&times;</span>
                </span>
            `).join('');
            const inputHtml = `<input type="text" id="keyword-search-input" placeholder="${selectedKeywords.size ? '' : 'Cerca, seleziona o digita una nuova parola e premi Invio'}">`;
            inputArea.innerHTML = tagsHtml + inputHtml;
            document.getElementById('keyword-search-input').focus();
            addInputListeners();
        };

        const renderDropdown = (filter = '') => {
            let html = '', has = false;
            for (const [cat, words] of Object.entries(allKeywords)) {
                const filtered = words.filter(w => !selectedKeywords.has(w) && w.toLowerCase().includes(filter.toLowerCase()));
                if (filtered.length) {
                    has = true;
                    html += `<div class="dropdown-category">${cat}</div>`;
                    html += filtered.map(w => `<div class="dropdown-item" data-kw="${w}">${w}</div>`).join('');
                }
            }
            dropdown.innerHTML = has ? html : '<div class="dropdown-item no-results">Nessun risultato</div>';
            dropdown.classList.toggle('hidden', !has);
            dropdown.querySelectorAll('.dropdown-item[data-kw]').forEach(item =>
                item.addEventListener('click', () => selectKeyword(item.dataset.kw))
            );
        };

        const selectKeyword = kw => {
            selectedKeywords.add(kw);
            renderSelected();
            renderDropdown();
        };
        const deselectKeyword = kw => {
            selectedKeywords.delete(kw);
            renderSelected();
            const val = document.getElementById('keyword-search-input').value;
            renderDropdown(val);
        };

        function addInputListeners() {
            const input = document.getElementById('keyword-search-input');
            input.addEventListener('input', () => renderDropdown(input.value));
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    selectKeyword(input.value.trim().toLowerCase());
                }
            });
        }

        inputArea.addEventListener('click', e => {
            if (e.target.classList.contains('close')) {
                deselectKeyword(e.target.dataset.kw);
            }
        });
        document.addEventListener('click', e => {
            if (!e.target.closest('.smart-selector-container')) {
                dropdown.classList.add('hidden');
            }
        });
        container.querySelector('#next-step-btn').addEventListener('click', () =>
            renderMission2_Coherence(container, status, Array.from(selectedKeywords))
        );

        renderSelected();
        renderDropdown();
    }

    function renderMission2_Coherence(container, status, keywordsFromStep1) {
        const coherenceChecks = status.config.security.coherence_checks;
        const coherenceHtml = Object.entries(coherenceChecks).map(([key, val]) => `
            <div class="toggle-item">
                <label for="check-${key}">${key}</label>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="${key}" ${val ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 2: Il Protocollo di Sicurezza</h2>
                <h4 class="step-title">Passo 2 di 2: Attiva i Controlli di Coerenza</h4>
                <p>Questa è una rete di sicurezza aggiuntiva per impedire a Nanabot di dare consigli contraddittori.<br><strong>Esempio:</strong> se attivi "Celiachia", Nanabot non suggerirà mai una ricetta con glutine a un paziente celiaco, ma chiederà il tuo intervento.</p>
                <div class="coherence-grid">
                    ${coherenceHtml}
                </div>
                <button id="confirm-btn">Salva Protocollo e Procedi</button>
            </div>
        `;
        container.querySelector('#confirm-btn').addEventListener('click', async () => {
            const coherenceConfig = {};
            container.querySelectorAll('.toggle-switch input').forEach(t => {
                coherenceConfig[t.dataset.key] = t.checked;
            });
            await completeMission(2, { keywords: keywordsFromStep1, coherence_checks: coherenceConfig });
        });
    }

    // MISSIONE 3
    function renderMission3_Explanation(container, status) {
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 3: Il Motore Proattivo</h2>
                <p>Nanabot può darti un aiuto ancora più concreto se gli permetti di accedere ad alcune delle tue risorse. Qui puoi decidere con precisione quali fonti di conoscenza potrà usare.</p>
                <button id="start-mission-btn">Ho Capito, Imposta i Permessi</button>
            </div>
        `;
        document.getElementById('start-mission-btn').addEventListener('click', () => renderMission3_Action(container, status));
    }

    function renderMission3_Action(container, status) {
        const resources = status.config.resources;
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 3: Il Motore Proattivo</h2>
                <p>Seleziona a quali informazioni può accedere Nanabot per formulare risposte intelligenti e personalizzate.</p>
                ${['patient_plans','my_content','external_content'].map(key => `
                    <div class="resource-section">
                        <div class="resource-header">
                            <div class="resource-header-info">
                                <label for="res-${key}">${{
                                    patient_plans: 'DATI DEL PAZIENTE',
                                    my_content: 'LA TUA LIBRERIA DI CONTENUTI',
                                    external_content: 'LIBRERIA ESTERNA APPROVATA'
                                }[key]}</label>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" data-key="${key}" ${resources[key] ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p class="resource-description">${
                            {
                                patient_plans: 'Permette a Nanabot di consultare la dieta del singolo paziente per rispondere a domande come "Posso mangiare le mandorle stasera?".',
                                my_content: 'Abilita Nanabot a suggerire le tue ricette e a linkare i tuoi articoli quando un paziente fa una domanda pertinente.',
                                external_content: 'Se attivato, Nanabot potrà attingere anche dalla libreria di consigli di altri nutrizionisti che hai approvato.'
                            }[key]
                        }</p>
                    </div>
                `).join('')}
                <button id="confirm-btn">Attiva Motore e Conferma Permessi</button>
            </div>
        `;
        container.querySelector('#confirm-btn').addEventListener('click', async () => {
            const cfg = {};
            container.querySelectorAll('.toggle-switch input').forEach(t => {
                cfg[t.dataset.key] = t.checked;
            });
            await completeMission(3, cfg);
        });
    }

    // MISSIONE 4
    function renderMission4_Explanation(container, status) {
        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 4: L'Albero della Filosofia</h2>
                <p>Ora è il momento di dargli un'anima: <strong>la tua</strong>. Per ciascuna situazione, sceglierai l'approccio che ti rappresenta di più.</p>
                <button id="start-mission-4-btn">Inizia a forgiare la sua Personalità</button>
            </div>
        `;
        document.getElementById('start-mission-4-btn').addEventListener('click', () => {
            const first = status.themes_todo[0];
            if (first) renderPhilosophyMission(container, first, status);
        });
    }

    function renderPhilosophyMission(container, theme, status) {
        if (!philosophyOptions[theme]) return;
        const opts = philosophyOptions[theme];
        const entries = Object.entries(opts);
        const themeIndex = Object.keys(status.philosophy).length + 1;
        const total = Object.keys(philosophyOptions).length;

        container.innerHTML = `
            <div class="mission-card">
                <h2>Missione 4: L'Albero della Filosofia</h2>
                <p><strong>Tema ${themeIndex}/${total}: ${theme}</strong></p>
                <p>Scegli l'approccio che più ti rappresenta. Nanabot lo userà per comunicare con i tuoi pazienti con la tua stessa voce.</p>
                <div class="options-grid">
                    ${entries.map(([key, text]) => {
                        const title = text.match(/\[(.*?)\]/)[1];
                        const desc = text.split('] ')[1];
                        return `
                            <div class="philosophy-card" data-choice="${key}">
                                <h5>Approccio ${key}: ${title}</h5>
                                <p>${desc}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        container.querySelectorAll('.philosophy-card').forEach(card =>
            card.addEventListener('click', async e => {
                container.querySelectorAll('.philosophy-card').forEach(c => c.style.pointerEvents = 'none');
                e.currentTarget.classList.add('selected');
                await fetch(`${API_BASE_URL}/select_philosophy`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ theme, choice: e.currentTarget.dataset.choice })
                });
                fetchStatus();
            })
        );
    }

    // SCHERMATA FINALE
    function renderCompletionScreen(container, status) {
        container.innerHTML = `
            <div class="mission-card completion-card">
                <h2>🎉 Addestramento Completato!</h2>
                <p>Nanabot è pronto.</p>
                <div class="final-actions">
                    <button id="reset-btn" class="btn-secondary">Ricomincia Addestramento</button>
                    <button id="discover-btn" class="btn-primary">Scopri il tuo Nanabot!</button>
                </div>
            </div>
        `;
        container.querySelector('#reset-btn').addEventListener('click', resetApp);
        container.querySelector('#discover-btn').addEventListener('click', () => {
            alert("Perfetto! Da qui verrai reindirizzato alla dashboard per interagire con il tuo Nanabot appena addestrato.");
        });
    }

    // FUNZIONI DI COMUNICAZIONE
    async function completeMission(missionNumber, data) {
        try {
            const res = await fetch(`${API_BASE_URL}/complete_mission/${missionNumber}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Errore di rete');
            await fetchStatus(status => {
                renderCompletionState(document.getElementById('mission-area'), result.message);
            });
        } catch (err) {
            console.error("Errore missione:", err);
            alert("Errore nel completare la missione: " + err.message);
        }
    }

    async function resetApp() {
        await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
        fetchStatus();
    }

    async function fetchStatus(callback) {
        try {
            const res = await fetch(`${API_BASE_URL}/status`);
            if (!res.ok) throw new Error('Errore di connessione');
            const status = await res.json();
            if (!Object.keys(philosophyOptions).length && status.progress >= 75) {
                philosophyOptions = await (await fetch(`${API_BASE_URL}/philosophy_options`)).json();
            }
            renderApp(status);
            renderCurrentMission(status);
            if (typeof callback === 'function') callback(status);
        } catch (err) {
            console.error("Errore di connessione:", err);
            app.innerHTML = `
                <div class="mission-card" style="text-align:center; border-color:#c00;">
                    <h2 style="color:#c00;">⚠️ Errore di Connessione</h2>
                    <p>Impossibile comunicare con il server. Assicurati che il backend Python sia in esecuzione e riprova.</p>
                    <button onclick="location.reload()">Ricarica la pagina</button>
                </div>
            `;
        }
    }

    // AVVIO
    fetchStatus();
});
