# Architettura Software - RapRanger Web App

**Versione:** 1.0.0  
**Data Ultima Revisione:** 2024-12-19  
**Autore:** Team RapRanger

---

## 1. Introduzione

Questo documento definisce l'architettura software completa per la Web App RapRanger, includendo l'organizzazione del codice frontend (React) e backend (NestJS), pattern di design, gestione dello stato, sicurezza e best practices.

### 1.1 Scopo del Documento

- Definire l'architettura backend (NestJS) con pattern e convenzioni
- Definire l'architettura frontend (React) con organizzazione modulare
- Specificare gestione dello stato e comunicazione client-server
- Descrivere sicurezza e autenticazione
- Stabilire pattern di design e best practices

### 1.2 Principi Guida

- **Clean Architecture:** Separazione chiara tra layer (presentation, domain, data)
- **Feature-First:** Organizzazione per feature, non per tipo di file
- **Type Safety:** TypeScript ovunque per type safety end-to-end
- **Testabilità:** Codice modulare e testabile
- **Scalabilità:** Architettura pronta per crescita futura
- **Manutenibilità:** Codice leggibile, ben documentato, seguendo standard industriali

---

## 2. Architettura Backend (NestJS)

### 2.1 Panoramica Architetturale

L'architettura backend segue il pattern **Modular Monolith** con NestJS, organizzato per moduli funzionali. Ogni modulo rappresenta una feature completa (es. Workout Program, Progress Tracking).

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   │
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   ├── aws.config.ts
│   │   └── app.config.ts
│   │
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   │
│   ├── workout-program/           # Workout Program feature
│   │   ├── workout-program.module.ts
│   │   ├── workout-program.controller.ts
│   │   ├── workout-program.service.ts
│   │   ├── entities/
│   │   │   ├── workout-program.entity.ts
│   │   │   ├── microcycle.entity.ts
│   │   │   └── workout-session.entity.ts
│   │   ├── dto/
│   │   │   ├── create-workout-program.dto.ts
│   │   │   └── update-workout-program.dto.ts
│   │   └── repositories/
│   │       └── workout-program.repository.ts
│   │
│   ├── workout-logging/           # Active Workout Logging
│   │   ├── workout-logging.module.ts
│   │   ├── workout-logging.controller.ts
│   │   ├── workout-logging.service.ts
│   │   └── ...
│   │
│   ├── progress-tracking/         # Progress Tracking
│   │   ├── progress-tracking.module.ts
│   │   ├── progress-tracking.controller.ts
│   │   ├── progress-tracking.service.ts
│   │   └── ...
│   │
│   ├── body-tracking/             # Body Tracking
│   │   ├── body-tracking.module.ts
│   │   ├── body-tracking.controller.ts
│   │   ├── body-tracking.service.ts
│   │   └── ...
│   │
│   ├── profile/                   # User Profile
│   │   ├── profile.module.ts
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   └── ...
│   │
│   └── database/                 # Database module
│       ├── database.module.ts
│       ├── database.service.ts
│       └── migrations/
│
├── test/                          # E2E tests
│   ├── app.e2e-spec.ts
│   └── ...
│
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 2.2 Pattern: Controller-Service-Repository

**Pattern utilizzato:** Controller → Service → Repository → Database

**Perché questo pattern:**
- **Separazione Responsabilità:** Ogni layer ha una responsabilità chiara
- **Testabilità:** Facile mockare repository per test service
- **Riusabilità:** Service può essere riutilizzato da più controller
- **Manutenibilità:** Modifiche a un layer non impattano gli altri

**Esempio Implementazione:**

