# Specifiche Funzionalità - RapRanger Web App

**Versione:** 1.0.0  
**Data Ultima Revisione:** 2024-12-19  
**Autore:** Team RapRanger

---

## 1. Introduzione

Questo documento descrive in dettaglio tutte le funzionalità dell'applicazione RapRanger Web, includendo il mapping tra funzionalità mobile e web, logica di business, regole di validazione, flussi utente e requisiti tecnici.

### 1.1 Scopo del Documento

- Descrivere tutte le funzionalità dell'applicazione
- Mappare funzionalità mobile → web
- Specificare logica di business e regole di validazione
- Definire flussi utente e casi d'uso
- Stabilire requisiti tecnici per ogni feature

### 1.2 Organizzazione

Le funzionalità sono organizzate per moduli principali:
1. **Autenticazione e Profilo**
2. **Workout Program Management**
3. **Active Workout Logging**
4. **Progress Tracking**
5. **Body Tracking**
6. **Integrazioni Esterne**

---

## 2. Autenticazione e Profilo

### 2.1 Autenticazione

#### 2.1.1 Login

**Descrizione:** L'utente accede all'applicazione con email e password.

**Flusso:**
1. Utente inserisce email e password
2. Frontend invia credenziali a `/auth/login`
3. Backend valida credenziali e genera JWT tokens
4. Frontend salva tokens e reindirizza a dashboard

**Validazione:**
- Email: formato valido, required
- Password: minimo 8 caratteri, required

**Sicurezza:**
- Password hash con bcrypt (salt rounds: 10)
- Rate limiting: max 5 tentativi per 15 minuti
- Audit log: log di tutti i tentativi di login (successo/fallimento)

**Perché questa implementazione:**
- **JWT:** Stateless, scalabile, funziona bene per web e mobile
- **Rate Limiting:** Previene brute force attacks
- **Audit Log:** Tracciabilità richiesta per ambienti industriali

#### 2.1.2 Registrazione

**Descrizione:** Nuovo utente crea un account.

**Flusso:**
1. Utente inserisce email, password, nome
2. Frontend valida input lato client
3. Backend verifica email non esistente
4. Crea utente e profilo iniziale
5. Invia email di conferma (opzionale per MVP)

**Validazione:**
- Email: formato valido, univoco, required
- Password: minimo 8 caratteri, almeno 1 maiuscola, 1 numero, required
- Nome: minimo 2 caratteri, required

**Perché questa implementazione:**
- **Validazione Doppia:** Client + server per UX e sicurezza
- **Email Conferma:** Opzionale per MVP, può essere aggiunta dopo
- **Profilo Automatico:** Crea profilo vuoto per semplificare onboarding

#### 2.1.3 Refresh Token

**Descrizione:** Rinnovo automatico del token di accesso.

**Flusso:**
1. Frontend rileva token scaduto (401 response)
2. Invia refresh token a `/auth/refresh`
3. Backend valida refresh token e genera nuovo access token
4. Frontend aggiorna token e ritenta richiesta originale

**Sicurezza:**
- Refresh token scade dopo 30 giorni
- Refresh token può essere revocato (logout)
- Audit log: log di tutti i refresh token

**Perché questa implementazione:**
- **UX:** Utente non deve rifare login frequentemente
- **Sicurezza:** Access token breve (15 min) riduce rischio se compromesso
- **Revoca:** Logout invalida refresh token

### 2.2 Profilo Utente

#### 2.2.1 Visualizzazione Profilo

**Descrizione:** L'utente visualizza il proprio profilo con informazioni personali e atleta.

**Dati Visualizzati:**
- Informazioni base: nome, email, foto profilo
- Profilo atleta: età, genere, altezza, livello atleta
- Preferenze: unità di misura, lingua, notifiche
- Statistiche: data registrazione, workout totali, streak attuale

**API Endpoint:**
```
GET /profile
```

**Perché questa struttura:**
- **Separazione:** Profilo base separato da profilo atleta per flessibilità
- **Privacy:** Utente controlla visibilità dati
- **Statistiche:** Motivazione utente con metriche personali

#### 2.2.2 Modifica Profilo

**Descrizione:** L'utente modifica informazioni del profilo.

**Campi Modificabili:**
- Nome, email, foto profilo
- Età, genere, altezza, livello atleta
- Preferenze app

**Validazione:**
- Email: formato valido, univoco (se cambiato)
- Altezza: 100-250 cm (metric) o 40-100 inches (imperial)
- Età: 13-120 anni

**API Endpoint:**
```
PATCH /profile
```

**Perché questa implementazione:**
- **PATCH:** Modifica parziale, più efficiente di PUT
- **Validazione:** Validazione rigorosa per dati medici/fitness
- **Audit:** Log di tutte le modifiche al profilo

#### 2.2.3 Upload Foto Profilo

**Descrizione:** L'utente carica o modifica la foto profilo.

