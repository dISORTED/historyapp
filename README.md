# Historial de Incidencias TI - MVP

MVP simple y funcional para registro histórico de incidencias TI resueltas. Una aplicación minimalista enfocada en claridad, rapidez y facilidad de uso sin complicaciones de workflows, estados o SLAs.

## 🎯 Características

- ✅ **Registro rápido**: Formulario simple con campos esenciales
- 🔍 **Búsqueda**: Por palabra clave en título, descripción, sistema, responsable
- 📅 **Filtros por fecha**: Rango de resolución de incidencias
- 📊 **Listado compacto**: Tabla con detalles desplegables
- 🔐 **Autenticación**: Con Supabase Auth
- 🔒 **RLS**: Cada usuario solo ve sus propios registros
- ⚡ **Minimalista**: Sin automatizaciones complejas

## 📋 Campos de una Incidencia

- **Fecha de resolución**: Cuándo se resolvió
- **Título breve**: Descripción corta del problema
- **Descripción del problema**: Detalles técnicos del issue
- **Acciones realizadas**: Pasos específicos ejecutados
- **Sistema afectado**: Herramienta o servicio
- **Responsable**: Quién lo resolvió
- **Observaciones**: Notas adicionales (opcional)

## 🚀 Quick Start

### 1. Clonar y instalar

```bash
git clone <repo-url>
cd historyapp
npm install
```

### 2. Configurar Supabase

#### a) Crear proyecto en Supabase
1. Ve a [app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Espera a que se inicialice

#### b) Crear tabla y políticas
1. Ve a **SQL Editor**
2. Abre un nuevo query
3. Copia el contenido de `scripts/schema.sql`
4. Ejecuta el SQL completo

Este script crea:
- Tabla `incidents` con campos
- Índices para búsquedas rápidas
- Row Level Security (RLS) para privacidad
- Políticas: usuarios solo ven/editan sus registros

#### c) Obtener credenciales
1. Ve a **Project Settings** → **API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### 4. Ejecutar localmente

```bash
npm run dev
```

Accede a: http://localhost:3000

## 📦 Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Autenticación**: Supabase Auth (email/password)
- **Base de datos**: PostgreSQL con RLS
- **Deploy**: Vercel (frontend) + Supabase Cloud (backend)
- **Estilos**: CSS inline minimalista (sin frameworks)

## 🔑 Características de Seguridad

### Row Level Security (RLS)
Cada usuario solo puede:
- **Ver** sus propias incidencias
- **Crear** incidencias bajo su ID de usuario
- **Actualizar** sus propios registros
- **Eliminar** sus propios registros

### Autenticación
- Email verification requerida para registros
- Contraseñas hasheadas en Supabase
- Sesiones gestiona automáticamente

## 🌐 Deploy en Vercel

### 1. Subir a GitHub
```bash
git add .
git commit -m "MVP historial incidencias"
git push origin main
```

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa el repo desde GitHub
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático

### 3. URL Pública
Tu app estará disponible en: `https://[proyecto].vercel.app`

## 📊 Estructura del Proyecto

```
historyapp/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx         # Página principal
│   │   ├── dashboard.tsx    # Componente dashboard
│   │   ├── layout.tsx       # Layout root
│   │   └── globals.css      # Estilos globales
│   ├── components/          # Componentes React
│   │   ├── auth.tsx         # Autenticación
│   │   ├── incident-form.tsx # Formulario
│   │   └── incident-list.tsx # Listado
│   └── lib/                 # Utilidades
│       ├── supabase-client.ts
│       ├── types.ts
│       └── incidents.ts
├── scripts/
│   ├── schema.sql           # Script de BD
│   └── setup-instructions.sh
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🎨 Interfaz

### Formulario de Registro
- Grid 2 columnas en desktop (responsive)
- Campos requeridos marcados con *
- Submit desactiva durante carga
- Mensajes de error claros

### Listado de Incidencias
- Tabla compacta con scroll horizontal en móvil
- Búsqueda en tiempo real
- Filtros por rango de fechas
- Detalles desplegables (sin popup)
- Última columna con resumen + `<details>`

### Diseño
- Colores neutros: grises, azules, rojos
- Tipografía del sistema
- Espaciado consistente
- Responsive: grid a 1 columna en móvil

## 🔍 Búsqueda y Filtros

### Por palabra clave
Busca en:
- Título de incidencia
- Descripción del problema
- Acciones realizadas
- Sistema afectado
- Responsable

### Por fecha
- Campo "Desde" (fecha mínima)
- Campo "Hasta" (fecha máxima)
- Filtro inclusivo en ambos extremos

Combinable: puedes buscar palabra + rango de fechas simultáneamente.

## 📝 Ejemplos de Uso

### Crear incidencia
1. Llena el formulario (fecha, título, descripción, etc.)
2. Click en "Registrar Incidencia"
3. Aparece en la tabla automáticamente

### Buscar incidencia
1. Escribe en "Buscar (palabra clave)"
2. Selecciona rango de fechas si es necesario
3. Tabla se filtra automáticamente

### Ver detalles completos
1. En la tabla, click en "Ver" (último campo)
2. Se expande con problema, acciones, observaciones
3. Click nuevamente para colapsar

## 🛠️ Desarrollo

### Instalar dependencias
```bash
npm install
```

### Ejecutar servidor de desarrollo
```bash
npm run dev
```

### Build para producción
```bash
npm run build
npm start
```

### Type checking
```bash
npm run type-check
```

## 🔮 Posibles Mejoras Futuras

- Edición y eliminación desde la UI (actualmente solo crear/leer)
- Exportar a CSV/PDF
- Etiquetas o categorías
- Búsqueda fulltext en PostgreSQL
- Gráficos de incidencias por periodo
- Integración con Slack para notificaciones
- Autosuggest en campos (sistemas conocidos, responsables, etc.)

## 📄 Licencia

MIT - Libre para usar y modificar

## 👥 Soporte

- Docs de Supabase: https://supabase.com/docs
- Docs de Next.js: https://nextjs.org/docs
- Issues: Crea un issue en GitHub

---

**Versión**: 0.1.0  
**Última actualización**: Enero 2025
