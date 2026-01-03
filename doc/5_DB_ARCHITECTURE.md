# Architettura Database - RapRanger Web App

**Versione:** 1.0.0  
**Data Ultima Revisione:** 2024-12-19  
**Autore:** Team RapRanger

---

## 1. Introduzione

Questo documento descrive l'architettura completa del database PostgreSQL per la Web App RapRanger, includendo lo schema completo, il mapping da SQLite (Drift) a PostgreSQL, strategie di indicizzazione, migrazioni e compliance.

### 1.1 Scopo del Documento

- Definire schema completo del database PostgreSQL
- Mappare tabelle da SQLite (Drift) a PostgreSQL
- Specificare strategie di indicizzazione per performance
- Descrivere sistema di migrazioni e versioning
- Stabilire procedure di backup e compliance

### 1.2 Principi Guida

- **Normalizzazione:** 3NF (Third Normal Form) per ridurre ridondanza
- **Performance:** Indici strategici per query frequenti
- **Scalabilità:** Schema progettato per crescita futura
- **Compliance:** Audit logging e tracciabilità completa
- **Sicurezza:** Encryption at-rest, access control granulare

---

## 2. Panoramica Schema

### 2.1 Moduli Principali

Il database è organizzato in moduli funzionali:

1. **Authentication & Users:** Utenti e autenticazione
2. **Workout Programs:** Programmi di allenamento
3. **Workout Logging:** Logging workout attivi
4. **Progress Tracking:** Metriche e analisi progresso
5. **Body Tracking:** Misurazioni corporee
6. **Integrations:** Integrazioni servizi esterni
7. **Audit:** Logging audit per compliance

### 2.2 Diagramma ER (Entity-Relationship)

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
┌──────▼──────────┐              ┌──────────▼──────────┐
│ User Profiles   │              │  Workout Programs  │
└─────────────────┘              └──────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │   Microcycles    │
                                    └────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │    Sessions      │
                                    └────────┬─────────┘
                                             │
                                    ┌────────▼──────────────┐
                                    │  Active Workouts       │
                                    └────────┬──────────────┘
                                             │
                                    ┌────────▼──────────────┐
                                    │   Workout Set Logs    │
                                    └───────────────────────┘
                                             │
                                    ┌────────▼──────────────┐
                                    │  Progress Metrics    │
                                    └──────────────────────┘
```

---

## 3. Schema Dettagliato

### 3.1 Modulo: Authentication & Users

#### 3.1.1 Tabella: `users`

**Descrizione:** Tabella principale utenti per autenticazione.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);
```

**Mapping da Mobile:**
- Mobile usa `AuthService` con SharedPreferences per user ID locale
- Web richiede tabella `users` per autenticazione server-side

**Perché questa struttura:**
- **UUID:** Identificatori univoci globali, sicuri
- **Email Unica:** Previene duplicati, usata come username
- **Tokens:** Supporto email verification e password reset
- **Timestamps:** Tracciabilità creazione e aggiornamento

#### 3.1.2 Tabella: `user_profiles`

**Descrizione:** Profilo utente con informazioni personali e atleta.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    height_cm INTEGER CHECK (height_cm >= 100 AND height_cm <= 250),
    photo_uri TEXT,
    athlete_level VARCHAR(50) CHECK (athlete_level IN ('beginner', 'intermediate', 'advanced', 'competitive')),
    weekly_volume_hours DECIMAL(4,2),
    training_focus JSONB,
    training_locations JSONB,
    meals_per_day VARCHAR(20),
    meal_timing VARCHAR(20),
    macro_tracking VARCHAR(20),
    supplements VARCHAR(20),
    training_log VARCHAR(20),
    heart_rate_monitoring VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

**Mapping da Mobile:**
- Mobile: `UserProfile` entity in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **One-to-One:** Un profilo per utente (UNIQUE constraint)
- **JSONB:** Campi flessibili (training_focus, training_locations) per array
- **CHECK Constraints:** Validazione a livello database
- **CASCADE:** Eliminazione automatica profilo se utente eliminato

#### 3.1.3 Tabella: `user_settings`