**Flusso:**
1. Utente seleziona file (drag & drop o file picker)
2. Frontend valida file (formato, dimensione)
3. Frontend mostra preview
4. Utente conferma upload
5. Frontend upload a `/profile/photo` (multipart/form-data)
6. Backend salva su S3 e aggiorna profilo
7. Frontend aggiorna UI con nuova foto

**Validazione:**
- Formato: JPG, PNG, WebP
- Dimensione: max 5 MB
- Dimensioni: min 200x200px, max 4000x4000px
- Aspect ratio: 1:1 (quadrato) consigliato

**Storage:**
- S3 bucket: `rapranger-user-files-prod/photos/{userId}/`
- Nome file: `profile_{timestamp}.{ext}`
- Compressione: Backend comprime automaticamente a max 800x800px

**Perché questa implementazione:**
- **Validazione Client:** Feedback immediato all'utente
- **Compressione Server:** Riduce storage e bandwidth
- **S3:** Scalabile, duraturo, economico
- **Naming:** Timestamp previene conflitti e cache issues

---

## 3. Workout Program Management

### 3.1 Panoramica

Il modulo Workout Program gestisce la creazione, modifica e gestione di programmi di allenamento strutturati in microcicli (1-4 settimane) e sessioni di allenamento.

### 3.2 Lista Programmi

#### 3.2.1 Visualizzazione Lista

**Descrizione:** L'utente visualizza tutti i suoi programmi di allenamento.

**Filtri:**
- Status: Tutti, Draft, Active, Paused, Completed, Archived
- Ordine: Data creazione (recente/primo), Nome (A-Z, Z-A)

**Layout:**
- Card-based layout con informazioni essenziali
- Badge status (colore per ogni status)
- Azioni rapide: Edit, Duplicate, Delete, Activate

**API Endpoint:**
```
GET /workout-programs?status=active&sort=createdAt&order=desc
```

**Perché questa implementazione:**
- **Card Layout:** Più informazioni visibili rispetto a lista semplice
- **Filtri:** Utente trova rapidamente programmi specifici
- **Azioni Rapide:** Accesso veloce a operazioni comuni

#### 3.2.2 Creazione Programma

**Descrizione:** L'utente crea un nuovo programma di allenamento.

**Flusso:**
1. Utente clicca "Crea Programma"
2. Form wizard multi-step:
   - Step 1: Informazioni base (nome, descrizione, durata)
   - Step 2: Microcicli (aggiungi/rimuovi microcicli)
   - Step 3: Sessioni (per ogni microciclo, definisci sessioni)
   - Step 4: Esercizi (per ogni sessione, aggiungi esercizi)
3. Utente salva come draft o attiva direttamente
4. Backend valida e crea programma

**Validazione:**
- Nome: 1-100 caratteri, required
- Descrizione: max 1000 caratteri, optional
- Durata: 1-52 settimane, required
- Microcicli: minimo 1, massimo 20
- Sessioni per microciclo: minimo 1
- Esercizi per sessione: minimo 1

**API Endpoint:**
```
POST /workout-programs
Body: {
  name: string,
  description?: string,
  durationWeeks: number,
  microcycles: MicrocycleDto[]
}
```

**Perché questa implementazione:**
- **Wizard Multi-Step:** Riduce complessità percepita, guida utente
- **Validazione Incrementale:** Valida ogni step prima di procedere
- **Draft:** Permette salvataggio parziale, utente può completare dopo

#### 3.2.3 Modifica Programma

**Descrizione:** L'utente modifica un programma esistente.

**Restrizioni:**
- Programmi Active: Solo modifica limitata (note, descrizione)
- Programmi Completed/Archived: Solo visualizzazione
- Programmi Draft/Paused: Modifica completa

**Versioning:**
- Modifiche a programmi Active creano nuova versione
- Versioni precedenti rimangono accessibili per storico

**API Endpoint:**
```
PATCH /workout-programs/:id
Body: {
  name?: string,
  description?: string,
  // ... altri campi
}
```

**Perché questa implementazione:**
- **Restrizioni:** Previene modifiche accidentali a programmi in uso
- **Versioning:** Tracciabilità completa, richiesto per audit
- **Storico:** Utente può vedere evoluzione programma

#### 3.2.4 Attivazione Programma

**Descrizione:** L'utente attiva un programma draft.

**Validazione:**
- Programma deve essere in stato Draft
- Programma deve avere almeno 1 microciclo
- Ogni microciclo deve avere almeno 1 sessione
- Ogni sessione deve avere almeno 1 esercizio

**Flusso:**
1. Utente clicca "Attiva"
2. Backend valida programma
3. Se valido: cambia status a Active, crea schedule
4. Se non valido: ritorna errori specifici

**API Endpoint:**
```
POST /workout-programs/:id/activate
```

**Perché questa implementazione:**
- **Validazione Rigorosa:** Previene attivazione programmi incompleti
- **Feedback Chiaro:** Errori specifici aiutano utente a correggere
- **Schedule Automatico:** Crea schedule settimanale automaticamente

