# 🚀 MVP Historial de Incidencias - Guía de Inicio Rápido

## Requisitos previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratuita)
- Cuenta en Vercel (gratuita, opcional para deploy)
- Git instalado

## 5 Pasos para ejecutar localmente

### 1️⃣ Clonar y preparar

```bash
git clone <repo-url>
cd historyapp
npm install
```

### 2️⃣ Crear proyecto en Supabase

1. Ve a https://app.supabase.com → New Project
2. Nombre: `historyapp`
3. Crea la contraseña y selecciona región
4. Espera 2 minutos

### 3️⃣ Crear tabla

1. En Supabase, ve a **SQL Editor**
2. **New Query**
3. Copia TODO el contenido de `scripts/schema.sql`
4. **Run** (ejecuta)

### 4️⃣ Obtener credenciales

En **Project Settings** → **API**:

```
NEXT_PUBLIC_SUPABASE_URL = (copiar Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (copiar "anon public" key)
```

Crea archivo `.env.local`:

```bash
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
EOF
```

### 5️⃣ Ejecutar

```bash
npm run dev
```

Abre http://localhost:3000

---

## ¿Qué hace la app?

✅ **Registra incidencias** - Formulario con campos clave  
✅ **Busca por palabra clave** - En título, descripción, sistema  
✅ **Filtra por fecha** - Rango desde/hasta  
✅ **Edita registros** - Modal para cambiar datos  
✅ **Elimina incidencias** - Con confirmación  
✅ **Solo tus datos** - RLS asegura privacidad  

---

## Estructura del código

```
src/
├── app/
│   ├── page.tsx          ← Página principal
│   ├── dashboard.tsx     ← Dashboard con todo
│   └── globals.css       ← Estilos
├── components/
│   ├── auth.tsx          ← Login/signup
│   ├── incident-form.tsx ← Formulario nuevo
│   ├── incident-list.tsx ← Tabla listado
│   └── incident-detail.tsx ← Modal editar/eliminar
└── lib/
    ├── supabase-client.ts ← Cliente Supabase
    ├── types.ts           ← TypeScript types
    └── incidents.ts       ← Funciones DB
```

---

## Comandos útiles

```bash
# Dev
npm run dev

# Build
npm run build && npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Próximo: Deploy a Vercel

1. Push a GitHub
2. Ve a vercel.com/new → Importa repo
3. Agrega env vars
4. Deploy

Ver `DEPLOY.md` para instrucciones detalladas.

---

## Troubleshooting

**"Cannot find module '@supabase/ssr'"**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**"NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Verifica que `.env.local` existe
- Contiene las variables correctas
- Reinicia `npm run dev`

**Error de base de datos al crear incidencia**
- Verifica que tabla existe en Supabase
- Ejecuta `scripts/schema.sql` nuevamente

**Login no funciona**
- En Supabase, Auth debe estar activo (está por defecto)
- Verifica credenciales en `.env.local`

---

## ¿Preguntas?

1. Lee [README.md](README.md) para documentación completa
2. Lee [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para setup detallado
3. Lee [DEPLOY.md](DEPLOY.md) para deploy a Vercel

---

**¡Listo para usar!** 🎉