**Descrizione:** Impostazioni applicazione e preferenze utente.

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'it' CHECK (language IN ('it', 'en')),
    units VARCHAR(20) DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
    feature_level VARCHAR(20) DEFAULT 'advanced' CHECK (feature_level IN ('basic', 'advanced')),
    haptic_feedback BOOLEAN DEFAULT TRUE,
    sound_feedback BOOLEAN DEFAULT TRUE,
    auto_sync BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Mapping da Mobile:**
- Mobile: `UserSettings` entity in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **One-to-One:** Una configurazione per utente
- **Defaults Sensati:** Valori di default per UX migliore
- **CHECK Constraints:** Validazione enum a livello database

### 3.2 Modulo: Workout Programs

#### 3.2.1 Tabella: `workout_programs`

**Descrizione:** Programmi di allenamento completi.

```sql
CREATE TABLE workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL CHECK (duration_weeks >= 1 AND duration_weeks <= 52),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    version INTEGER NOT NULL DEFAULT 1,
    author VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_programs_user_id ON workout_programs(user_id);
CREATE INDEX idx_workout_programs_status ON workout_programs(status);
CREATE INDEX idx_workout_programs_user_status ON workout_programs(user_id, status);
```

**Mapping da Mobile:**
- Mobile: `Programs` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **User Isolation:** Ogni utente vede solo i propri programmi
- **Status Index:** Query frequenti per status (active, draft)
- **Composite Index:** Query comuni filtrano per user + status
- **Versioning:** Supporto versioni per storico

#### 3.2.2 Tabella: `microcycles`

**Descrizione:** Microcicli (1-4 settimane) all'interno di programmi.

```sql
CREATE TABLE microcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    duration_weeks INTEGER NOT NULL CHECK (duration_weeks >= 1 AND duration_weeks <= 4),
    order_index INTEGER NOT NULL,
    objectives TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, order_index)
);

CREATE INDEX idx_microcycles_program_id ON microcycles(program_id);
CREATE INDEX idx_microcycles_program_order ON microcycles(program_id, order_index);
```

**Mapping da Mobile:**
- Mobile: `Microcycles` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **CASCADE:** Eliminazione automatica se programma eliminato
- **UNIQUE Constraint:** Un solo microciclo per ordine in programma
- **Composite Index:** Query ordinate per programma

#### 3.2.3 Tabella: `workout_sessions`

**Descrizione:** Sessioni di allenamento all'interno di microcicli.

```sql
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microcycle_id UUID NOT NULL REFERENCES microcycles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    order_index INTEGER NOT NULL,
    estimated_duration_minutes INTEGER,
    notes TEXT,
    exercise_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'paused', 'completed', 'skipped', 'archived')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_sessions_microcycle_id ON workout_sessions(microcycle_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_workout_sessions_microcycle_order ON workout_sessions(microcycle_id, order_index);
CREATE INDEX idx_workout_sessions_exercise_ids ON workout_sessions USING GIN(exercise_ids);
```

**Mapping da Mobile:**
- Mobile: `Sessions` table in Drift
- Campi identici, mapping diretto
- `exercise_ids`: Array JSON in mobile, JSONB in PostgreSQL

**Perché questa struttura:**
- **JSONB:** Array esercizi flessibile, queryable con GIN index
- **Status Index:** Query frequenti per sessioni in corso
- **GIN Index:** Ricerca veloce esercizi in array JSONB

### 3.3 Modulo: Workout Logging

#### 3.3.1 Tabella: `active_workout_sessions`

**Descrizione:** Sessioni di workout attualmente in corso.

```sql
CREATE TABLE active_workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(20) NOT NULL CHECK (state IN ('preparing', 'active', 'paused', 'completed')),
    exercise_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_exercise_index INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    paused_at TIMESTAMP,
    completed_at TIMESTAMP,
    total_pause_seconds INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_active_workout_sessions_user_id ON active_workout_sessions(user_id);
CREATE INDEX idx_active_workout_sessions_state ON active_workout_sessions(state);
CREATE INDEX idx_active_workout_sessions_user_state ON active_workout_sessions(user_id, state);
```

**Mapping da Mobile:**
- Mobile: `ActiveWorkoutSessions` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **User Isolation:** Ogni utente ha solo una sessione attiva
- **State Index:** Query frequenti per sessioni attive
- **SET NULL:** Se sessione eliminata, mantiene storico workout attivo