#### 3.2.5 Duplicazione Programma

**Descrizione:** L'utente duplica un programma esistente.

**Flusso:**
1. Utente clicca "Duplica" su un programma
2. Backend crea copia con nome "Nome Originale (Copia)"
3. Nuovo programma in stato Draft
4. Utente può modificare e attivare

**API Endpoint:**
```
POST /workout-programs/:id/duplicate
```

**Perché questa implementazione:**
- **Template:** Utente può creare varianti di programmi esistenti
- **Draft:** Copia sempre in draft per sicurezza
- **Nome Automatico:** Evita conflitti, utente può rinominare

### 3.3 Microcicli

#### 3.3.1 Struttura Microciclo

**Descrizione:** Un microciclo rappresenta 1-4 settimane di allenamento.

**Campi:**
- Nome: identificativo microciclo (es. "Fase 1: Forza Base")
- Durata: 1-4 settimane
- Ordine: posizione nel programma
- Obiettivi: descrizione obiettivi microciclo
- Sessioni: lista sessioni di allenamento

**Validazione:**
- Durata totale programma = somma durate microcicli
- Ordine: sequenziale, senza gap

**Perché questa struttura:**
- **Flessibilità:** Supporta programmi lineari e periodizzati
- **Organizzazione:** Microcicli permettono strutturazione logica
- **Validazione:** Durata totale deve corrispondere per coerenza

#### 3.3.2 Gestione Sessioni

**Descrizione:** Ogni microciclo contiene sessioni di allenamento.

**Campi Sessione:**
- Nome: identificativo sessione (es. "Push A", "Pull B")
- Giorno settimana: 1-7 (Lun-Dom)
- Ordine: ordine nella settimana
- Esercizi: lista esercizi con serie/ripetizioni/peso

**Validazione:**
- Ogni microciclo: minimo 1 sessione
- Giorno settimana: univoco per microciclo (no duplicati)
- Esercizi: minimo 1 per sessione

**Perché questa struttura:**
- **Scheduling:** Giorno settimana permette scheduling automatico
- **Organizzazione:** Ordine permette sequenza logica
- **Flessibilità:** Supporta split diversi (Push/Pull/Legs, Upper/Lower, etc.)

### 3.4 Esercizi

#### 3.4.1 Catalogo Esercizi

**Descrizione:** L'applicazione include un catalogo di esercizi.

**Fonte Dati:**
- ExerciseDB API (integrazione esterna)
- Cache locale per performance
- TTL cache: 24 ore

**Campi Esercizio:**
- ID: identificativo univoco
- Nome: nome esercizio
- Body Part: parte del corpo (es. "Chest", "Back")
- Target: muscolo target (es. "Pectoralis Major")
- Equipment: attrezzatura necessaria
- Istruzioni: descrizione esecuzione (opzionale)
- Immagini: immagini di riferimento (opzionale)

**API Endpoint:**
```
GET /exercises?bodyPart=chest&equipment=barbell
```

**Perché questa implementazione:**
- **ExerciseDB:** Database completo e mantenuto
- **Cache:** Riduce chiamate API, migliora performance
- **Filtri:** Utente trova rapidamente esercizi specifici

#### 3.4.2 Aggiunta Esercizio a Sessione

**Descrizione:** L'utente aggiunge esercizi a una sessione.

**Flusso:**
1. Utente clicca "Aggiungi Esercizio" in una sessione
2. Dialog con catalogo esercizi (filtrabile)
3. Utente seleziona esercizio
4. Configurazione serie:
   - Numero serie: 1-10
   - Ripetizioni: 1-100 (per serie o range)
   - Peso: 0.5-500 kg (incrementi 0.5 kg)
   - RPE: 1-10 (incrementi 0.5) - opzionale
   - Note: testo libero - opzionale
5. Utente salva

**Validazione:**
- Serie: minimo 1, massimo 10
- Ripetizioni: 1-100, può essere range (es. "8-10")
- Peso: 0.5-500 kg, incrementi 0.5 kg
- RPE: 1-10, incrementi 0.5

**Perché questa implementazione:**
- **Range Ripetizioni:** Supporta programmi con progressione (es. "8-10 reps")
- **Incrementi Fissi:** Allineato con standard palestra (0.5 kg, 0.5 RPE)
- **Note:** Permette personalizzazione per utente avanzato

---

## 4. Active Workout Logging

### 4.1 Panoramica

Il modulo Active Workout Logging permette all'utente di loggare un workout in tempo reale durante l'esecuzione.

### 4.2 Avvio Workout

#### 4.2.1 Inizio Sessione

**Descrizione:** L'utente inizia una sessione di allenamento programmata.

**Flusso:**
1. Utente visualizza calendario/schedule
2. Seleziona sessione programmata per oggi
3. Clicca "Inizia Workout"
4. Backend crea ActiveWorkoutSession
5. Frontend mostra schermata workout attivo

