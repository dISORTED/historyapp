# Configuración de Supabase

## Pasos para crear la base de datos

### 1. Crear proyecto en Supabase

1. Ve a https://app.supabase.com
2. Click en **New Project**
3. Configura:
   - **Name**: historyapp (o similar)
   - **Database Password**: Usa el generador (guarda en lugar seguro)
   - **Region**: Elige la más cercana a ti
4. Click **Create new project**
5. Espera ~2 minutos a que se inicialice

### 2. Crear tabla de incidencias

Una vez en el dashboard:

1. Ve al menú **SQL Editor** (izquierda)
2. Click en **New Query**
3. Copia y pega TODO el contenido de `scripts/schema.sql`
4. Click en **Run** (o Ctrl+Enter)
5. Verifica que todas las queries se ejecuten sin errores (verde)

### 3. Verificar tabla

En el menú **Table Editor** (izquierda), debería aparecer:
- Tabla `incidents` con las columnas correctas
- Sin datos (está vacía, perfecto)

### 4. Obtener credenciales API

1. Ve a **Project Settings** (abajo a la izquierda)
2. Click en pestaña **API**
3. Verás:
   - **Project URL**: Copia este valor → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys**
     - Columna **Key**: Busca la fila "anon public" 
     - Copia ese valor → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Test de autenticación

En **Authentication** (menú izquierda):
- Verifica que esté activo por defecto
- Providers habilitados: Email (es suficiente para MVP)

Si lo deseas, puedes ver usuarios registrados en **Users** después de crear cuentas.

## Entender RLS (Row Level Security)

Lo que configuramos en `schema.sql`:

```sql
-- Los usuarios solo ven SUS propias incidencias
CREATE POLICY "Users can view own incidents"
  ON public.incidents
  FOR SELECT
  USING (auth.uid() = user_id);
```

Esto significa:
- User A solo ve incidencias donde `user_id = User A's ID`
- User B nunca ve datos de User A (incluso si intenta por SQL)
- Imposible de bypassear desde cliente

Políticas creadas:
- 📖 SELECT: Solo datos propios
- ✍️ INSERT: Solo puede crear con su user_id
- ✏️ UPDATE: Solo puede modificar los suyos
- 🗑️ DELETE: Solo puede eliminar los suyos

## Posibles problemas

### "relation 'incidents' does not exist"
- La tabla no se creó. Ejecuta nuevamente `schema.sql` completo.

### "permission denied for schema public"
- Las políticas están funcionando. Es normal.

### Usuarios no pueden ver datos propios
- Verifica que Supabase Auth esté retornando `auth.uid()` correcto
- Revisa en Auth > Users que el usuario exista

## Próximos pasos

1. Configura variables de entorno localmente (`.env.local`)
2. Ejecuta `npm run dev` y prueba crear/buscar incidencias
3. Cuando estés listo, deploy a Vercel (ver `DEPLOY.md`)

