# Interfaccia Frontend - RapRanger Web App

**Versione:** 1.0.0  
**Data Ultima Revisione:** 2024-12-19  
**Autore:** Team RapRanger

---

## 1. Introduzione

Questo documento descrive in dettaglio l'interfaccia utente della Web App RapRanger, includendo sitemap completa, descrizione pagina per pagina, componenti UI riutilizzabili, flussi utente e considerazioni di design.

### 1.1 Scopo del Documento

- Definire sitemap completa dell'applicazione
- Descrivere ogni pagina con funzionalità e layout
- Specificare componenti UI riutilizzabili
- Definire flussi utente e navigazione
- Stabilire principi di design e accessibilità

### 1.2 Principi Guida

- **Usabilità:** Interfaccia intuitiva, facile da usare
- **Performance:** Caricamento veloce, interazioni fluide
- **Accessibilità:** WCAG 2.1 AA compliance
- **Responsive:** Funziona su desktop, tablet, mobile
- **Consistenza:** Design system unificato

---

## 2. Sitemap

### 2.1 Struttura Navigazione

```
/ (Home/Dashboard)
├── /login
├── /register
├── /workout-programs
│   ├── /workout-programs (lista)
│   ├── /workout-programs/:id (dettaglio)
│   ├── /workout-programs/new (crea)
│   └── /workout-programs/:id/edit (modifica)
├── /workout-logging
│   ├── /workout-logging/active (workout attivo)
│   └── /workout-logging/history (storico)
├── /progress
│   ├── /progress/dashboard
│   ├── /progress/analytics
│   ├── /progress/insights
│   ├── /progress/reports
│   ├── /progress/streaks
│   └── /progress/coach-mode
├── /body
│   ├── /body/weight
│   ├── /body/circumferences
│   └── /body/photos
├── /profile
│   ├── /profile (visualizza)
│   ├── /profile/edit (modifica)
│   └── /settings
│       └── /settings/data-sources
└── /404 (not found)
```

### 2.2 Layout Principale

**Componente:** `AppLayout`

**Struttura:**
```
┌─────────────────────────────────────────┐
│           Header (AppBar)               │
│  Logo | Nav | Search | Profile Menu     │
├─────────────────────────────────────────┤
│                                         │
│           Main Content Area             │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│      Sidebar (opzionale, collassabile)  │
└─────────────────────────────────────────┘
```

**Perché questo layout:**
- **Header Fisso:** Navigazione sempre accessibile
- **Content Area:** Spazio massimo per contenuto
- **Sidebar Opzionale:** Non sempre visibile, riduce clutter

---

## 3. Pagine Principali

### 3.1 Home / Dashboard

**Route:** `/`

**Descrizione:** Dashboard principale con overview attività recenti e metriche chiave.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Welcome, [Nome Utente]                 │
├─────────────────────────────────────────┤
│  Quick Stats (4 cards)                  │
│  [Workout Oggi] [Streak] [Volume] [PR]   │
├─────────────────────────────────────────┤
│  Prossimo Workout                       │
│  [Card con dettagli workout programmato] │
├─────────────────────────────────────────┤
│  Attività Recenti                       │
│  [Lista ultimi 5 workout completati]    │
├─────────────────────────────────────────┤
│  Insights Recenti                       │
│  [Card con 3 insights più recenti]     │
└─────────────────────────────────────────┘
```

**Componenti:**
- `QuickStatsCard`: Card con metrica e icona
- `NextWorkoutCard`: Card con prossimo workout programmato
- `RecentActivityList`: Lista workout recenti
- `InsightsPreview`: Preview insights

**Funzionalità:**
- Click su workout: naviga a dettaglio
- Click su insight: naviga a insights page
- Refresh automatico ogni 5 minuti

**Perché questa struttura:**
- **Overview Rapida:** Utente vede tutto importante a colpo d'occhio
- **Azioni Rapide:** Accesso veloce a funzionalità principali
- **Motivazione:** Metriche positive motivano utente

### 3.2 Login

**Route:** `/login`

**Descrizione:** Pagina di autenticazione.

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [Logo]                     │
│                                         │
│         Login to RapRanger              │
│                                         │
│    Email: [________________]            │
│    Password: [____________]             │
│                                         │
│         [Login Button]                  │
│                                         │
│    Forgot Password? [Link]              │
│    Don't have an account? [Register]    │
│                                         │
└─────────────────────────────────────────┘
```

