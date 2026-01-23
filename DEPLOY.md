# Historial de Incidencias TI - Guía de Deploy

## 🚀 Deploying a Vercel

### Paso 1: Preparar el repositorio

```bash
git add .
git commit -m "MVP inicial - historial de incidencias"
git push origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Selecciona el owner (usuario/org)
4. Configura estas opciones:
   - **Project name**: `historyapp` (o el que prefieras)
   - **Root directory**: `./` (raíz)
   - **Framework**: Next.js (debería detectarse automáticamente)
   - **Build command**: `npm run build`
   - **Output directory**: `.next`

### Paso 3: Variables de entorno

En la pantalla de **Environment Variables**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL    =  https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cómo obtenerlas:**
1. Ve a tu proyecto de Supabase: https://app.supabase.com
2. Project Settings → API
3. Copia los valores (URL y anon key)

### Paso 4: Deploy

1. Click en **Deploy**
2. Espera a que se complete (5-10 segundos típicamente)
3. Recibirás una URL: `https://[proyecto].vercel.app`

## 🔄 Actualizaciones futuras

Cada push a `main` dispara automáticamente un nuevo deploy en Vercel.

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel detecta los cambios y redeploy automáticamente.

## ✅ Checklist pre-deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] Tabla `incidents` creada en Supabase (via SQL)
- [ ] RLS habilitado en la tabla
- [ ] Políticas de seguridad creadas
- [ ] Supabase Auth habilitado (está por defecto)
- [ ] Test local: `npm run dev` funciona

## 🐛 Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Asegúrate de haber agregado las env vars en Vercel
- Verifica que el nombre exacto sea `NEXT_PUBLIC_SUPABASE_URL`
- Redeploy después de agregar

### "Connection refused" en Supabase
- Verifica que la URL sea correcta en env vars
- Prueba acceso directo: `curl $NEXT_PUBLIC_SUPABASE_URL`

### Build fails
- Revisa los logs en Vercel (tab Deployment)
- Ejecuta localmente: `npm run build`
- Verifica dependencias: `npm install`

## 📞 Monitoreo

Una vez deployado:
1. Ve a tu proyecto en Vercel
2. Tab "Deployments" para histórico
3. Tab "Analytics" para performance
4. Tab "Settings" para configuración

## 🔐 Seguridad

- Las env vars `NEXT_PUBLIC_*` son públicas (seguro incluir claves públicas de Supabase)
- No incluyas contraseñas de BD ni claves privadas en repositorio
- Supabase Auth maneja las sesiones seguramente