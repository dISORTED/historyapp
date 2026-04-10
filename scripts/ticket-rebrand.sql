-- Ejecutar este bloque en Supabase SQL Editor para migrar tickets existentes
-- Objetivo:
-- 1) Guardar ticket actual en legacy_ticket_code
-- 2) Renumerar todo como TK-0001, TK-0002...
-- 3) Dejar generacion automatica secuencial para nuevos inserts

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS legacy_ticket_code TEXT;

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

UPDATE public.incidents
SET legacy_ticket_code = ticket_code
WHERE legacy_ticket_code IS NULL;

WITH ordered_incidents AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS row_num
  FROM public.incidents
)
UPDATE public.incidents i
SET ticket_code = 'TK-' || LPAD(ordered_incidents.row_num::TEXT, 4, '0')
FROM ordered_incidents
WHERE i.id = ordered_incidents.id;

ALTER TABLE public.incidents
  ALTER COLUMN ticket_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_ticket_code_unique ON public.incidents(ticket_code);
CREATE INDEX IF NOT EXISTS idx_incidents_legacy_ticket_code ON public.incidents(legacy_ticket_code);

SELECT setval(
  'public.incident_ticket_seq',
  COALESCE((SELECT MAX(SUBSTRING(ticket_code FROM 4)::BIGINT) FROM public.incidents WHERE ticket_code ~ '^TK-[0-9]+$'), 0) + 1,
  false
);