#### 3.3.2 Tabella: `workout_set_logs`

**Descrizione:** Serie loggate durante workout attivi.

```sql
CREATE TABLE workout_set_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_workout_session_id UUID NOT NULL REFERENCES active_workout_sessions(id) ON DELETE CASCADE,
    exercise_id VARCHAR(255) NOT NULL,
    set_number INTEGER NOT NULL CHECK (set_number >= 1),
    weight_kg DECIMAL(6,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 500),
    reps INTEGER NOT NULL CHECK (reps >= 1 AND reps <= 100),
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    feedback VARCHAR(20) CHECK (feedback IN ('easy', 'good', 'hard', 'failure')),
    notes VARCHAR(255),
    photo_uri TEXT,
    is_pr BOOLEAN NOT NULL DEFAULT FALSE,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_weight_reps CHECK (weight_kg > 0 AND reps >= 1)
);

CREATE INDEX idx_workout_set_logs_active_session ON workout_set_logs(active_workout_session_id);
CREATE INDEX idx_workout_set_logs_exercise_id ON workout_set_logs(exercise_id);
CREATE INDEX idx_workout_set_logs_logged_at ON workout_set_logs(logged_at);
CREATE INDEX idx_workout_set_logs_is_pr ON workout_set_logs(is_pr) WHERE is_pr = TRUE;
```

**Mapping da Mobile:**
- Mobile: `WorkoutSetLogs` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **CHECK Constraints:** Validazione a livello database
- **Partial Index:** Indice PR solo per PR=true (più efficiente)
- **Timestamp Index:** Query per data (analisi trend)

#### 3.3.3 Tabella: `workout_recovery_snapshots`

**Descrizione:** Snapshot criptati per crash recovery.

```sql
CREATE TABLE workout_recovery_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_workout_session_id UUID NOT NULL REFERENCES active_workout_sessions(id) ON DELETE CASCADE,
    encrypted_session_data BYTEA NOT NULL,
    encrypted_overlay_state BYTEA NOT NULL,
    encrypted_timer_state BYTEA NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    encryption_salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_recovery_snapshots_active_session ON workout_recovery_snapshots(active_workout_session_id);
CREATE INDEX idx_workout_recovery_snapshots_created_at ON workout_recovery_snapshots(created_at);
```

**Mapping da Mobile:**
- Mobile: `WorkoutRecoverySnapshots` table in Drift
- Mobile usa BlobColumn, PostgreSQL usa BYTEA (equivalente)

**Perché questa struttura:**
- **BYTEA:** Supporto dati binari criptati
- **Checksum:** Verifica integrità dati
- **Salt:** Sicurezza encryption (salt unico per snapshot)

### 3.4 Modulo: Progress Tracking

#### 3.4.1 Tabella: `progress_metrics`

**Descrizione:** Metriche di progresso (e1RM, volume, consistency, etc.).

```sql
CREATE TABLE progress_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    metadata JSONB,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_metrics_user_id ON progress_metrics(user_id);
CREATE INDEX idx_progress_metrics_exercise_id ON progress_metrics(exercise_id);
CREATE INDEX idx_progress_metrics_timestamp ON progress_metrics(timestamp);
CREATE INDEX idx_progress_metrics_user_exercise_time ON progress_metrics(user_id, exercise_id, timestamp);
```

**Mapping da Mobile:**
- Mobile: `ProgressMetrics` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **Composite Index:** Query comuni filtrano per user + exercise + time
- **Timestamp Index:** Query per range temporali (grafici)
- **JSONB Metadata:** Dati flessibili per metriche diverse

#### 3.4.2 Tabella: `progress_insights`

**Descrizione:** Insights generati automaticamente dal sistema.

```sql
CREATE TABLE progress_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    data JSONB,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (confidence >= 0 AND confidence <= 1),
    expires_at TIMESTAMP,
    tags JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMP
);

CREATE INDEX idx_progress_insights_user_id ON progress_insights(user_id);
CREATE INDEX idx_progress_insights_acknowledged ON progress_insights(acknowledged) WHERE acknowledged = FALSE;
CREATE INDEX idx_progress_insights_severity ON progress_insights(severity);
CREATE INDEX idx_progress_insights_created_at ON progress_insights(created_at);
```

