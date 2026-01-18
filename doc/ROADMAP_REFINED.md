# RepRanger Feature Roadmap (Aggiornata)

## Obiettivo
Verificare, rifinire e completare le funzionalità core dell'applicazione ora che l'infrastruttura è stabile.

## Fase 1: Verifica e Stabilizzazione (Current)
Il codice per le feature core (Esercizi, Programmi, Active Workout) è presente. Bisogna verificare che funzioni come atteso in produzione.

### Attività
- [ ] **QA Manuale**: Eseguire un ciclo completo di allenamento (Crea Programma -> Avvia -> Logga -> Finisci).
- [ ] **Bug Fixing**: Risolvere eventuali errori emersi durante il QA.
- [ ] **Performance**: Verificare tempi di caricamento (soprattutto liste esercizi e programmi).

## Fase 2: Progress & Analytics (To Do)
Questa è l'area che necessita di più lavoro di implementazione ex-novo.

### Backend
- [ ] **Endpoint Statistiche**: Aggregazione dati per grafici (Volume per gruppo muscolare, Frequenza allenamenti).
- [ ] **Calcolo PR**: Logica per identificare e salvare i record personali.

### Frontend
- [ ] **Dashboard Home**: Sostituire i placeholder con widget reali.
- [ ] **Grafici**: Integrare libreria grafici (es. Recharts) per visualizzare l'andamento del volume/peso.
- [ ] **Storico Allenamenti**: Migliorare visualizzazione lista allenamenti passati (`WorkoutHistoryPage`).

## Fase 3: Body Tracking Avanzato
- [ ] **Grafici Misure**: Visualizzare andamento peso corporeo e misure.
- [ ] **Confronto Foto**: UI per confrontare foto "prima/dopo".

## Metodologia
1.  **Test in Produzione**: Usare l'ambiente live per verificare le feature esistenti.
2.  **Iterazione Rapida**: Fix immediati su piccoli bug.
3.  **Sviluppo Nuove Feature**: Branch dedicati per Analytics.