```typescript
// workout-program.controller.ts
@Controller('workout-programs')
@UseGuards(JwtAuthGuard)
export class WorkoutProgramController {
  constructor(
    private readonly workoutProgramService: WorkoutProgramService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<WorkoutProgramDto[]> {
    return this.workoutProgramService.findAll(user.id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgramDto> {
    return this.workoutProgramService.create(user.id, createDto);
  }
}

// workout-program.service.ts
@Injectable()
export class WorkoutProgramService {
  constructor(
    private readonly workoutProgramRepository: WorkoutProgramRepository,
    private readonly auditService: AuditService,
  ) {}

  async findAll(userId: string): Promise<WorkoutProgramDto[]> {
    const programs = await this.workoutProgramRepository.findByUserId(userId);
    return programs.map(p => this.toDto(p));
  }

  async create(
    userId: string,
    createDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgramDto> {
    // Business logic validation
    this.validateProgram(createDto);

    const program = await this.workoutProgramRepository.create({
      ...createDto,
      userId,
      status: ProgramStatus.DRAFT,
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: 'CREATE_WORKOUT_PROGRAM',
      entity: 'WorkoutProgram',
      entityId: program.id,
    });

    return this.toDto(program);
  }

  private validateProgram(dto: CreateWorkoutProgramDto): void {
    if (dto.durationWeeks < 1 || dto.durationWeeks > 52) {
      throw new BadRequestException('Duration must be between 1 and 52 weeks');
    }
    // ... altre validazioni
  }
}

// workout-program.repository.ts
@Injectable()
export class WorkoutProgramRepository {
  constructor(
    @InjectRepository(WorkoutProgramEntity)
    private readonly repository: Repository<WorkoutProgramEntity>,
  ) {}

  async findByUserId(userId: string): Promise<WorkoutProgramEntity[]> {
    return this.repository.find({
      where: { userId },
      relations: ['microcycles', 'microcycles.sessions'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<WorkoutProgramEntity>): Promise<WorkoutProgramEntity> {
    const program = this.repository.create(data);
    return this.repository.save(program);
  }
}
```

### 2.3 Database Layer: TypeORM

**Scelta:** TypeORM come ORM per PostgreSQL.

**Perché TypeORM:**
- **TypeScript First:** Scritto in TypeScript, type safety end-to-end
- **Decorators:** Sintassi dichiarativa con decoratori
- **Migrations:** Sistema di migrazioni integrato
- **Relations:** Gestione relazioni complesse
- **Query Builder:** Query builder potente per query complesse
- **Active Record / Data Mapper:** Supporta entrambi i pattern

**Alternativa Considerata: Prisma**
- **Scartata perché:** TypeORM è più maturo e integrato meglio con NestJS
- **Nota:** Prisma può essere considerato in futuro se necessario

**Esempio Entity:**

```typescript
// workout-program.entity.ts
@Entity('workout_programs')
export class WorkoutProgramEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  durationWeeks: number;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.DRAFT,
  })
  status: ProgramStatus;

  @Column()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MicrocycleEntity, microcycle => microcycle.program)
  microcycles: MicrocycleEntity[];
}
```

### 2.4 DTOs e Validazione

**Pattern:** DTOs (Data Transfer Objects) per validazione input/output.

**Perché DTOs:**
- **Validazione:** Validazione automatica con class-validator
- **Type Safety:** Type safety per API contracts
- **Documentazione:** Swagger/OpenAPI generation automatica
- **Sicurezza:** Prevenzione mass assignment attacks

**Esempio DTO:**

```typescript
// create-workout-program.dto.ts
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateWorkoutProgramDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1)
  @Max(52)
  durationWeeks: number;
}
```

### 2.5 Exception Handling

**Pattern:** Global exception filter per gestione errori centralizzata.

**Perché questo pattern:**
- **Consistenza:** Risposte errori consistenti in tutta l'applicazione
- **Sicurezza:** Non esporre dettagli interni in produzione
- **Logging:** Logging centralizzato di tutti gli errori
- **Audit:** Tracciamento errori per audit trail

**Esempio Exception Filter:**

