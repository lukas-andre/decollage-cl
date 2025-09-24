import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const

type EnvVar = (typeof REQUIRED_ENV_VARS)[number]

function ensureEnvVar(key: EnvVar) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key} environment variable`)
  }
  return value
}

export function createServiceRoleClient() {
  const url = ensureEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const key = ensureEnvVar('SUPABASE_SERVICE_ROLE_KEY')

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