**Componenti:**
- `LoginForm`: Form con validazione
- `Input`: Componente input riutilizzabile
- `Button`: Componente button riutilizzabile

**Validazione:**
- Email: formato valido, required
- Password: minimo 8 caratteri, required
- Errori mostrati sotto ogni campo

**Funzionalità:**
- Submit: invia credenziali, mostra loading
- Success: redirect a dashboard
- Error: mostra messaggio errore
- "Remember me": opzionale, salva token più a lungo

**Perché questa struttura:**
- **Minimalista:** Focus su login, niente distrazioni
- **Validazione Client:** Feedback immediato
- **Error Handling:** Messaggi chiari per utente

### 3.3 Register

**Route:** `/register`

**Descrizione:** Pagina di registrazione nuovo utente.

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [Logo]                     │
│                                         │
│        Create Your Account              │
│                                         │
│    Name: [________________]            │
│    Email: [_______________]             │
│    Password: [__________]               │
│    Confirm Password: [____]            │
│                                         │
│    [ ] I agree to Terms & Conditions    │
│                                         │
│         [Create Account]               │
│                                         │
│    Already have an account? [Login]     │
│                                         │
└─────────────────────────────────────────┘
```

**Validazione:**
- Name: minimo 2 caratteri, required
- Email: formato valido, univoco, required
- Password: minimo 8 caratteri, 1 maiuscola, 1 numero, required
- Confirm Password: deve matchare password
- Terms: required (checkbox)

**Funzionalità:**
- Submit: crea account, mostra loading
- Success: redirect a onboarding o dashboard
- Error: mostra messaggio errore specifico

**Perché questa struttura:**
- **Semplice:** Solo campi essenziali
- **Sicurezza:** Password requirements chiari
- **UX:** Validazione real-time durante typing

### 3.4 Workout Programs List

**Route:** `/workout-programs`

**Descrizione:** Lista di tutti i programmi di allenamento dell'utente.

**Layout:**
```
┌─────────────────────────────────────────┐
│  My Workout Programs        [+ Create]   │
├─────────────────────────────────────────┤
│  [Filters] [Sort] [Search]              │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Program  │  │ Program  │            │
│  │ Card 1   │  │ Card 2   │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Program  │  │ Program  │            │
│  │ Card 3   │  │ Card 4   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

**Componenti:**
- `WorkoutProgramCard`: Card con info programma
- `FilterBar`: Filtri per status, sort, search
- `EmptyState`: Stato vuoto se nessun programma

**WorkoutProgramCard:**
```
┌─────────────────────────────┐
│  Program Name        [Menu]  │
│  Status Badge                │
│  Description text...         │
│  12 weeks • 3 microcycles    │
│  [View] [Edit] [Duplicate]  │
└─────────────────────────────┘
```

**Filtri:**
- Status: Tutti, Draft, Active, Paused, Completed, Archived
- Sort: Data creazione, Nome (A-Z, Z-A)
- Search: Ricerca per nome

**Funzionalità:**
- Click card: naviga a dettaglio
- Click "+ Create": naviga a crea programma
- Menu card: azioni (Edit, Duplicate, Delete, Activate)
- Filtri: aggiornano lista in real-time

**Perché questa struttura:**
- **Card Layout:** Più informazioni visibili rispetto a lista
- **Filtri:** Utente trova rapidamente programmi specifici
- **Azioni Rapide:** Menu per operazioni comuni

### 3.5 Workout Program Detail

**Route:** `/workout-programs/:id`