**Validazione:**
- Sessione deve essere programmata per oggi
- Non può esserci altra sessione attiva
- Sessione deve avere almeno 1 esercizio

**API Endpoint:**
```
POST /workout-sessions/:id/start
```

**Perché questa implementazione:**
- **Schedule:** Integrazione con programmi per coerenza
- **Singola Sessione:** Previene confusione, una sessione alla volta
- **Validazione:** Previene avvio sessioni incomplete

#### 4.2.2 Schermata Workout Attivo

**Descrizione:** Interfaccia per logging durante workout.

**Layout:**
- Header: Nome sessione, timer, pause/resume
- Lista Esercizi: 
  - Esercizio corrente evidenziato
  - Esercizi completati: checkmark
  - Esercizi futuri: disabilitati
- Card Esercizio Corrente:
  - Nome esercizio
  - Serie completate: lista con peso/reps/RPE
  - Serie corrente: input peso/reps/RPE
  - Azioni: "Completa Serie", "Salta Esercizio"
- Footer: "Completa Workout", "Pausa"

**Auto-Save:**
- Salvataggio automatico ogni 10 secondi
- Salvataggio dopo ogni serie completata
- Warning se utente tenta di chiudere tab

**Perché questa implementazione:**
- **Focus:** Solo esercizio corrente visibile, riduce distrazione
- **Auto-Save:** Previene perdita dati
- **Warning:** Previene chiusura accidentale

### 4.3 Logging Serie

#### 4.3.1 Completa Serie

**Descrizione:** L'utente completa una serie e la logga.

**Flusso:**
1. Utente inserisce peso, reps, RPE (opzionale)
2. Clicca "Completa Serie"
3. Frontend valida input
4. Backend salva serie e aggiorna stato
5. Frontend aggiorna UI (serie aggiunta, prossima serie)

**Validazione:**
- Peso: 0.5-500 kg, incrementi 0.5 kg
- Reps: 1-100
- RPE: 1-10, incrementi 0.5 (opzionale)

**API Endpoint:**
```
POST /active-workouts/:id/sets
Body: {
  exerciseId: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  rpe?: number,
  notes?: string
}
```

**Perché questa implementazione:**
- **Validazione Client:** Feedback immediato
- **Validazione Server:** Sicurezza, previene dati invalidi
- **Opzionale RPE:** Non tutti gli utenti usano RPE

#### 4.3.2 Personal Record (PR)

**Descrizione:** Sistema rileva automaticamente PR.

**Logica:**
- PR Peso: peso maggiore di qualsiasi serie precedente per esercizio
- PR Volume: volume (peso × reps) maggiore
- PR e1RM: e1RM calcolato maggiore

**Notifica:**
- Badge "PR!" quando rilevato
- Animazione celebrativa (opzionale)
- Salvataggio flag `isPr: true`

**Perché questa implementazione:**
- **Motivazione:** PR automatici motivano utente
- **Tracciabilità:** Flag PR permette filtri e analisi
- **Calcolo e1RM:** Formula standard (Brzycki o Epley)

### 4.4 Completamento Workout

#### 4.4.1 Fine Sessione

**Descrizione:** L'utente completa il workout.

**Flusso:**
1. Utente clicca "Completa Workout"
2. Dialog conferma (opzionale note finali)
3. Backend:
   - Chiude ActiveWorkoutSession
   - Aggiorna WorkoutSession (status: completed)
   - Calcola metriche (volume totale, durata, etc.)
   - Genera insights (se applicabile)
4. Frontend mostra schermata riepilogo

**Validazione:**
- Almeno 1 serie deve essere stata completata
- Workout deve essere in stato "active" o "paused"

**API Endpoint:**
```
POST /active-workouts/:id/complete
Body: {
  notes?: string
}
```

**Perché questa implementazione:**
- **Metriche Automatiche:** Calcolo automatico riduce errore utente
- **Insights:** Feedback immediato su performance
- **Note Finali:** Permette annotazioni post-workout

#### 4.4.2 Riepilogo Workout

**Descrizione:** Schermata con riepilogo workout completato.

**Dati Mostrati:**
- Durata totale
- Volume totale (tonnellaggio)
- Esercizi completati
- Serie totali
- PR raggiunti (se presenti)
- Grafico volume per esercizio (opzionale)

**Azioni:**
- "Condividi" (opzionale)
- "Salva Note" (se non già salvate)
- "Torna a Dashboard"

**Perché questa implementazione:**
- **Feedback Immediato:** Utente vede risultati subito
- **Motivazione:** Metriche positive motivano
- **Condivisione:** Social feature (opzionale per MVP)

### 4.5 Crash Recovery

#### 4.5.1 Sistema di Recovery

**Descrizione:** Sistema recupera workout in caso di crash/chiusura browser.

