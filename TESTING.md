# ✅ Checklist y Ejemplos

## 📋 Pre-deployment Checklist

### Configuración de Supabase ✓
- [ ] Proyecto creado en Supabase
- [ ] Email verification habilitada en Auth
- [ ] SQL ejecutado (tabla + RLS creadas)
- [ ] Índices creados correctamente
- [ ] Supabase Auth está activo

### Variables de entorno ✓
- [ ] `.env.local` creado localmente
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] Variables verificadas en dev local

### Código ✓
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` corre sin errores
- [ ] `npm run build` exitoso
- [ ] `npm run type-check` sin errores
- [ ] No hay `console.error()` en DevTools

### Funcionalidades ✓
- [ ] Sign up funciona
- [ ] Email verification requerido
- [ ] Sign in funciona
- [ ] Crear incidencia funciona
- [ ] Buscar por palabra funciona
- [ ] Filtrar por fecha funciona
- [ ] Ver detalles (modal) funciona
- [ ] Editar incidencia funciona
- [ ] Eliminar incidencia funciona
- [ ] Sign out funciona

### Seguridad ✓
- [ ] RLS activo en tabla `incidents`
- [ ] User A no ve datos de User B
- [ ] User A no puede editar datos de User B
- [ ] User A no puede borrar datos de User B
- [ ] JWT válido en cada request

### Performance ✓
- [ ] Búsqueda es rápida (< 100ms)
- [ ] Tabla carga rápido (< 500ms)
- [ ] Sin errors en DevTools Performance
- [ ] Responsive en mobile (iPhone 375px)

### Responsividad ✓
- [ ] Desktop (1920px): todo funciona
- [ ] Tablet (768px): grid adapta
- [ ] Mobile (375px): 1 columna
- [ ] Sin scroll horizontal en mobile (excepto tabla)

---

## 🧪 Test Cases

### Test 1: Crear usuario y login

```
Paso 1: Click "¿No tienes cuenta?"
Paso 2: Ingresa: test@example.com / Test123!
Paso 3: Click Registrarse
Resultado: Mensaje de verificación de email

Paso 4: Abre email (verifica)
Paso 5: Ingresa email y contraseña en login
Paso 6: Click "Iniciar sesión"
Resultado: Dashboard visible
```

### Test 2: Crear incidencia

```
Paso 1: En formulario, ingresa:
  - Fecha: hoy
  - Responsable: "Juan Pérez"
  - Título: "CRM no accesible"
  - Sistema: "Salesforce"
  - Problema: "Error 500 al cargar leads"
  - Acciones: "Reinicié servidor, funcionó"
  - Observaciones: "Escalable a soporte"

Paso 2: Click "Registrar Incidencia"
Paso 3: Espera a que desaparezca el loading

Resultado: Incidencia aparece en tabla abajo
Verificar: Todos los datos están correctos
```

### Test 3: Buscar incidencia

```
Paso 1: En tabla, busca: "CRM"
Resultado: Tabla filtra, muestra solo la incidencia

Paso 2: Busca: "error"
Resultado: Sigue mostrando la incidencia

Paso 3: Busca: "Juan"
Resultado: Muestra porque coincide con responsable

Paso 4: Limpia búsqueda
Resultado: Tabla muestra todas las incidencias
```

### Test 4: Filtrar por fecha

```
Paso 1: En "Desde", selecciona: hoy
Paso 2: En "Hasta", selecciona: mañana

Resultado: Tabla muestra incidencias en ese rango

Paso 3: "Desde": hace 30 días
Resultado: Tabla vacía (no hay incidencias viejas)

Paso 4: Limpia ambas fechas
Resultado: Tabla muestra todas
```

### Test 5: Ver detalles de incidencia

```
Paso 1: En tabla, click "Ver" en última columna
Resultado: Modal abre con todos los detalles

Verificar:
- Problema se ve bien (multiline)
- Acciones se ve bien (multiline)
- Observaciones visible
- Botones: Editar, Eliminar, Cerrar
```

### Test 6: Editar incidencia

```
Paso 1: En modal, click "Editar"
Resultado: Campos se hacen editables