```typescript
// http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message;
      code = (exceptionResponse as any).code || 'HTTP_ERROR';
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Audit log for critical errors
    if (status >= 500) {
      // Log to audit service
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 2.6 Autenticazione e Autorizzazione

**Pattern:** JWT (JSON Web Tokens) con refresh tokens.

**Perché JWT:**
- **Stateless:** Server non mantiene stato di sessione
- **Scalabilità:** Facile scalare orizzontalmente
- **Mobile-Friendly:** Funziona bene anche per API mobile
- **Standard:** Standard industry, ben supportato

**Implementazione:**

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

**Guards:**

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### 2.7 Audit Logging (Tamper-Proof)

**Pattern:** Servizio centralizzato per audit logging con Chained Hashing.

**Perché Chained Hashing:**
- **Integrità:** Rende impossibile la modifica o cancellazione silenziosa dei log passati.
- **Compliance:** Requisito fondamentale per ambienti GxP/Pharma (Data Integrity).

**Struttura Log:**
Ogni entry deve contenere:
- `prevHash`: Hash SHA-256 del record precedente.
- `signature`: HMAC-SHA256 del record corrente (firmato con chiave privata).
- `metadata`: Contesto dell'azione (redacted per dati sensibili).

**Implementazione Concettuale:**

```typescript
// audit.service.ts
@Injectable()
export class AuditService {
  async log(data: AuditData): Promise<void> {
    const lastLog = await this.repository.findLast();
    const prevHash = lastLog ? this.calculateHash(lastLog) : 'GENESIS_HASH';

    const newLog = {
      ...data,
      id: uuidv4(),
      prevHash,
      timestamp: new Date(),
    };

    const signature = this.signLog(newLog); // HMAC with secret key
    await this.repository.save({ ...newLog, signature });
  }
}
```

### 2.8 Error Handling & Recovery Strategy

**Pattern:** Strategia difensiva a più livelli.

1.  **API Layer (Retry Policy):**
    - Chiamate idempotenti (GET, PUT) con retry automatico (Exponential Backoff).
    - Timeout aggressivi (es. 5s) per evitare freeze dell'UI.

2.  **Graceful Degradation:**
    - Se un servizio esterno (es. ExerciseDB) fallisce, l'app DEVE continuare a funzionare usando:
      - Cache locale (se disponibile).
      - Funzionalità ridotte (es. inserimento manuale invece di ricerca catalogo).

3.  **Client-Side Resilience:**
    - Error Boundaries in React per isolare crash di componenti.
    - "Toast" non bloccanti per errori transitori.

---

## 3. Architettura Frontend (React)

### 3.1 Panoramica Architetturale

L'architettura frontend segue il pattern **Feature-Sliced Design** (FSD), organizzato per feature con separazione chiara tra UI, business logic e data fetching.

### 3.2 Resilient Web Architecture

Il web non è "sempre online". L'architettura deve gestire interruzioni di rete trasparenti all'utente.

**Strategie:**
1.  **Optimistic UI:**
    - L'interfaccia si aggiorna *prima* della risposta del server.
    - In caso di errore, rollback automatico con notifica.
    - Esempio: "Like" a un workout, completamento set.

2.  **Background Sync Queue:**
    - Le mutazioni critiche (es. `completeSet`) vengono salvate in `localStorage`/`IndexedDB`.
    - Un `ServiceWorker` o `QueryManager` tenta l'invio in background.
    - Garantisce zero perdita dati anche se la connessione cade per 2 secondi.

3.  **Persisted Query Cache:**
    - TanStack Query persiste la cache in `localStorage` (o `idb-keyval`).
    - Al reload pagina, i dati sono mostrati istantaneamente ("Stale-While-Revalidate").

```

