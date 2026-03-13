-- SQL para ejecutar en Supabase Console
-- Crear tabla de incidencias

CREATE TABLE public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resolution_date DATE NOT NULL,
  title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  actions_taken TEXT NOT NULL,
  affected_tool TEXT NOT NULL,
  responsible TEXT NOT NULL,
  observations TEXT DEFAULT ''
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX idx_incidents_ticket_code ON public.incidents(ticket_code);
CREATE INDEX idx_incidents_resolution_date ON public.incidents(resolution_date);
CREATE INDEX idx_incidents_title ON public.incidents USING GIN(to_tsvector('spanish', title));
CREATE INDEX idx_incidents_problem ON public.incidents USING GIN(to_tsvector('spanish', problem_description));

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias incidencias
CREATE POLICY "Users can view own incidents"
  ON public.incidents
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR COALESCE(auth.jwt() ->> 'email', '') = 'sebastianecheverria2019@gmail.com'
  );

-- Política: Los usuarios solo pueden crear sus propias incidencias
CREATE POLICY "Users can create own incidents"
  ON public.incidents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias incidencias
CREATE POLICY "Users can update own incidents"
  ON public.incidents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias incidencias
CREATE POLICY "Users can delete own incidents"
  ON public.incidents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Habilitar realtime (opcional, para actualizaciones en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Migración para proyectos que ya tienen la tabla creada:
-- ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS ticket_code TEXT;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_ticket_code_unique ON public.incidents(ticket_code);
-- CREATE INDEX IF NOT EXISTS idx_incidents_ticket_code ON public.incidents(ticket_code);
-- Si ya tenías la política admin por metadata.role, reemplázala por email:
-- DROP POLICY IF EXISTS "Users can view own incidents" ON public.incidents;
-- CREATE POLICY "Users can view own incidents"
--   ON public.incidents
--   FOR SELECT
--   USING (
--     auth.uid() = user_id
--     OR COALESCE(auth.jwt() ->> 'email', '') = 'sebastianecheverria2019@gmail.com'
--   );
