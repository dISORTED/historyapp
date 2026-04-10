import type { User } from '@supabase/supabase-js'

const DEFAULT_PRIMARY_ADMIN_EMAIL = 'sebastianecheverria2019@gmail.com'

function normalizeEmail(value: string | undefined | null) {
  return value?.trim().toLowerCase() || ''
}

const configuredAdminEmail = normalizeEmail(process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL)

export const PRIMARY_ADMIN_EMAIL = configuredAdminEmail || DEFAULT_PRIMARY_ADMIN_EMAIL

export function isPrimaryAdmin(user: User | null | undefined) {
  const email = normalizeEmail(user?.email)
  return email === PRIMARY_ADMIN_EMAIL
}