**Mapping da Mobile:**
- Mobile: `ProgressInsights` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **Partial Index:** Solo insights non acknowledged (query frequente)
- **Severity Index:** Filtri per priorità
- **Expires At:** Insights temporanei (es. "Hai saltato 3 workout")

#### 3.4.3 Tabella: `progress_reports`

**Descrizione:** Report generati (settimanale, mensile, custom).

```sql
CREATE TABLE progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('weekly', 'monthly', 'custom')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'csv', 'json')),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    data JSONB NOT NULL,
    template_id VARCHAR(255),
    customizations JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    generated_at TIMESTAMP,
    file_path TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_reports_user_id ON progress_reports(user_id);
CREATE INDEX idx_progress_reports_status ON progress_reports(status);
CREATE INDEX idx_progress_reports_period ON progress_reports(period_start, period_end);
```

**Mapping da Mobile:**
- Mobile: `ProgressReports` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **Status Index:** Query per report in generazione
- **Period Index:** Query per range temporali
- **File Path:** Riferimento a file S3

#### 3.4.4 Tabella: `progress_streaks`

**Descrizione:** Streak tracking (workout, program, PR, volume).

```sql
CREATE TABLE progress_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('workout', 'program', 'pr', 'volume')),
    current_count INTEGER NOT NULL DEFAULT 0,
    max_count INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    milestones JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, type)
);

CREATE INDEX idx_progress_streaks_user_id ON progress_streaks(user_id);
CREATE INDEX idx_progress_streaks_type ON progress_streaks(type);
CREATE INDEX idx_progress_streaks_active ON progress_streaks(user_id, is_active) WHERE is_active = TRUE;
```

**Mapping da Mobile:**
- Mobile: `ProgressStreaks` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **UNIQUE Constraint:** Un solo streak per tipo per utente
- **Partial Index:** Solo streak attivi (query frequente)
- **Milestones JSONB:** Array flessibile milestone raggiunte

#### 3.4.5 Tabella: `kpi_configurations`

**Descrizione:** Configurazioni KPI personalizzabili.

```sql
CREATE TABLE kpi_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    formula JSONB NOT NULL,
    display_settings JSONB NOT NULL,
    thresholds JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kpi_configurations_user_id ON kpi_configurations(user_id);
CREATE INDEX idx_kpi_configurations_active ON kpi_configurations(user_id, is_active) WHERE is_active = TRUE;
```

**Mapping da Mobile:**
- Mobile: `KPIConfigurations` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **JSONB Formula:** Formula flessibile per KPI diversi
- **Partial Index:** Solo KPI attivi (query frequente)

### 3.5 Modulo: Body Tracking

#### 3.5.1 Tabella: `body_metrics`

**Descrizione:** Misurazioni corporee (peso, circonferenze).

```sql
CREATE TABLE body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('weight', 'neck', 'chest', 'waist', 'hips', 'thigh', 'arm')),
    value DECIMAL(6,2) NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'lbs', 'cm', 'inches')),
    measured_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, metric_type, DATE(measured_at))
);

CREATE INDEX idx_body_metrics_user_id ON body_metrics(user_id);
CREATE INDEX idx_body_metrics_type ON body_metrics(metric_type);
CREATE INDEX idx_body_metrics_measured_at ON body_metrics(measured_at);
CREATE INDEX idx_body_metrics_user_type_time ON body_metrics(user_id, metric_type, measured_at);
```

**Mapping da Mobile:**
- Mobile: `BodyMetrics` table in Drift (struttura simile)
- Unificazione: Mobile ha tabelle separate, web unifica in una tabella

**Perché questa struttura:**
- **Unificazione:** Una tabella per tutte le metriche, più flessibile
- **UNIQUE Constraint:** Una misurazione per tipo per giorno
- **Composite Index:** Query comuni filtrano per user + type + time

#### 3.5.2 Tabella: `body_photos`

**Descrizione:** Foto progresso corporeo.

```sql
CREATE TABLE body_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_uri TEXT NOT NULL,
    view_type VARCHAR(20) NOT NULL CHECK (view_type IN ('front', 'side', 'back')),
    taken_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_body_photos_user_id ON body_photos(user_id);
CREATE INDEX idx_body_photos_taken_at ON body_photos(taken_at);
CREATE INDEX idx_body_photos_view_type ON body_photos(view_type);
CREATE INDEX idx_body_photos_user_time ON body_photos(user_id, taken_at);
```