**Descrizione:** Dettaglio completo di un programma di allenamento.

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back    Program Name      [Edit]     │
├─────────────────────────────────────────┤
│  Status Badge | 12 weeks | Version 2   │
│  Description text...                    │
├─────────────────────────────────────────┤
│  Tabs: [Overview] [Schedule] [Progress] │
├─────────────────────────────────────────┤
│                                         │
│  [Content based on selected tab]       │
│                                         │
└─────────────────────────────────────────┘
```

**Tab Overview:**
- Informazioni generali programma
- Statistiche (workout completati, volume totale)
- Azioni (Activate, Pause, Archive)

**Tab Schedule:**
- Calendario settimanale con workout programmati
- Lista microcicli con sessioni
- Drag & drop per riordinare (opzionale)

**Tab Progress:**
- Grafico progresso volume nel tempo
- Metriche (consistency, adherence)
- Confronto con obiettivi

**Funzionalità:**
- Edit: naviga a edit page
- Activate: attiva programma (se draft)
- Pause: mette in pausa (se active)
- Archive: archivia (se completed/paused)

**Perché questa struttura:**
- **Tabs:** Organizza informazioni senza sovraccaricare
- **Overview:** Info essenziali sempre visibili
- **Schedule:** Visualizzazione chiara struttura programma

### 3.6 Create/Edit Workout Program

**Route:** `/workout-programs/new` o `/workout-programs/:id/edit`

**Descrizione:** Wizard multi-step per creare/modificare programma.

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back    Create Program    [Save]     │
├─────────────────────────────────────────┤
│  Step 1 of 4: Basic Info                │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]  │
├─────────────────────────────────────────┤
│                                         │
│  [Form fields for current step]        │
│                                         │
├─────────────────────────────────────────┤
│  [Previous]              [Next]        │
└─────────────────────────────────────────┘
```

**Steps:**
1. **Basic Info:** Nome, descrizione, durata
2. **Microcycles:** Aggiungi/rimuovi microcicli
3. **Sessions:** Per ogni microciclo, definisci sessioni
4. **Exercises:** Per ogni sessione, aggiungi esercizi

**Validazione:**
- Per step: valida prima di procedere
- Errori mostrati sotto campi
- Disabilita "Next" se step non valido

**Funzionalità:**
- Save Draft: salva come draft in qualsiasi momento
- Auto-save: salvataggio automatico ogni 30 secondi
- Preview: anteprima programma prima di salvare

**Perché questa struttura:**
- **Wizard:** Riduce complessità percepita
- **Steps:** Guida utente attraverso processo
- **Auto-save:** Previene perdita dati

### 3.7 Active Workout

**Route:** `/workout-logging/active`