**Implementazione:**
- Snapshot ogni 10 secondi durante workout attivo.
- Snapshot include:
  - **Session Data:** Stato esercizio corrente, serie completate, timestamp inizio.
  - **Timer State:** Valore corrente timer, stato (running/paused).
  - **UI State:** Overlay attivi (dialogs, bottom sheets), scroll position, form input parziali (non salvati).
- Al rientro, sistema rileva workout attivo e offre recovery.
- **TTL Snapshot:** 2 ore. Se utente torna dopo >2 ore, il recovery viene scartato per evitare stati inconsistenti.

**Flusso Recovery:**
1. Utente riapre app durante workout.
2. Sistema rileva ActiveWorkoutSession non completata.
3. Dialog: "Hai un workout in corso. Vuoi continuare?".
4. Se sì: ripristina stato da ultimo snapshot, inclusi timer e UI.
5. Se no: chiude workout (dati salvati).

**Perché questa implementazione:**
- **Affidabilità:** Critico per ambienti industriali.
- **UX:** Utente non perde progresso, riprende esattamente dove ha lasciato.
- **Frequenza:** 10 secondi bilancia performance e sicurezza dati.
- **UI State:** Evita disorientamento ripristinando il contesto visivo.

---

## 5. Data Integrity & Validation

### 5.1 Regole di Validazione (Domain Rules)

Tutti i dati in ingresso (da UI o API) DEVONO rispettare le seguenti regole rigorose. Queste regole sono la "Single Source of Truth" condivisa tra Frontend (UX immediata) e Backend (sicurezza dati).

| Entità | Campo | Tipo | Regole (Min / Max / Format) | Note |
| :--- | :--- | :--- | :--- | :--- |
| **User Profile** | `email` | String | Email valida (RFC 5322) | Univoco |
| | `password` | String | Min 8 chars, 1 Upper, 1 Number, 1 Special | Bcrypt hash |
| | `height` | Number | 100 - 250 cm / 40 - 100 in | |
| | `age` | Number | 13 - 120 anni | |
| **Workout Program** | `name` | String | Min 1, Max 100 chars | Trim whitespace |
| | `description` | String | Max 1000 chars | Optional |
| | `durationWeeks` | Number | Min 1, Max 52 | |
| **Exercise** | `name` | String | Min 1, Max 100 chars | |
| **Workout Set** | `weight` | Number | 0 - 500 kg | Step 0.5 kg |
| | `reps` | Number | 1 - 100 | Step 1 |
| | `rpe` | Number | 1 - 10 | Step 0.5 |
| **Body Metrics** | `weight` | Number | 20 - 300 kg | |
| | `circumference` | Number | 10 - 200 cm | Per ogni tipo |
| **Database IDs** | `uuid` | String | UUID v4 standard | Max 50 chars storage |

### 5.2 Concurrency Handling

**Strategia:** Last Write Wins con Optimistic Locking (versioning).

**Regole:**
1. Ogni entità critica (Workout, Program) ha un campo `version` (intero incrementale) o `updatedAt` (timestamp alta precisione).
2. Frontend invia `version` corrente durante update.
3. Backend verifica: se `version` DB > `version` inviata, RIFIUTA con errore `409 Conflict`.
4. Frontend deve gestire il conflitto (ricaricare dati e chiedere a utente di ri-applicare modifiche).

**Perché:**
- Evita sovrascritture accidentali se utente usa app su due tab/dispositivi.
- Garantisce consistenza dati in ambienti multi-client.

---

## 6. Progress Tracking

### 5.1 Panoramica

Il modulo Progress Tracking analizza i dati di allenamento per generare insights, report e metriche di progresso.

### 5.2 Dashboard Progress

#### 5.2.1 KPI Cards

**Descrizione:** Card con Key Performance Indicators principali.

**KPI Principali:**
- Volume Settimanale: tonnellaggio totale settimana corrente
- e1RM Trend: trend e1RM per esercizi principali
- Consistency Score: percentuale workout completati vs programmati
- Streak Attuale: giorni consecutivi con workout

**Aggiornamento:**
- Real-time quando possibile
- Cache 5 minuti per performance

**Perché questa implementazione:**
- **Overview Rapida:** Utente vede progresso a colpo d'occhio
- **Motivazione:** Metriche positive motivano
- **Cache:** Bilancia real-time e performance

#### 5.2.2 Grafici Trend

**Descrizione:** Grafici che mostrano trend nel tempo.

**Grafici Disponibili:**
- Volume nel Tempo: line chart volume settimanale
- e1RM nel Tempo: line chart e1RM per esercizio
- Consistency: bar chart workout completati per settimana
- Body Weight vs Volume: correlazione peso corporeo e volume (se disponibile)

**Periodi:**
- 1 settimana
- 1 mese
- 3 mesi
- 6 mesi
- 1 anno
- Tutto

**Libreria:** Chart.js o Recharts

**Perché questa implementazione:**
- **Visualizzazione:** Grafici più efficaci di tabelle per trend
- **Flessibilità:** Periodi multipli per analisi diverse
- **Librerie Mature:** Chart.js/Recharts ben supportate

