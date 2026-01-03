# RapRanger Frontend

Frontend React + TypeScript + Vite per RapRanger.

## Prerequisiti

- Node.js >= 20
- npm o yarn

## Installazione

```bash
npm install
```

## Sviluppo

```bash
# Sviluppo con hot-reload
npm run dev

# Build produzione
npm run build

# Preview build produzione
npm run preview
```

## Configurazione

Crea un file `.env.local` per le variabili d'ambiente:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Docker

```bash
# Build immagine
docker build -t rapranger-frontend .

# Run container
docker run -p 80:80 rapranger-frontend
```

## Architettura

Il progetto segue Feature-Sliced Design:

```
src/
├── app/              # App-level configuration
│   ├── providers/    # React providers (Query, Auth, etc.)
│   └── router/       # Routing configuration
├── shared/           # Shared code
│   ├── ui/           # UI components riutilizzabili
│   ├── lib/          # Utilities e API client
│   └── hooks/        # Custom hooks
├── features/         # Feature modules
│   ├── workout-program/
│   ├── workout-logging/
│   └── ...
└── pages/            # Page components
```

## Tecnologie

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool veloce
- **React Router**: Routing
- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **Zod**: Schema validation