**Descrizione:** Interfaccia per logging workout in tempo reale.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Workout Name              [Pause] [X]  │
│  Timer: 45:23                          │
├─────────────────────────────────────────┤
│  Exercise: Bench Press                 │
│  Set 3 of 4                            │
│                                         │
│  Weight: [100] kg  [+2.5] [-2.5]      │
│  Reps:   [8]        [+1]   [-1]        │
│  RPE:    [8.5]      [+0.5] [-0.5]     │
│                                         │
│  [Complete Set]                        │
├─────────────────────────────────────────┤
│  Completed Sets:                        │
│  • Set 1: 100kg x 8 @ 8.5 RPE          │
│  • Set 2: 100kg x 8 @ 9.0 RPE          │
├─────────────────────────────────────────┤
│  [Previous Exercise] [Next Exercise]   │
│  [Complete Workout]                     │
└─────────────────────────────────────────┘
```

**Componenti:**
- `WorkoutTimer`: Timer countdown recupero
- `SetInput`: Input per peso/reps/RPE
- `CompletedSetsList`: Lista serie completate
- `ExerciseNavigation`: Navigazione tra esercizi

**Funzionalità:**
- Auto-save: salvataggio ogni 10 secondi
- Warning: alert se utente tenta di chiudere tab
- PR Detection: badge "PR!" quando rilevato
- Timer: countdown automatico dopo serie

**Perché questa struttura:**
- **Focus:** Solo elementi essenziali per logging
- **Velocità:** Input rapidi con incrementi/decrementi
- **Feedback:** Serie completate visibili per riferimento

### 3.8 Progress Dashboard

**Route:** `/progress/dashboard`

**Descrizione:** Dashboard con KPI e metriche progresso.

**Layout:**
```
┌─────────────────────────────────────────┐
│  My Progress                            │
├─────────────────────────────────────────┤
│  KPI Cards (4)                          │
│  [Volume] [e1RM] [Consistency] [Streak] │
├─────────────────────────────────────────┤
│  Volume Trend (Last 3 Months)           │
│  [Line Chart]                          │
├─────────────────────────────────────────┤
│  Top Exercises by Volume                │
│  [Bar Chart]                           │
├─────────────────────────────────────────┤
│  Recent Insights                        │
│  [3 Insight Cards]                     │
└─────────────────────────────────────────┘
```

**Componenti:**
- `KPICard`: Card con metrica e trend
- `LineChart`: Grafico lineare trend
- `BarChart`: Grafico a barre
- `InsightCard`: Card con insight

**Funzionalità:**
- Period Selector: 1 week, 1 month, 3 months, 6 months, 1 year
- Refresh: aggiorna dati
- Click chart: naviga a analytics dettagliate

**Perché questa struttura:**
- **Overview:** Tutte le metriche importanti visibili
- **Visualizzazione:** Grafici più efficaci di tabelle
- **Actionable:** Insights con link a dettagli

### 3.9 Progress Analytics

**Route:** `/progress/analytics`

**Descrizione:** Analytics avanzate con filtri e grafici dettagliati.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Progress Analytics                     │
├─────────────────────────────────────────┤
│  [Filters: Exercise, Date Range, ...]  │
├─────────────────────────────────────────┤
│  Tab: [Volume] [e1RM] [Consistency]     │
├─────────────────────────────────────────┤
│                                         │
│  [Chart based on selected tab]         │
│                                         │
│  [Data Table with detailed metrics]    │
│                                         │
└─────────────────────────────────────────┘
```

**Filtri:**
- Exercise: seleziona esercizi specifici
- Date Range: periodo personalizzato
- Metric Type: Volume, e1RM, Consistency, etc.

**Tabs:**
- Volume: grafico volume nel tempo
- e1RM: grafico e1RM per esercizio
- Consistency: grafico adherence

**Funzionalità:**
- Export: download dati come CSV
- Compare: confronta periodi diversi
- Drill-down: click su punto grafico per dettagli

**Perché questa struttura:**
- **Flessibilità:** Filtri permettono analisi personalizzate
- **Tabs:** Organizza metriche diverse
- **Export:** Permette analisi esterne

### 3.10 Progress Insights

**Route:** `/progress/insights`

**Descrizione:** Lista insights generati automaticamente.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Progress Insights                      │
├─────────────────────────────────────────┤
│  [Filters: Type, Severity, Status]     │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐ │
│  │ [Badge] Insight Title              │ │
│  │ Description text...                │ │
│  │ Recommendation: ...                │ │
│  │ [Acknowledge] [Dismiss]           │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ [Badge] Insight Title              │ │
│  │ ...                                │ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Componenti:**
- `InsightCard`: Card con insight
- `FilterBar`: Filtri per tipo, severità, status

**Filtri:**
- Type: Tutti, Trend, Anomaly, Correlation, Recommendation
- Severity: Info, Warning, Critical
- Status: All, Unacknowledged, Acknowledged

**Funzionalità:**
- Acknowledge: marca come visto
- Dismiss: rimuove insight
- Click card: mostra dettagli completi

**Perché questa struttura:**
- **Organizzazione:** Filtri aiutano utente trovare insights rilevanti
- **Actionable:** Ogni insight ha raccomandazione
- **Gestione:** Utente controlla quali insights vedere

### 3.11 Body Tracking - Weight

**Route:** `/body/weight`

