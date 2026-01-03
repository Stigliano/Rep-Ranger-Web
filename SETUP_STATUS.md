# Stato Setup RepRanger - Ambiente Locale

## ✅ Completato

1. **File `.env` creato**: Il file `backend/.env` è stato creato correttamente con tutte le variabili d'ambiente necessarie per lo sviluppo locale.

2. **Script di setup creato**: Lo script `setup-local.ps1` è stato creato e configurato per automatizzare il setup completo.

## ⚠️ Prerequisiti Mancanti

Per completare il setup, è necessario installare i seguenti prerequisiti:

### Node.js >= 20
- **Stato**: Non trovato nel PATH
- **Download**: https://nodejs.org/
- **Verifica installazione**: Dopo l'installazione, apri un nuovo terminale e verifica con:
  ```powershell
  node --version
  npm --version
  ```

### Docker Desktop
- **Stato**: Non trovato nel PATH
- **Download**: https://www.docker.com/products/docker-desktop
- **Verifica installazione**: Dopo l'installazione, avvia Docker Desktop e verifica con:
  ```powershell
  docker --version
  ```

## 📋 Prossimi Passi

Una volta installati Node.js e Docker Desktop:

1. **Esegui lo script di setup**:
   ```powershell
   .\setup-local.ps1
   ```

   Lo script eseguirà automaticamente:
   - Verifica prerequisiti
   - Creazione file `.env` (già fatto)
   - Installazione dipendenze backend
   - Installazione dipendenze frontend
   - Avvio database PostgreSQL via Docker
   - Esecuzione migrazioni database

2. **Avvia l'applicazione**:

   **Terminale 1 - Backend:**
   ```powershell
   cd backend
   npm run start:dev
   ```

   **Terminale 2 - Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Verifica funzionamento**:
   - Backend API: http://localhost:3000/api
   - Frontend: http://localhost:5173
   - Health Check: http://localhost:3000/api/health

## 🔧 Setup Manuale (Alternativa)

Se preferisci eseguire i passaggi manualmente:

1. **Installa dipendenze backend**:
   ```powershell
   cd backend
   npm install
   ```

2. **Installa dipendenze frontend**:
   ```powershell
   cd frontend
   npm install
   ```

3. **Avvia database**:
   ```powershell
   docker-compose up -d postgres
   ```

4. **Esegui migrazioni**:
   ```powershell
   cd backend
   npm run migration:run
   ```

## 📝 Note

- Il file `.env` è già stato creato in `backend/.env`
- Le variabili d'ambiente sono configurate per lo sviluppo locale
- Il database PostgreSQL verrà avviato in un container Docker
- Le migrazioni creeranno automaticamente lo schema del database

## 🐛 Risoluzione Problemi

### Node.js non trovato
- Verifica che Node.js sia installato: `node --version`
- Riavvia il terminale dopo l'installazione
- Verifica che Node.js sia nel PATH di sistema

### Docker non trovato
- Verifica che Docker Desktop sia installato e avviato
- Riavvia Docker Desktop se necessario
- Verifica con: `docker ps`

### Errori durante npm install
- Elimina `node_modules` e `package-lock.json`
- Esegui nuovamente `npm install`

### Database non si avvia
- Verifica che Docker Desktop sia avviato
- Controlla i log: `docker-compose logs postgres`
- Riavvia il container: `docker-compose restart postgres`

### Errori migrazioni
- Verifica che il database sia avviato: `docker ps`
- Verifica connessione: `docker exec -it rapranger-db psql -U rapranger_app -d rapranger`

