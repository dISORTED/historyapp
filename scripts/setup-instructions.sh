#!/bin/bash

# Script para verificar la configuración de Supabase
# No ejecuta SQL directamente, solo proporciona instrucciones

echo "=== Configuración de Supabase ==="
echo ""
echo "1. Ve a: https://app.supabase.com"
echo "2. Selecciona tu proyecto"
echo "3. Ve a: SQL Editor"
echo "4. Copia el contenido de scripts/schema.sql"
echo "5. Pega el SQL en el editor y ejecuta"
echo ""
echo "=== Variables de entorno ==="
echo ""
echo "Después de crear la tabla, copia estas variables en .env.local:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx"
echo ""
echo "Las encontrarás en: Project Settings > API"
echo ""