**Descrizione:** Tracking peso corporeo con grafico trend.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Body Weight Tracking        [+ Add]    │
├─────────────────────────────────────────┤
│  Current: 75.5 kg                       │
│  Trend: +0.3 kg this week              │
├─────────────────────────────────────────┤
│  Weight Trend (Last 3 Months)           │
│  [Line Chart with 7-day moving average] │
├─────────────────────────────────────────┤
│  Recent Measurements                    │
│  • Dec 19, 2024: 75.5 kg               │
│  • Dec 18, 2024: 75.2 kg               │
│  • Dec 17, 2024: 75.0 kg               │
└─────────────────────────────────────────┘
```

**Componenti:**
- `WeightChart`: Grafico lineare con media mobile
- `MeasurementList`: Lista misurazioni recenti
- `AddMeasurementDialog`: Dialog per aggiungere misurazione

**Funzionalità:**
- Add: dialog per inserire peso e data
- Edit: modifica misurazione esistente
- Delete: elimina misurazione
- Period Selector: 1 month, 3 months, 6 months, 1 year

**Perché questa struttura:**
- **Visualizzazione:** Grafico mostra trend chiaramente
- **Dettagli:** Lista mostra valori esatti
- **Azioni:** Accesso rapido a operazioni comuni

### 3.12 Body Tracking - Photos

**Route:** `/body/photos`

**Descrizione:** Gallery foto progresso organizzate per data.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Progress Photos             [+ Add]    │
├─────────────────────────────────────────┤
│  [Filter: All | Front | Side | Back]    │
├─────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │    │ │    │ │    │                  │
│  │Photo│ │Photo│ │Photo│                  │
│  │ 1  │ │  2  │ │  3  │                  │
│  └────┘ └────┘ └────┘                  │
│  ┌────┐ ┌────┐ ┌────┐                  │
│  │    │ │    │ │    │                  │
│  │Photo│ │Photo│ │Photo│                  │
│  │ 4  │ │  5  │ │  6  │                  │
│  └────┘ └────┘ └────┘                  │
└─────────────────────────────────────────┘
```

**Componenti:**
- `PhotoGrid`: Grid responsive di foto
- `PhotoCard`: Card con foto e metadata
- `PhotoComparisonModal`: Modal per confronto 2 foto

**Funzionalità:**
- Add: upload foto (file picker o drag & drop)
- Click foto: modal con foto ingrandita
- Compare: seleziona 2 foto per confronto side-by-side
- Delete: elimina foto
- Filter: filtra per vista (Front, Side, Back)

**Perché questa struttura:**
- **Grid:** Mostra molte foto contemporaneamente
- **Responsive:** Adatta a diverse dimensioni schermo
- **Confronto:** Feature chiave per vedere progresso

### 3.13 Profile

**Route:** `/profile`

**Descrizione:** Visualizzazione e modifica profilo utente.

**Layout:**
```
┌─────────────────────────────────────────┐
│  My Profile                  [Edit]     │
├─────────────────────────────────────────┤
│  [Profile Photo]                        │
│  Name: John Doe                         │
│  Email: john@example.com                │
├─────────────────────────────────────────┤
│  Athlete Profile                        │
│  Age: 30 | Gender: Male                │
│  Height: 180 cm                         │
│  Level: Intermediate                    │
├─────────────────────────────────────────┤
│  Training Preferences                    │
│  Weekly Volume: 8 hours                 │
│  Focus: Strength, Hypertrophy          │
└─────────────────────────────────────────┘
```

**Funzionalità:**
- Edit: naviga a edit page
- Change Photo: upload nuova foto profilo
- View Stats: link a statistiche personali

**Perché questa struttura:**
- **Organizzazione:** Sezioni chiare per tipo informazioni
- **Visualizzazione:** Foto profilo prominente
- **Azioni:** Edit accessibile ma non invasivo

### 3.14 Settings

**Route:** `/settings`