**Mapping da Mobile:**
- Mobile: `BodyPhotos` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **View Type:** Filtri per vista (front/side/back)
- **Timestamp Index:** Ordinamento cronologico

### 3.6 Modulo: Integrations

#### 3.6.1 Tabella: `data_sources`

**Descrizione:** Connessioni a servizi esterni.

```sql
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('apple_health', 'google_fit', 'garmin', 'strava', 'whoop', 'oura', 'strong', 'hevy', 'zwift', 'nike_run', 'nike_training', 'polar', 'fitbod', 'jefit')),
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected')),
    synced_data JSONB,
    last_sync_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_name)
);

CREATE INDEX idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX idx_data_sources_service ON data_sources(service_name);
CREATE INDEX idx_data_sources_status ON data_sources(status);
```

**Mapping da Mobile:**
- Mobile: `DataSources` table in Drift
- Campi identici, mapping diretto

**Perché questa struttura:**
- **UNIQUE Constraint:** Una connessione per servizio per utente
- **Status Index:** Query per servizi connessi
- **Metadata JSONB:** Dati flessibili per servizi diversi

### 3.7 Modulo: Audit

#### 3.7.1 Tabella: `audit_events`

**Descrizione:** Logging audit per compliance.

```sql
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id UUID,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARNING', 'ERROR')),
    metadata JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX idx_audit_events_action ON audit_events(action);
CREATE INDEX idx_audit_events_entity ON audit_events(entity);
CREATE INDEX idx_audit_events_level ON audit_events(level);
```

**Mapping da Mobile:**
- Mobile: `AuditEvents` table in Drift
- Campi identici, mapping diretto
- Web aggiunge: `ip_address`, `user_agent` per sicurezza

**Perché questa struttura:**
- **Multiple Indexes:** Query frequenti per timestamp, user, action
- **IP Address:** Tracciabilità per sicurezza
- **JSONB Metadata:** Dati flessibili per eventi diversi

---

## 4. Strategie di Indicizzazione

### 4.1 Principi Generali

1. **Indici Primari:** Ogni tabella ha PRIMARY KEY (UUID con gen_random_uuid())
2. **Foreign Keys:** Indici automatici su foreign keys
3. **Query Frequenti:** Indici su colonne usate in WHERE, JOIN, ORDER BY
4. **Composite Indexes:** Per query che filtrano multiple colonne
5. **Partial Indexes:** Per query che filtrano su valori specifici (es. `WHERE is_active = TRUE`)

### 4.2 Indici Critici

#### 4.2.1 User Isolation

Tutte le tabelle con `user_id` hanno indice su `user_id` per isolamento dati.

**Perché:**
- Query più comuni filtrano per `user_id`
- Performance critica per multi-tenancy

#### 4.2.2 Timestamp Indexes

Tabelle con timestamp hanno indice su colonna timestamp per query temporali.

**Perché:**
- Grafici e analisi filtrano per range temporali
- Ordinamento cronologico frequente

#### 4.2.3 Status Indexes

Tabelle con status hanno indice su status per filtri frequenti.

**Perché:**
- Query comuni: "tutti i programmi attivi", "sessioni in corso"
- Partial indexes per valori specifici (es. `WHERE status = 'active'`)

### 4.3 JSONB Indexes

Tabelle con JSONB usano GIN indexes per ricerca veloce.

**Perché:**
- Query su array JSONB (es. `exercise_ids @> '["ex1"]'`)
- Performance critica per query complesse

---

## 5. Migrazioni

### 5.1 Sistema Migrazioni

**Tool:** TypeORM Migrations

**Perché TypeORM:**
- Integrazione nativa con NestJS
- Versionamento automatico
- Rollback support
- Type-safe migrations

### 5.2 Convenzioni Naming

**Formato:** `{timestamp}-{description}.ts`

**Esempio:**
```
1699123456789-CreateWorkoutProgramsTable.ts
1699123456790-AddIndexesToWorkoutPrograms.ts
```

**Perché:**
- Timestamp garantisce ordine esecuzione
- Descrizione chiara del contenuto

### 5.3 Processo Migrazione