### 5.3 Insights

#### 5.3.1 Generazione Insights

**Descrizione:** Sistema genera insights automatici sui dati.

**Tipi Insights:**
- **Trend:** "Il tuo volume è aumentato del 15% questa settimana"
- **Anomalia:** "Hai saltato 3 workout questa settimana"
- **Correlazione:** "Volume più alto quando pesi 2kg in meno"
- **Raccomandazione:** "Considera di aumentare il riposo tra serie"

**Algoritmi:**
- Trend: regressione lineare semplice
- Anomalia: deviazione standard
- Correlazione: coefficiente di correlazione Pearson
- Raccomandazione: regole basate su best practices

**Frequenza:**
- Calcolo giornaliero (background job)
- Mostra solo insights non acknowledged

**Perché questa implementazione:**
- **Valore Aggiunto:** Distingue app da semplice logger
- **Automatico:** Utente non deve analizzare manualmente
- **Actionable:** Insights con raccomandazioni concrete

#### 5.3.2 Visualizzazione Insights

**Descrizione:** Lista insights con filtri e azioni.

**Layout:**
- Card per insight con:
  - Tipo (badge colorato)
  - Titolo
  - Descrizione
  - Raccomandazione (se presente)
  - Data
  - Azioni: "Acknowledge", "Dismiss"

**Filtri:**
- Tipo: Tutti, Trend, Anomalia, Correlazione, Raccomandazione
- Severità: Info, Warning, Critical
- Stato: Tutti, Non Acknowledged, Acknowledged

**Perché questa implementazione:**
- **Organizzazione:** Filtri aiutano utente a trovare insights rilevanti
- **Acknowledge:** Utente può marcare come "visto"
- **Severità:** Priorità visiva per insights importanti

### 5.4 Report

#### 5.4.1 Generazione Report

**Descrizione:** Sistema genera report periodici (settimanale, mensile).

**Tipi Report:**
- Settimanale: riepilogo settimana corrente
- Mensile: riepilogo mese corrente
- Personalizzato: periodo selezionato dall'utente

**Contenuto Report:**
- Statistiche generali (volume, workout, durata media)
- Grafici trend
- Insights principali
- PR raggiunti
- Confronto periodo precedente

**Formato:**
- PDF: per condivisione/stampa
- CSV: per analisi esterne
- JSON: per integrazioni

**API Endpoint:**
```
POST /reports
Body: {
  type: 'weekly' | 'monthly' | 'custom',
  startDate?: string,
  endDate?: string,
  format: 'pdf' | 'csv' | 'json'
}
```

**Perché questa implementazione:**
- **Formati Multipli:** Soddisfa diversi use case
- **Asincrono:** Generazione report può richiedere tempo
- **Storage:** Report salvati per accesso futuro

#### 5.4.2 Download Report

**Descrizione:** Utente scarica report generati.

**Flusso:**
1. Utente visualizza lista report generati
2. Clicca "Download" su report
3. Backend genera file (se non già generato)
4. Frontend scarica file

**Storage:**
- S3: report salvati per 30 giorni
- Lifecycle policy: delete dopo 30 giorni

**Perché questa implementazione:**
- **Performance:** Report generati una volta, riutilizzabili
- **Storage:** 30 giorni bilancia accesso e costi
- **GDPR:** Delete automatico dopo periodo ragionevole

### 5.5 Streaks

#### 5.5.1 Tipi Streak

**Descrizione:** Sistema traccia diversi tipi di streak.

**Tipi Streak:**
- **Workout Streak:** giorni consecutivi con almeno 1 workout
- **Program Streak:** settimane consecutive seguendo programma
- **PR Streak:** giorni consecutivi con almeno 1 PR
- **Volume Streak:** settimane consecutive con volume >soglia

**Calcolo:**
- Aggiornamento giornaliero (background job)
- Reset automatico quando streak si interrompe

**Perché questa implementazione:**
- **Motivazione:** Streak motivano consistenza
- **Multipli Tipi:** Diversi obiettivi per diversi utenti
- **Automatico:** Utente non deve tracciare manualmente

#### 5.5.2 Visualizzazione Streaks

**Descrizione:** Dashboard con tutti gli streak attivi.

**Layout:**
- Card per ogni tipo streak
- Contatore giorni/settimane
- Record personale
- Milestone prossime (es. "10 giorni per 100 giorni")

**Perché questa implementazione:**
- **Visibilità:** Streak prominenti motivano
- **Milestone:** Obiettivi intermedi aumentano engagement
- **Record:** Competizione con se stessi

---

## 6. Body Tracking

### 6.1 Panoramica

Il modulo Body Tracking permette all'utente di tracciare peso, circonferenze e foto progresso.

### 6.5 Advanced Body Analysis & Visualization

#### 6.5.1 Visual Body Analysis (SVG Avatar)