**Descrizione:** Impostazioni applicazione e account.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Settings                               │
├─────────────────────────────────────────┤
│  Account                                │
│  • Email                                │
│  • Change Password                      │
│  • Delete Account                       │
├─────────────────────────────────────────┤
│  Preferences                            │
│  • Language: [Italian ▼]               │
│  • Units: [Metric ▼]                   │
│  • Feature Level: [Advanced ▼]          │
├─────────────────────────────────────────┤
│  Notifications                          │
│  • Email Notifications: [Toggle]        │
│  • Push Notifications: [Toggle]         │
├─────────────────────────────────────────┤
│  Data Sources                           │
│  • [View Connected Services]            │
└─────────────────────────────────────────┘
```

**Sezioni:**
- Account: gestione account (email, password, delete)
- Preferences: preferenze app (lingua, unità, feature level)
- Notifications: impostazioni notifiche
- Data Sources: link a pagina integrazioni

**Funzionalità:**
- Save: salva modifiche
- Reset: ripristina defaults
- Delete Account: dialog conferma con password

**Perché questa struttura:**
- **Organizzazione:** Sezioni logiche per tipo impostazione
- **Accessibilità:** Toggle e dropdown per modifiche rapide
- **Sicurezza:** Delete account richiede conferma

---

## 4. Componenti UI Riutilizzabili

### 4.1 Design System

**Tokens:**
- **Colori:** Primary, Secondary, Tertiary, Neutral scale
- **Tipografia:** Font sizes, weights, line heights
- **Spacing:** 4px base unit (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Border Radius:** 4px, 8px, 12px, 16px
- **Shadows:** Elevation levels (0-24)

**Perché design system:**
- **Consistenza:** UI uniforme in tutta app
- **Manutenibilità:** Modifiche centralizzate
- **Velocità:** Sviluppo più veloce con componenti pronti

### 4.2 Componenti Base

#### 4.2.1 Button

**Varianti:**
- Primary: azione principale
- Secondary: azione secondaria
- Outline: azione terziaria
- Text: azione minimale

**Stati:**
- Default, Hover, Active, Disabled, Loading

**Perché:**
- **Chiarezza:** Varianti comunicano importanza azione
- **Accessibilità:** Stati chiari per feedback utente

#### 4.2.2 Input

**Tipi:**
- Text, Email, Password, Number, Date

**Stati:**
- Default, Focus, Error, Disabled

**Features:**
- Label, Placeholder, Helper text, Error message
- Icon prefix/suffix support

**Perché:**
- **UX:** Label e helper text guidano utente
- **Validazione:** Error messages chiari

#### 4.2.3 Card

**Varianti:**
- Default: card standard
- Elevated: card con shadow
- Outlined: card con border

**Perché:**
- **Gerarchia:** Varianti comunicano importanza
- **Consistenza:** Card uniformi in tutta app

#### 4.2.4 Modal

**Features:**
- Overlay scuro
- Close button (X)
- Escape key per chiudere
- Focus trap (accessibilità)

**Perché:**
- **Focus:** Focus trap mantiene focus dentro modal
- **UX:** Escape key per chiusura rapida

### 4.3 Componenti Feature-Specific

#### 4.3.1 WorkoutProgramCard

**Props:**
- program: WorkoutProgram
- onView: () => void
- onEdit: () => void
- onDuplicate: () => void
- onDelete: () => void

**Perché:**
- **Riusabilità:** Card usata in lista e altri contesti
- **Azioni:** Props per gestire azioni

#### 4.3.2 ProgressChart

**Props:**
- data: ChartData[]
- type: 'line' | 'bar'
- period: DateRange

**Perché:**
- **Flessibilità:** Supporta diversi tipi grafico
- **Riusabilità:** Usato in multiple pagine

---

## 5. Flussi Utente

### 5.1 Onboarding (Primo Accesso)

**Flusso:**
1. Register → Crea account
2. Welcome Screen → Benvenuto
3. Profile Setup → Completa profilo base
4. Tutorial → Quick tour funzionalità principali
5. Dashboard → Primo accesso dashboard

**Perché:**
- **Guidato:** Utente non si perde
- **Completo:** Profilo completo da subito
- **Educativo:** Tutorial insegna funzionalità

### 5.2 Creazione Programma

**Flusso:**
1. Dashboard → Click "Create Program"
2. Wizard Step 1 → Info base
3. Wizard Step 2 → Microcicli
4. Wizard Step 3 → Sessioni
5. Wizard Step 4 → Esercizi
6. Review → Anteprima programma
7. Save → Salva come draft o attiva

**Perché:**
- **Wizard:** Riduce complessità
- **Review:** Utente verifica prima di salvare
- **Flessibilità:** Draft permette completare dopo

### 5.3 Workout Attivo

**Flusso:**
1. Dashboard → Click "Start Workout" su sessione programmata
2. Active Workout Page → Interfaccia logging
3. Per ogni esercizio:
   - Inserisci peso/reps/RPE
   - Click "Complete Set"
   - Timer countdown
   - Ripeti per tutte le serie
4. Click "Complete Workout"
5. Summary Page → Riepilogo workout
6. Dashboard → Ritorno a dashboard

**Perché:**
- **Lineare:** Flusso chiaro passo-passo
- **Feedback:** Timer e serie completate danno feedback
- **Summary:** Riepilogo motiva utente

---

## 6. Responsive Design

### 6.1 Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### 6.2 Adattamenti

**Mobile:**
- Single column layout
- Bottom navigation invece di sidebar
- Cards full-width
- Touch-friendly (min 44px tap targets)

**Tablet:**
- 2-column layout dove possibile
- Sidebar collassabile
- Cards in grid 2 colonne

**Desktop:**
- Multi-column layout
- Sidebar sempre visibile
- Cards in grid 3-4 colonne
- Hover states

**Perché:**
- **Usabilità:** Layout adattato a dimensione schermo
- **Performance:** Layout ottimizzato per ogni device

---

## 7. Accessibilità

### 7.1 WCAG 2.1 AA Compliance

**Requisiti:**
- Contrast ratio: minimo 4.5:1 per testo normale
- Touch targets: minimo 44x44px
- Keyboard navigation: tutte le funzionalità accessibili via tastiera
- Screen readers: ARIA labels e semantic HTML
- Focus indicators: focus visibile su tutti gli elementi interattivi

**Perché:**
- **Inclusività:** App accessibile a tutti
- **Compliance:** Richiesto per ambienti industriali
- **Legal:** Evita problemi legali

### 7.2 Implementazione

**Semantic HTML:**
- Usare tag HTML semantici (`<nav>`, `<main>`, `<article>`, etc.)
- Headings gerarchici (h1, h2, h3)

**ARIA:**
- `aria-label` per icone senza testo
- `aria-describedby` per helper text
- `aria-live` per aggiornamenti dinamici

**Keyboard:**
- Tab order logico
- Escape per chiudere modals
- Enter/Space per attivare buttons

**Perché:**
- **Screen Readers:** Supporto completo per screen readers
- **Keyboard:** Navigazione completa via tastiera

---

## 8. Performance

### 8.1 Ottimizzazioni

**Code Splitting:**
- Lazy loading routes
- Dynamic imports per componenti pesanti

**Caching:**
- TanStack Query cache per API calls
- Service Worker per asset statici

**Images:**
- Lazy loading immagini
- WebP format con fallback
- Responsive images (srcset)

**Perché:**
- **Fast Initial Load:** Code splitting riduce bundle iniziale
- **Fast Navigation:** Cache riduce chiamate API
- **Bandwidth:** Immagini ottimizzate riducono trasferimento dati

### 8.2 Metriche Target

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1

**Perché:**
- **UX:** Metriche basate su percezione utente
- **Industry Standard:** Metriche riconosciute (Core Web Vitals)

---

## 9. Conclusioni

L'interfaccia frontend proposta fornisce:

1. **Usabilità:** Interfaccia intuitiva e facile da usare
2. **Performance:** Caricamento veloce e interazioni fluide
3. **Accessibilità:** WCAG 2.1 AA compliance
4. **Responsive:** Funziona su tutti i dispositivi
5. **Consistenza:** Design system unificato

**Prossimi Passi:**
1. Setup progetto React con struttura cartelle
2. Implementazione design system
3. Sviluppo componenti base
4. Implementazione pagine principali
5. Testing e iterazione

---

## 10. Riferimenti

- **Documento High-Level:** `1_HIGH_LEVEL_ANALYSIS.md`
- **Documento Architettura Software:** `3_SOFTWARE_ARCHITECTURE.md`
- **Documento Specifiche Funzionalità:** `4_FEATURE_SPECS.md`
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **React Documentation:** https://react.dev/

---

**Approvato da:** _________________  
**Data Approvazione:** _________________

