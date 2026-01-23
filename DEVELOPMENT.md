# 🔧 Desarrollo Local

## Setup inicial

```bash
# Clonar
git clone <repo-url>
cd historyapp

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

## Ejecutar localmente

```bash
npm run dev
```

Abre: http://localhost:3000

## Estructura del proyecto

```
historyapp/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx            # Página raíz (renderiza dashboard.tsx)
│   │   ├── dashboard.tsx       # Componente principal
│   │   ├── layout.tsx          # Layout global
│   │   └── globals.css         # Estilos globales
│   ├── components/             # Componentes React
│   │   ├── auth.tsx            # Auth (sign in / sign up)
│   │   ├── incident-form.tsx   # Formulario para crear
│   │   ├── incident-list.tsx   # Tabla de listado
│   │   └── incident-detail.tsx # Modal para editar/eliminar/ver
│   └── lib/                    # Utilities
│       ├── supabase-client.ts  # Cliente de Supabase
│       ├── types.ts            # TypeScript types
│       └── incidents.ts        # Funciones CRUD
├── scripts/
│   ├── schema.sql              # SQL para crear tabla en Supabase
│   └── setup-instructions.sh   # Guía de setup
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json                 # Configuración Vercel
├── README.md                   # Documentación principal
├── QUICKSTART.md               # Guía rápida
├── SUPABASE_SETUP.md           # Configuración Supabase
├── DEPLOY.md                   # Guía de deploy
└── .env.example                # Template de env vars
```

## Scripts disponibles

```bash
# Desarrollo
npm run dev              # Servidor en http://localhost:3000

# Producción
npm run build            # Build para producción
npm start                # Ejecutar build en producción
npm run lint             # Lint con ESLint
npm run type-check       # Type checking con TypeScript

# Otras
npm install              # Instalar dependencias
npm update               # Actualizar dependencias
```

## Flujo de desarrollo

### Crear una incidencia
1. Llenar formulario en `/` 
2. Click "Registrar Incidencia"
3. Se persiste en Supabase
4. Aparece en tabla instantáneamente

### Buscar incidencias
1. Escribe palabra clave en el input de búsqueda
2. Tabla se filtra en tiempo real
3. Combina con filtros de fecha

### Ver/Editar/Eliminar
1. Click en botón "Ver" de una incidencia
2. Modal muestra todos los detalles
3. Click "Editar" para modificar
4. Click "Eliminar" para borrar (con confirmación)

## Base de datos (Supabase)

### Tabla: `incidents`

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | ✅ | Primary key, auto-generado |
| created_at | timestamp | ✅ | Auto-poblado |
| updated_at | timestamp | ✅ | Auto-poblado |
| user_id | UUID | ✅ | FK a auth.users |
| resolution_date | date | ✅ | Fecha de resolución |
| title | text | ✅ | Título breve |
| problem_description | text | ✅ | Descripción del problema |
| actions_taken | text | ✅ | Acciones realizadas |
| affected_tool | text | ✅ | Sistema/herramienta |
| responsible | text | ✅ | Quién lo resolvió |
| observations | text | ❌ | Notas adicionales |

### Seguridad (RLS)

Políticas implementadas:
- `Users can view own incidents` - SELECT filtrado por user_id
- `Users can create own incidents` - INSERT solo con user_id actual
- `Users can update own incidents` - UPDATE solo propios
- `Users can delete own incidents` - DELETE solo propios

## Autenticación

- Proveedor: Email/Password vía Supabase Auth
- Estado: Gestiona automáticamente sesiones
- Token: JWT almacenado en localStorage

Componente `auth.tsx` maneja:
- Signup (con verificación de email)
- Signin
- Signout
- Manejo de errores

## Estilos

- **Enfoque**: Minimalista, sin frameworks CSS
- **Método**: CSS inline + globals.css
- **Breakpoints**: Media queries en globals.css
- **Colores**: Neutros y funcionales
- **Tipografía**: System fonts

## Testing local

### Test de autenticación
1. Sign up con nuevo email
2. Verifica email (check spam)
3. Sign in
4. Debería mostrar dashboard

### Test de CRUD
1. Crear incidencia
2. Buscar por palabra
3. Ver detalle
4. Editar un campo
5. Eliminar

### Test de RLS
1. Login con User A
2. Crear incidencia como User A
3. Logout
4. Login con User B
5. User B NO debe ver incidencias de User A

## Debugging

### Logs del cliente
Abre DevTools (F12) → Console
```javascript
// Supabase client
const supabase = createClient()
const { data } = await supabase.from('incidents').select('*')
console.log(data)
```

### Logs del servidor
```bash
npm run dev  # Muestra logs en la terminal
```

### Problemas comunes

**No se crea tabla:**
- Verifica que SQL se ejecutó sin errores en Supabase SQL Editor
- Revisa en Table Editor que aparezca la tabla

**No hay datos en tabla:**
- Verifica que `user_id` sea null o que coincida con usuario logueado
- Revisa en Supabase Auth que el usuario exista

**Búsqueda no funciona:**
- Verifica que el campo exista en la tabla
- Revisa que la consulta ilike sea correcta

## Dependencias

- **React 18.3**: Framework UI
- **Next.js 14**: Framework web
- **TypeScript 5.3**: Type safety
- **Supabase JS 2.45**: Cliente de Supabase
- **Supabase SSR 0.4**: Server-side rendering helpers

## Variables de entorno

Requeridas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estas son públicas (prefijo `NEXT_PUBLIC_`), seguro en cliente.

## Próximos pasos

1. Desarrollo completado ✅
2. Prueba localmente
3. Deploy a Vercel (ver DEPLOY.md)

