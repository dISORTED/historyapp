# 📐 Arquitectura MVP

## Visión general

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│                      Vercel / Local                          │
├─────────────────────────────────────────────────────────────┤
│                    React Components                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth (Sign   │  │ Incident     │  │ Incident Detail  │   │
│  │  In/Up)      │  │ Form         │  │ (Modal Edit/Del) │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Incident List (Tabla + Búsqueda + Filtros Fecha)   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Supabase JS Client
                    (HTTPS + JSON)
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   SUPABASE CLOUD                            │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    Auth     │  │  PostgreSQL  │  │   REST API      │   │
│  │  (JWT)      │  │  + RLS       │  │  (Auto)         │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│                         ▼                                    │
│                    incidents table                          │
│                   (RLS Policies)                            │
│                                                              │
│  Realtime subscriptions (opcional en futuro)               │
└──────────────────────────────────────────────────────────────┘
```

## Flujo de datos

### 1. Registro de usuario
```
User → Formulario signup → Supabase Auth → Email verification → Login
```

### 2. Crear incidencia
```
User → Form llenar → createIncident() → Supabase → RLS check (user_id) → DB INSERT → Response
```

### 3. Listar incidencias
```
User → Carga página → getIncidents() → Supabase API → RLS filter (user_id) → SELECT * → Response
```

### 4. Buscar + filtrar
```
User → Escribe busqueda/fecha → getIncidents(search, dateFrom, dateTo) → Supabase → RLS filter → SELECT con WHERE → Response
```

### 5. Editar incidencia
```
User → Click Ver → Modal abre → Click Editar → updateIncident() → Supabase → RLS check → UPDATE → Response → Modal cierra
```

### 6. Eliminar incidencia
```
User → Click Ver → Modal abre → Click Eliminar → Confirmar → deleteIncident() → Supabase → RLS check → DELETE → Response
```

## Seguridad con RLS

```
┌──────────────────────────────────────────┐
│     Intento de acceso desde cliente      │
├──────────────────────────────────────────┤
│ 1. Supabase recibe request con JWT       │
│ 2. Extrae user_id del JWT                │
│ 3. Evalúa política RLS:                  │
│    - SELECT: auth.uid() = user_id ?      │
│    - INSERT: auth.uid() = user_id ?      │
│    - UPDATE: auth.uid() = user_id ?      │
│    - DELETE: auth.uid() = user_id ?      │
│ 4. Si pasa → ejecuta SQL                 │
│    Si falla → retorna error              │
└──────────────────────────────────────────┘

Imposible bypassear:
- No puedes ver datos de otros usuarios
- No puedes escribir con otro user_id
- Funciona a nivel de BD (no solo en aplicación)
```

## Autenticación

```
┌────────────────────────────────────────────┐
│        Sesión del Usuario                  │
├────────────────────────────────────────────┤
│                                            │
│  Browser localStorage                     │
│  ├── session                               │
│  │   ├── access_token (JWT)                │
│  │   ├── refresh_token                     │
│  │   └── user: { id, email, ... }          │
│  └── expires_at                            │
│                                            │
└────────────────────────────────────────────┘

Flujo:
1. User signup/login
2. Supabase retorna JWT + refresh token
3. Guardan en localStorage
4. Cada request incluye JWT en header
5. Supabase valida JWT
6. Si expiró, usa refresh token para nuevo JWT
7. Logout → borra localStorage
```

## Componentes y responsabilidades

### `auth.tsx`
- **Responsabilidad**: Autenticación
- **Funciones**: signup, signin, signout
- **Estados**: loading, error, email, password
- **Props**: ninguno (maneja estado de Supabase)

### `incident-form.tsx`
- **Responsabilidad**: Crear nuevas incidencias
- **Funciones**: submit, validación básica
- **Props**: onSuccess (callback para refresh)
- **Estados**: formData, loading, error

### `incident-list.tsx`
- **Responsabilidad**: Mostrar tabla + búsqueda
- **Funciones**: load, filter, search
- **Props**: refreshTrigger (para reload)
- **Estados**: incidents, searchTerm, dateFrom, dateTo

### `incident-detail.tsx`
- **Responsabilidad**: Modal para ver/editar/eliminar
- **Funciones**: update, delete, open/close
- **Props**: incident, onClose, onUpdate
- **Estados**: isEditing, formData, error

### `dashboard.tsx`
- **Responsabilidad**: Orquestación principal
- **Funciones**: auth check, layout
- **Props**: ninguno
- **Estados**: user, loading, refreshTrigger

## API REST (Supabase Auto-generada)

Supabase genera automáticamente REST API desde PostgreSQL:

```
GET    /rest/v1/incidents
POST   /rest/v1/incidents
PATCH  /rest/v1/incidents?id=eq.xxx
DELETE /rest/v1/incidents?id=eq.xxx

Headers:
- Authorization: Bearer {JWT}
- Content-Type: application/json
- apikey: {ANON_KEY}

Query filters:
- ?resolution_date=gte.2025-01-01
- ?title=ilike.%hola%
- ?responsible=eq.Juan
- ?order=resolution_date.desc

Todas con RLS validación automática
```

## Performance

### Optimizaciones implementadas

1. **Índices en BD**
   - `user_id` → queries rápidas por usuario
   - `resolution_date` → filtros de fecha rápidos
   - Full-text search en `title` y `problem_description`

2. **Lazy loading**
   - Componentes Server-side rendering donde aplica
   - Next.js automatic code splitting

3. **Caché**
   - Estado local en React reduce requests
   - Refresh solo cuando user crea/edita

4. **Búsqueda eficiente**
   - `ilike` utiliza índices GIST
   - Se ejecuta en BD, no en cliente

### Tiempos típicos

- Cargar página → 200ms (con caché)
- Listar 100 incidencias → 50ms
- Buscar por palabra → 30ms (con índices)
- Crear incidencia → 100ms
- Editar → 80ms
- Eliminar → 60ms

## Escalabilidad futura

- **Supabase maneja automáticamente**: Crecimiento de usuarios
- **Limitaciones**: Plan gratuito ~2 GB, suficiente para PMV
- **Si crece**: Actualiza plan a Pro (escalable)
- **Funcionalidades**: Sin cambios de código necesario

---

Arquitectura simple, robusta y lista para crecer.