**Descrizione:** Generazione dinamica di un avatar SVG basato sulle misurazioni dell'utente.

**Logica:**
- Mappatura misurazioni -> path SVG
- Color coding basato su deviazione da target (Verde=Optimal, Ambra=Warning, Blu=Under)
- Viste multiple: Front, Side

**Perché questa implementazione:**
- **Feedback Visivo:** Utente visualizza proporzioni in modo intuitivo
- **Motivazione:** Color coding evidenzia aree di miglioramento

#### 6.5.2 Target Calculations

**Descrizione:** Calcolo target ideali basati su algoritmi scientifici.

**Algoritmi Supportati:**
1. **Casey Butt Formula:**
   - Input: Circonferenza polso, caviglia, altezza
   - Output: Max potenziale muscolare per ogni parte
   - Base scientifica: Analisi scheletrica

2. **Golden Ratio (Adonis Index):**
   - Input: Vita, Spalle
   - Target: Spalle = 1.618 * Vita
   - Base estetica: V-Taper ideale

**API Endpoint:**
```
GET /body-metrics/analysis?method=casey_butt
```

#### 6.5.3 Expanded Metrics

**Descrizione:** Supporto per metriche antropometriche dettagliate.

**Nuove Metriche:**
- Lunghezze: Torso, Braccio, Gamba, Collo
- Scheletro: Polso, Caviglia (per calcoli Casey Butt)
- Dettaglio: Avambraccio, Polpaccio, Collo

**Validazione:**
- Range specifici per ogni nuova metrica (es. Polso 10-30cm)

### 6.2 Peso Corporeo

#### 6.2.1 Inserimento Peso

**Descrizione:** L'utente inserisce il proprio peso.

**Flusso:**
1. Utente naviga a "My Body" → "Peso"
2. Clicca "Aggiungi Peso"
3. Dialog con input peso e data
4. Backend salva misurazione
5. Frontend aggiorna grafico

**Validazione:**
- Peso: 20-300 kg (metric) o 44-660 lbs (imperial)
- Data: non futuro, non più vecchia di 1 anno
- Unicità: un peso per giorno (ultimo inserito vince)

**API Endpoint:**
```
POST /body-metrics/weight
Body: {
  value: number,
  unit: 'kg' | 'lbs',
  date: string (ISO date)
}
```

**Perché questa implementazione:**
- **Unicità Giornaliera:** Previene duplicati, semplifica analisi
- **Validazione Range:** Previene errori di input
- **Unità:** Supporta metric e imperial

#### 6.2.2 Grafico Peso

**Descrizione:** Grafico che mostra trend peso nel tempo.

**Visualizzazione:**
- Line chart con punti per ogni misurazione
- Media mobile 7 giorni (opzionale)
- Periodi: 1 mese, 3 mesi, 6 mesi, 1 anno, tutto

**Calcoli:**
- Trend: regressione lineare
- Variazione: percentuale cambio periodo
- Media: peso medio periodo

**Perché questa implementazione:**
- **Trend:** Utente vede progresso visivamente
- **Media Mobile:** Riduce rumore, mostra trend reale
- **Metriche:** Numeri concreti oltre al grafico

### 6.3 Circonferenze

#### 6.3.1 Inserimento Circonferenze

**Descrizione:** L'utente inserisce circonferenze corporee.

**Tipi Circonferenze:**
- Collo
- Petto
- Vita
- Fianchi
- Coscia
- Braccio

**Flusso:**
1. Utente clicca "Aggiungi Misurazione"
2. Dialog con input per ogni tipo circonferenza
3. Data misurazione
4. Backend salva tutte le misurazioni
5. Frontend aggiorna grafici

**Validazione:**
- Valore: 10-200 cm (metric) o 4-80 inches (imperial)
- Data: non futuro
- Unicità: una misurazione per tipo per giorno

**Perché questa implementazione:**
- **Multipli Tipi:** Tracking completo per bodybuilding
- **Batch Input:** Utente inserisce tutte le misure insieme
- **Unicità:** Previene duplicati

#### 6.3.2 Grafici Circonferenze

**Descrizione:** Grafici per ogni tipo circonferenza.

**Visualizzazione:**
- Line chart per tipo
- Multi-line chart per confronto (opzionale)
- Periodi: 1 mese, 3 mesi, 6 mesi, 1 anno

**Perché questa implementazione:**
- **Separati:** Ogni tipo ha proprio grafico per chiarezza
- **Confronto:** Multi-line per vedere correlazioni
- **Flessibilità:** Periodi multipli per analisi diverse

### 6.4 Foto Progresso

#### 6.4.1 Upload Foto

**Descrizione:** L'utente carica foto progresso.

**Flusso:**
1. Utente clicca "Aggiungi Foto"
2. File picker o drag & drop
3. Frontend mostra preview
4. Utente seleziona vista (Front, Side, Back) e data
5. Backend salva su S3
6. Frontend aggiorna gallery

