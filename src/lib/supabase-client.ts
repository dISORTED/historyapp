import { createClient as createSupabaseClient, SupabaseClient, Session } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export const createClient = () => {
  if (browserClient) {
    return browserClient
  }

  browserClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

interface SessionSnapshot {
  session: Session | null
  error: Error | null
  timedOut: boolean
}

export async function getSessionSnapshot(timeoutMs = 2500): Promise<SessionSnapshot> {
  const supabase = createClient()

  const timeoutPromise = new Promise<SessionSnapshot>((resolve) => {
    window.setTimeout(() => {
      resolve({
        session: null,
        error: null,
        timedOut: true,
      })
    }, timeoutMs)
  })

  const sessionPromise = supabase.auth
    .getSession()
    .then(({ data, error }) => ({
      session: data.session ?? null,
      error: error ?? null,
      timedOut: false,
    }))
    .catch((error: unknown) => ({
      session: null,
      error: error instanceof Error ? error : new Error(String(error)),
      timedOut: false,
    }))

  return Promise.race([sessionPromise, timeoutPromise])
}