```
frontend/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component
│   │
│   ├── app/                      # App-level configuration
│   │   ├── providers/
│   │   │   ├── query-client.provider.tsx
│   │   │   └── auth.provider.tsx
│   │   ├── router/
│   │   │   └── router.tsx
│   │   └── store/
│   │       └── store.ts
│   │
│   ├── shared/                   # Shared code
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── Card/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   └── client.ts
│   │   │   └── utils/
│   │   └── hooks/
│   │       └── use-auth.ts
│   │
│   ├── features/                 # Feature modules
│   │   ├── workout-program/
│   │   │   ├── ui/
│   │   │   │   ├── WorkoutProgramList/
│   │   │   │   ├── WorkoutProgramCard/
│   │   │   │   └── WorkoutProgramForm/
│   │   │   ├── api/
│   │   │   │   └── workout-program.api.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── store.ts
│   │   │   └── pages/
│   │   │       ├── WorkoutProgramListPage.tsx
│   │   │       └── WorkoutProgramDetailPage.tsx
│   │   │
│   │   ├── workout-logging/
│   │   │   └── ...
│   │   │
│   │   ├── progress-tracking/
│   │   │   └── ...
│   │   │
│   │   ├── body-tracking/
│   │   │   └── ...
│   │   │
│   │   └── profile/
│   │       └── ...
│   │
│   └── pages/                    # Page components
│       ├── HomePage.tsx
│       └── NotFoundPage.tsx
│
├── public/
├── package.json
└── vite.config.ts
```

### 3.2 State Management: TanStack Query + Zustand

**Scelta:** TanStack Query (React Query) per server state + Zustand per client state.

**Perché TanStack Query:**
- **Server State:** Gestione automatica di caching, refetching, synchronization
- **Performance:** Caching intelligente riduce chiamate API
- **UX:** Loading states, error handling, optimistic updates automatici
- **Type Safety:** Integrazione eccellente con TypeScript

**Perché Zustand:**
- **Semplicità:** API semplice, meno boilerplate di Redux
- **Performance:** Re-render solo dei componenti che usano lo stato modificato
- **TypeScript:** Type safety eccellente
- **Leggero:** Bundle size molto piccolo

**Esempio TanStack Query:**

```typescript
// workout-program.api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api/client';

export const workoutProgramKeys = {
  all: ['workout-programs'] as const,
  lists: () => [...workoutProgramKeys.all, 'list'] as const,
  list: (filters: string) => [...workoutProgramKeys.lists(), { filters }] as const,
  details: () => [...workoutProgramKeys.all, 'detail'] as const,
  detail: (id: string) => [...workoutProgramKeys.details(), id] as const,
};

export function useWorkoutPrograms() {
  return useQuery({
    queryKey: workoutProgramKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/workout-programs');
      return response.data;
    },
  });
}

export function useCreateWorkoutProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateWorkoutProgramDto) => {
      const response = await apiClient.post('/workout-programs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutProgramKeys.lists() });
    },
  });
}
```

**Esempio Zustand:**

```typescript
// auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
```

### 3.3 Routing: React Router

**Scelta:** React Router v6 per routing.

**Perché React Router:**
- **Standard:** De facto standard per React
- **Type Safety:** Supporto TypeScript eccellente
- **Features:** Code splitting, lazy loading, nested routes
- **Documentation:** Documentazione completa e community attiva

**Esempio Router:**

```typescript
// router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'workout-programs',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <WorkoutProgramListPage />,
          },
          {
            path: ':id',
            element: <WorkoutProgramDetailPage />,
          },
        ],
      },
      // ... altre routes
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
```

### 3.4 API Client: Axios

**Scelta:** Axios per HTTP client.

**Perché Axios:**
- **Interceptors:** Facile aggiungere token, error handling
- **Type Safety:** Supporto TypeScript
- **Features:** Request/response transformation, timeout, cancellation
- **Maturità:** Libreria matura e stabile

**Esempio API Client:**

```typescript
// api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/model/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor: aggiungi token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: gestisci errori
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token scaduto, refresh o logout
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### 3.5 Form Management: React Hook Form

**Scelta:** React Hook Form per gestione form.

**Perché React Hook Form:**
- **Performance:** Re-render minimi (uncontrolled components)
- **Type Safety:** Integrazione eccellente con TypeScript
- **Validation:** Integrazione con Zod/Yup per validazione
- **DX:** Developer experience eccellente

**Esempio Form:**

```typescript
// WorkoutProgramForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  durationWeeks: z.number().min(1).max(52),
});