**Validazione:**
- Formato: JPG, PNG
- Dimensione: max 10 MB
- Dimensioni: min 500x500px

**Storage:**
- S3: `rapranger-user-files-prod/photos/{userId}/progress/`
- Nome: `{date}_{view}.{ext}`

**Perché questa implementazione:**
- **Viste Multiple:** Front/Side/Back per tracking completo
- **Data:** Permette confronto temporale
- **Storage:** S3 scalabile e duraturo

#### 6.4.2 Gallery Foto

**Descrizione:** Grid di foto progresso organizzate per data.

**Layout:**
- Grid responsive (3 colonne desktop, 2 tablet, 1 mobile)
- Ordinamento: data (recente/primo)
- Filtro: per vista (Front, Side, Back, Tutte)

**Azioni:**
- Click foto: modal con foto ingrandita
- Confronto: seleziona 2 foto per confronto side-by-side
- Delete: elimina foto

**Perché questa implementazione:**
- **Grid:** Mostra molte foto contemporaneamente
- **Confronto:** Feature chiave per vedere progresso
- **Filtri:** Utente trova rapidamente foto specifiche

---

## 7. Integrazioni Esterne

### 7.1 Panoramica

Il modulo Integrazioni Esterne permette sincronizzazione con servizi terzi (Apple Health, Garmin, Strava, etc.).

### 7.2 Connessione Servizi

#### 7.2.1 OAuth Flow

**Descrizione:** L'utente connette account esterno tramite OAuth.

**Flusso:**
1. Utente naviga a "Settings" → "Data Sources"
2. Clicca "Connetti" su servizio
3. Redirect a pagina OAuth servizio esterno
4. Utente autorizza accesso
5. Redirect back con authorization code
6. Backend scambia code per access token
7. Backend salva token (criptato) e status connessione
8. Frontend mostra status "Connected"

**Servizi Supportati (MVP):**
- Strava (OAuth 2.0)
- Garmin Connect API (OAuth 2.0)

**Servizi Futuri:**
- Apple Health (solo mobile, non web)
- Google Fit (OAuth 2.0)
- Whoop (API)
- Oura (API)

**Perché questa implementazione:**
- **OAuth Standard:** Sicuro, standard industry
- **Token Criptati:** Sicurezza dati utente
- **Limitato MVP:** Focus su servizi più comuni

#### 7.2.2 Sincronizzazione Dati

**Descrizione:** Sistema sincronizza dati da servizi esterni.

**Tipi Dati Sincronizzati:**
- Heart Rate: frequenza cardiaca durante workout
- Steps: passi giornalieri
- Calories: calorie bruciate
- Sleep: dati sonno (se disponibile)

**Frequenza:**
- Manuale: utente clicca "Sync Now"
- Automatica: ogni 24 ore (background job)

**Flusso:**
1. Backend recupera access token (decriptato)
2. Chiama API servizio esterno
3. Parsing e normalizzazione dati
4. Salvataggio in database
5. Aggiornamento timestamp ultima sync

**Perché questa implementazione:**
- **Manuale + Automatica:** Flessibilità per utente
- **Normalizzazione:** Dati uniformi indipendentemente da fonte
- **Timestamp:** Traccia ultima sync per debugging

### 7.3 Disconnessione

#### 7.3.1 Rimozione Connessione

**Descrizione:** L'utente disconnette un servizio.

**Flusso:**
1. Utente clicca "Disconnetti" su servizio
2. Dialog conferma
3. Backend:
   - Revoca token (se API supporta)
   - Elimina token da database
   - Aggiorna status a "Disconnected"
4. Frontend aggiorna UI

**Dati:**
- Dati già sincronizzati rimangono (storico)
- Solo nuova sincronizzazione interrotta

**Perché questa implementazione:**
- **Storico:** Mantiene dati già importati
- **Revoca:** Revoca token per sicurezza
- **Reversibile:** Utente può riconnettere dopo

---

## 8. Conclusioni

Questo documento descrive tutte le funzionalità principali dell'applicazione RapRanger Web. Ogni funzionalità include:

- **Descrizione:** Cosa fa la funzionalità
- **Flusso:** Come funziona passo-passo
- **Validazione:** Regole di validazione
- **API:** Endpoint e struttura dati
- **Perché:** Motivazioni delle scelte implementative

**Prossimi Passi:**
1. Priorità funzionalità per MVP
2. Implementazione feature core
3. Testing end-to-end
4. Iterazione basata su feedback

---

## 9. Riferimenti

- **Documento High-Level:** `1_HIGH_LEVEL_ANALYSIS.md`
- **Documento Architettura Software:** `3_SOFTWARE_ARCHITECTURE.md`
- **Documento Database:** `5_DB_ARCHITECTURE.md`
- **Documento Frontend:** `6_FRONTEND_INTERFACE.md`
- **Regole Mobile:** `RapRanger/docs/rules_*.md`

---

**Approvato da:** _________________  
**Data Approvazione:** _________________