Paso 2: Cambia responsable: "Juan Pérez" → "María García"
Paso 3: Click "Guardar"

Resultado: Modal cierra, tabla se actualiza
Verificar: Nueva responsable aparece en tabla

Paso 4: Click "Ver" nuevamente
Verificar: Responsable es "María García"
```

### Test 7: Eliminar incidencia

```
Paso 1: En modal, click "Eliminar"
Resultado: Aparece confirmación

Paso 2: Click OK para confirmar
Resultado: Modal cierra, incidencia desaparece de tabla
```

### Test 8: Multi-usuario (seguridad RLS)

```
Paso 1: Crea 2 cuentas diferentes
  - cuenta1@example.com
  - cuenta2@example.com

Paso 2: Login con cuenta1
Paso 3: Crea incidencia: "Problema X"
Paso 4: Logout

Paso 5: Login con cuenta2
Resultado: No ve incidencia de cuenta1
Paso 6: Crea incidencia: "Problema Y"
Paso 7: Logout

Paso 8: Login con cuenta1
Resultado: Ve solo "Problema X", no "Problema Y"
```

---

## 📊 Ejemplos de datos para testing

### Incidencia 1: Email
```
Fecha:       2025-01-20
Responsable: Juan Pérez
Título:      Email corporativo no sincroniza
Sistema:     Outlook / Office 365
Problema:    Los usuarios no reciben correos desde ayer a las 14:00
Acciones:    1. Verificó conectividad de red
             2. Reinició servicio de sincronización
             3. Probó con cliente alternativo
             4. Funcionó después de reinicio
Observaciones: Posible timeout en servicio de sincronización
```

### Incidencia 2: VPN
```
Fecha:       2025-01-19
Responsable: María García
Título:      VPN desconecta frecuentemente
Sistema:     Cisco AnyConnect
Problema:    Usuarios reportan desconexiones cada 30 minutos
Acciones:    1. Revisó logs de VPN
             2. Actualizó cliente a versión 4.12
             3. Configuró keep-alive en servidor
             4. Testeo exitoso con 10 usuarios
Observaciones: Problemática resuelta, monitorear próximas 48h
```

### Incidencia 3: Servidor
```
Fecha:       2025-01-18
Responsable: Carlos López
Título:      Servidor web fuera de servicio
Sistema:     Apache / Linux
Problema:    sitio.example.com retorna 503 Service Unavailable
Acciones:    1. SSH al servidor
             2. Revisó disk space (99% lleno)
             3. Limpió logs antiguos (~50GB)
             4. Reinició Apache
             5. Verificó acceso
Observaciones: Implementar rotación automática de logs
```

---

## 🎯 Criterios de aceptación

Cada feature debe:
- ✅ Funcionar en desktop y mobile
- ✅ No romper funcionalidades existentes
- ✅ Respetar seguridad (RLS)
- ✅ Ser rápido (< 500ms)
- ✅ Mostrar mensajes de error claros
- ✅ Manejarse errores sin crashes

---

## 🚀 Deployment Checklist Final

### Antes de hacer push a main
- [ ] Todos los tests pasan
- [ ] Sin `console.log()` o `console.error()` innecesarios
- [ ] Variables de entorno ejemplificadas en `.env.example`
- [ ] README actualizado
- [ ] Código formateado y sin warnings

### Antes de deploy a Vercel
- [ ] Env vars configuradas en Vercel
- [ ] Build local exitoso: `npm run build`
- [ ] Testeo en build local: `npm start`
- [ ] Git commit y push completado
- [ ] Vercel muestra "Deployment successful"

### Después de deploy
- [ ] Accede a URL pública
- [ ] Test completo de todas las funciones
- [ ] Verificar RLS (multi-usuario)
- [ ] Performance en red 4G (DevTools throttling)
- [ ] Prueba en navegadores (Chrome, Firefox, Safari)

---

Ready for production! 🎉