1. **Sviluppo:** Creare migration file
2. **Test:** Eseguire su database test
3. **Review:** Code review migration
4. **Deploy:** Eseguire in staging, poi produzione
5. **Verifica:** Verificare migrazione completata

**Perché questo processo:**
- **Sicurezza:** Test preventivi prevengono errori produzione
- **Tracciabilità:** Review garantisce qualità
- **Rollback:** TypeORM supporta rollback se necessario

---

## 6. Backup e Disaster Recovery

### 6.1 Backup Strategy

**Automated Backups:**
- Daily: Backup completo alle 03:00 UTC
- Retention: 30 giorni
- Cross-Region: Monthly snapshots in region diversa

**Perché:**
- **RPO:** 24 ore (acceptable per dati non critici)
- **RTO:** <1 ora con Multi-AZ failover
- **Compliance:** Retention 30 giorni per audit

### 6.2 Point-in-Time Recovery

**RDS Feature:** Point-in-time recovery abilitato.

**Perché:**
- Recupero a qualsiasi punto nel tempo (fino a retention)
- Critico per data corruption recovery

### 6.3 Disaster Recovery Plan

**Scenario 1: Region Failure**
- Multi-AZ failover automatico
- RTO: <5 minuti

**Scenario 2: Complete Region Outage**
- Cross-region snapshot restore
- RTO: <2 ore (manuale)

**Scenario 3: Data Corruption**
- Point-in-time recovery
- RTO: <1 ora

---

## 7. Sicurezza

### 7.1 Encryption

**At-Rest:** RDS encryption abilitato (AES-256)

**In-Transit:** TLS 1.2+ obbligatorio

**Perché:**
- Compliance: Richiesto per ambienti industriali
- Sicurezza: Protezione dati sensibili

### 7.2 Access Control

**Database Users:**
- Application user: Solo SELECT, INSERT, UPDATE, DELETE
- Migration user: DDL permissions (solo per migrazioni)
- Read-only user: Solo SELECT (per analytics)

**Perché:**
- **Least Privilege:** Ogni user ha solo permessi necessari
- **Separazione:** Application non può modificare schema

### 7.3 Audit Logging

**Tutte le operazioni critiche loggate in `audit_events`.**

**Perché:**
- Compliance: Tracciabilità richiesta
- Security: Rilevamento attività sospette
- Debugging: Aiuta identificare problemi

---

## 8. Performance Optimization

### 8.1 Query Optimization

**Best Practices:**
- Usare EXPLAIN ANALYZE per query lente
- Evitare N+1 queries (usare JOIN o eager loading)
- Limitare risultati con LIMIT/OFFSET
- Usare paginazione cursor-based per grandi dataset

### 8.2 Connection Pooling

**Configurazione:**
- Pool size: 20 connections
- Max connections: 100
- Idle timeout: 10 minutes

**Perché:**
- **Performance:** Riutilizzo connessioni riduce overhead
- **Scalabilità:** Pool gestisce picchi di carico

### 8.3 Caching Strategy

**Application-Level:**
- Cache query frequenti (es. lista programmi utente)
- TTL: 5 minuti per dati dinamici
- Invalidation: Cache invalidation su update

**Perché:**
- **Performance:** Riduce carico database
- **UX:** Risposte più veloci per utente

---

## 9. Conclusioni

Lo schema database proposto fornisce:

1. **Scalabilità:** Schema progettato per crescita futura
2. **Performance:** Indici strategici per query frequenti
3. **Sicurezza:** Encryption, access control, audit logging
4. **Compliance:** Tracciabilità completa per ambienti industriali
5. **Manutenibilità:** Migrazioni versionate, documentazione completa

**Prossimi Passi:**
1. Creare migration iniziale con tutte le tabelle
2. Setup database staging
3. Test performance con dati realistici
4. Deploy produzione

---

## 10. Riferimenti

- **Documento High-Level:** `1_HIGH_LEVEL_ANALYSIS.md`
- **Documento Infrastruttura:** `2_INFRASTRUCTURE.md`
- **Documento Architettura Software:** `3_SOFTWARE_ARCHITECTURE.md`
- **TypeORM Documentation:** https://typeorm.io/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

---

**Approvato da:** _________________  
**Data Approvazione:** _________________