type FormData = z.infer<typeof schema>;

export function WorkoutProgramForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useCreateWorkoutProgram();

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... altri campi */}
    </form>
  );
}
```

---

## 4. Comunicazione Client-Server

### 4.1 API Design: RESTful

**Pattern:** RESTful API con convenzioni standard.

**Convenzioni:**
- **GET:** Lettura dati (idempotente)
- **POST:** Creazione risorse
- **PUT:** Sostituzione completa risorsa
- **PATCH:** Modifica parziale risorsa
- **DELETE:** Eliminazione risorsa

**Esempio Endpoints:**

```
GET    /workout-programs           # Lista programmi
GET    /workout-programs/:id       # Dettaglio programma
POST   /workout-programs           # Crea programma
PATCH  /workout-programs/:id       # Aggiorna programma
DELETE /workout-programs/:id       # Elimina programma
```

### 4.2 Real-time: WebSocket (Futuro)

**Nota:** Per sincronizzazione real-time multi-device, WebSocket può essere aggiunto in futuro.

**Quando implementare:**
- Sincronizzazione real-time durante workout attivo
- Notifiche push in-app
- Collaborazione multi-utente (coach mode)

---

## 5. Sicurezza

### 5.1 Frontend Security

- **HTTPS Only:** Tutte le comunicazioni via HTTPS
- **XSS Prevention:** Sanitizzazione input, Content Security Policy
- **CSRF Protection:** CSRF tokens per operazioni critiche
- **Secure Storage:** Tokens in httpOnly cookies (quando possibile) o localStorage criptato

### 5.2 Backend Security

- **Input Validation:** Validazione rigorosa di tutti gli input
- **SQL Injection:** TypeORM previene SQL injection
- **Rate Limiting:** Limitazione richieste per prevenire abusi
- **CORS:** Configurazione CORS restrittiva
- **Helmet:** Security headers automatici

---

## 6. Testing Strategy

### 6.1 Backend Testing

- **Unit Tests:** Test service e repository (Jest)
- **Integration Tests:** Test API endpoints (Supertest)
- **E2E Tests:** Test flussi completi (Jest + Supertest)

### 6.2 Frontend Testing

- **Unit Tests:** Test componenti e utilities (Vitest)
- **Integration Tests:** Test feature complete (React Testing Library)
- **E2E Tests:** Test flussi utente (Playwright)

---

## 7. Conclusioni

L'architettura proposta fornisce:

1. **Scalabilità:** Modular monolith pronta per microservizi se necessario
2. **Manutenibilità:** Codice organizzato, testabile, ben documentato
3. **Type Safety:** TypeScript end-to-end per ridurre errori
4. **Performance:** Caching intelligente, code splitting, lazy loading
5. **Sicurezza:** Best practices implementate a tutti i livelli

Le scelte tecnologiche (NestJS, React, TypeORM, TanStack Query) sono allineate con:
- Standard industriali per ambienti critici
- Requisiti di performance e manutenibilità
- Esigenze di type safety e testabilità
- Best practices moderne del settore

**Prossimi Passi:**
1. Setup repository GitHub con struttura cartelle
2. Configurazione iniziale NestJS e React
3. Implementazione feature core (Workout Program)
4. Setup testing e CI/CD
5. Deploy ambiente staging

---

## 8. Riferimenti

- **Documento High-Level:** `1_HIGH_LEVEL_ANALYSIS.md`
- **Documento Infrastruttura:** `2_INFRASTRUCTURE.md`
- **Documento Specifiche Funzionalità:** `4_FEATURE_SPECS.md`
- **NestJS Documentation:** https://docs.nestjs.com/
- **React Documentation:** https://react.dev/
- **TypeORM Documentation:** https://typeorm.io/

---

**Approvato da:** _________________  
**Data Approvazione:** _________________

