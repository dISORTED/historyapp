import type { User } from '@supabase/supabase-js'

export const PRIMARY_ADMIN_EMAIL = 'sebastianecheverria2019@gmail.com'

export function isPrimaryAdmin(user: User | null | undefined) {
  const email = user?.email?.trim().toLowerCase() || ''
  return email === PRIMARY_ADMIN_EMAIL
}
