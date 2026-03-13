# Historial de Incidencias TI

Aplicación web para registrar, consultar y analizar incidencias técnicas resueltas.

Está construida con `Next.js 14`, `React 18`, `TypeScript` y `Supabase`, con enfoque en:

- registro rápido de tickets
- historial claro para técnicos
- panel admin con analítica básica
- control de acceso con `Supabase Auth` y `RLS`

## Qué hace hoy

- Autenticación por correo y contraseña con Supabase
- Registro de incidencias con código de ticket automático
- Historial para usuarios comunes con búsqueda, filtros, orden y paginación
- Panel admin con KPIs, gráficos y vista global
- Restricción de incidencias por usuario vía RLS
- Acceso admin reservado al correo:
  `sebastianecheverria2019@gmail.com`

## Stack

- `Next.js 14` App Router
- `React 18`
- `TypeScript`
- `Supabase`
- `Recharts`
- `react-datepicker`
- `date-fns`

## Estructura

```txt
src/
  app/
    admin/
    dashboard.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    admin-*.tsx
    auth.tsx
    incident-*.tsx
    incidents-chart.tsx
    live-clock.tsx
    logo.tsx
  lib/
    admin.ts
    incidents.ts
    supabase-client.ts
    types.ts

scripts/
  schema.sql

TESTING.md
AGENTS.md
```

## Requisitos

- `Node.js 18+`
- proyecto Supabase creado
- variables públicas de Supabase

## Variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Si el entorno local queda en un estado raro, puedes limpiar `.next` y levantar otra vez:

```bash
npm run dev:clean
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm run type-check
```

Nota:
- `npm run lint` existe en `package.json`, pero en este repo puede abrir el asistente interactivo de configuración de Next/ESLint si no está totalmente configurado.
- No hay test runner automático configurado aún.

## Base de datos

El SQL fuente de verdad está en:

[`scripts/schema.sql`](./scripts/schema.sql)

Ese archivo incluye:

- tabla `public.incidents`
- índices
- políticas RLS
- soporte para `ticket_code`
- referencia para la policy admin por email

## Tickets

Cada incidencia recibe un código automático al crearse, por ejemplo:

```txt
TKT-20260313-104530-AB12
```

Ese código se puede usar para buscar incidencias más rápido tanto en el historial normal como en el panel admin.

## Seguridad

### RLS

La tabla `incidents` usa políticas para que:

- un usuario vea sus propios registros
- un usuario cree, actualice y elimine solo sus registros
- el admin definido pueda consultar el panorama global

### Admin

El frontend y la política recomendada están alineados para permitir acceso admin solo a:

```txt
sebastianecheverria2019@gmail.com
```

## Estado actual del proyecto

Actualmente el sistema incluye:

- dashboard principal con formulario, gráfico, reloj y resumen lateral
- historial de incidencias con paginación
- detalle y edición de incidencias
- panel admin con filtros, KPIs y gráficos

No incluye todavía:

- suite automática de tests
- backend custom con API routes
- setup-db funcional por script (`npm run setup-db` sigue roto si falta `scripts/setup-db.js`)

## Testing manual

La referencia oficial de pruebas manuales está en:

[`TESTING.md`](./TESTING.md)

Flujo recomendado:

1. `npm run dev`
2. abrir `http://localhost:3000`
3. ejecutar uno o más escenarios de `TESTING.md`
4. revisar consola del navegador y comportamiento real

## Deploy en Vercel

### 1. Validar localmente

```bash
npm run type-check
npm run build
```

### 2. Configurar variables en Vercel

Debes cargar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy

Importa el repositorio en Vercel y despliega normalmente.

## Recomendaciones antes de testear en entorno

- limpiar incidencias y usuarios de prueba en Supabase
- dejar solo la cuenta admin real
- verificar la policy admin por email
- probar login, creación, búsqueda, edición, eliminación y acceso admin

## Roadmap corto sugerido

- corregir por completo textos con tildes rotas o mojibake restantes
- unificar aún más el manejo de sesión
- reducir consultas duplicadas del dashboard principal
- agregar pruebas automáticas básicas
- documentar migraciones SQL con más detalle

## Licencia

Uso interno / definir según necesidad del proyecto.
