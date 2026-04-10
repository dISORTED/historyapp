-- SQL para ejecutar en Supabase Console
-- Crear tabla de incidencias y modelo de tickets cortos

CREATE SEQUENCE IF NOT EXISTS public.incident_ticket_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_incident_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_value BIGINT;
BEGIN
  next_value := nextval('public.incident_ticket_seq');
  RETURN 'TK-' || LPAD(next_value::TEXT, 4, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_code TEXT UNIQUE NOT NULL,
  legacy_ticket_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resolution_date DATE NOT NULL,
  attention_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended_user TEXT NOT NULL,
  title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  actions_taken TEXT NOT NULL,
  affected_tool TEXT NOT NULL,
  responsible TEXT NOT NULL,
  observations TEXT DEFAULT ''
);

-- Asigna ticket_code automaticamente en INSERT y evita cambios manuales en UPDATE.
CREATE OR REPLACE FUNCTION public.enforce_incident_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.ticket_code IS NULL OR BTRIM(NEW.ticket_code) = '' THEN
      NEW.ticket_code := public.generate_incident_ticket_code();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.ticket_code IS DISTINCT FROM OLD.ticket_code THEN
      RAISE EXCEPTION 'ticket_code cannot be modified';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_incident_ticket_code ON public.incidents;
CREATE TRIGGER trg_enforce_incident_ticket_code
BEFORE INSERT OR UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.enforce_incident_ticket_code();

-- Enforzamos responsible desde metadata de Auth para no confiar en el cliente.
CREATE OR REPLACE FUNCTION public.enforce_incident_responsible()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_name TEXT;
BEGIN
  jwt_name := NULLIF(TRIM(COALESCE(auth.jwt() -> 'user_metadata' ->> 'name', '')), '');

  IF jwt_name IS NULL THEN
    RAISE EXCEPTION 'Technician name is required in user metadata';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.responsible := jwt_name;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.responsible IS DISTINCT FROM OLD.responsible THEN
      RAISE EXCEPTION 'responsible cannot be modified';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_incident_responsible ON public.incidents;
CREATE TRIGGER trg_enforce_incident_responsible
BEFORE INSERT OR UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.enforce_incident_responsible();

-- Crear indices para optimizar busquedas
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_ticket_code_unique ON public.incidents(ticket_code);
CREATE INDEX IF NOT EXISTS idx_incidents_legacy_ticket_code ON public.incidents(legacy_ticket_code);
CREATE INDEX IF NOT EXISTS idx_incidents_resolution_date ON public.incidents(resolution_date);
CREATE INDEX IF NOT EXISTS idx_incidents_attention_datetime ON public.incidents(attention_datetime);
CREATE INDEX IF NOT EXISTS idx_incidents_title ON public.incidents USING GIN(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_incidents_problem ON public.incidents USING GIN(to_tsvector('spanish', problem_description));

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Politica: Los usuarios solo pueden ver sus propias incidencias y el admin principal
DROP POLICY IF EXISTS "Users can view own incidents" ON public.incidents;
CREATE POLICY "Users can view own incidents"
  ON public.incidents
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'sebastianecheverria2019@gmail.com'
  );

-- Politica: Los usuarios solo pueden crear sus propias incidencias
DROP POLICY IF EXISTS "Users can create own incidents" ON public.incidents;
CREATE POLICY "Users can create own incidents"
  ON public.incidents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politica: Los usuarios solo pueden actualizar sus propias incidencias
DROP POLICY IF EXISTS "Users can update own incidents" ON public.incidents;
CREATE POLICY "Users can update own incidents"
  ON public.incidents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politica: Los usuarios solo pueden eliminar sus propias incidencias
DROP POLICY IF EXISTS "Users can delete own incidents" ON public.incidents;
CREATE POLICY "Users can delete own incidents"
  ON public.incidents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Habilitar realtime (opcional, para actualizaciones en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Migracion para proyectos existentes (incluye renombrado total de tickets):
-- 1) Estructura
-- ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS legacy_ticket_code TEXT;
-- ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS attention_datetime TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS attended_user TEXT;
--
-- UPDATE public.incidents
-- SET attention_datetime = COALESCE(attention_datetime, resolution_date::timestamp)
-- WHERE attention_datetime IS NULL;
--
-- UPDATE public.incidents
-- SET attended_user = COALESCE(attended_user, '')
-- WHERE attended_user IS NULL;
--
-- ALTER TABLE public.incidents ALTER COLUMN attention_datetime SET DEFAULT now();
-- ALTER TABLE public.incidents ALTER COLUMN attention_datetime SET NOT NULL;
-- ALTER TABLE public.incidents ALTER COLUMN attended_user SET NOT NULL;
--
-- CREATE SEQUENCE IF NOT EXISTS public.incident_ticket_seq START 1;
-- CREATE OR REPLACE FUNCTION public.generate_incident_ticket_code()
-- RETURNS TEXT
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--   next_value BIGINT;
-- BEGIN
--   next_value := nextval('public.incident_ticket_seq');
--   RETURN 'TK-' || LPAD(next_value::TEXT, 4, '0');
-- END;
-- $$;
--
-- CREATE OR REPLACE FUNCTION public.enforce_incident_ticket_code()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   IF TG_OP = 'INSERT' THEN
--     IF NEW.ticket_code IS NULL OR BTRIM(NEW.ticket_code) = '' THEN
--       NEW.ticket_code := public.generate_incident_ticket_code();
--     END IF;
--   ELSIF TG_OP = 'UPDATE' THEN
--     IF NEW.ticket_code IS DISTINCT FROM OLD.ticket_code THEN
--       RAISE EXCEPTION 'ticket_code cannot be modified';
--     END IF;
--   END IF;
--
--   RETURN NEW;
-- END;
-- $$;
--
-- DROP TRIGGER IF EXISTS trg_enforce_incident_ticket_code ON public.incidents;
-- CREATE TRIGGER trg_enforce_incident_ticket_code
-- BEFORE INSERT OR UPDATE ON public.incidents
-- FOR EACH ROW
-- EXECUTE FUNCTION public.enforce_incident_ticket_code();
--
-- 2) Renombrado historico con trazabilidad
-- UPDATE public.incidents
-- SET legacy_ticket_code = ticket_code
-- WHERE legacy_ticket_code IS NULL;
--
-- WITH ordered_incidents AS (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS row_num
--   FROM public.incidents
-- )
-- UPDATE public.incidents i
-- SET ticket_code = 'TK-' || LPAD(ordered_incidents.row_num::TEXT, 4, '0')
-- FROM ordered_incidents
-- WHERE i.id = ordered_incidents.id;
--
-- ALTER TABLE public.incidents ALTER COLUMN ticket_code SET NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_ticket_code_unique ON public.incidents(ticket_code);
-- CREATE INDEX IF NOT EXISTS idx_incidents_legacy_ticket_code ON public.incidents(legacy_ticket_code);
--
-- SELECT setval(
--   'public.incident_ticket_seq',
--   COALESCE(
--     (SELECT MAX(SUBSTRING(ticket_code FROM 4)::BIGINT) FROM public.incidents WHERE ticket_code ~ '^TK-[0-9]+$'),
--     0
--   ) + 1,
--   false
-- );
