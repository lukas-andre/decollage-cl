import { createServiceRoleClient } from '@/lib/supabase/service-role'

export function getServiceClient() {
  return createServiceRoleClient()
}

export function buildBreakdown(
  rows: Array<{ reaction_type: string | null; reaction_count: number | null }>
) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const type = row.reaction_type || 'unknown'
    const count = Number(row.reaction_count || 0)
    acc[type] = count
    return acc
  }, {})
}
