import type { Json } from '../json'

export type ViewerSessionsTable = {
  Row: {
    converted_at: string | null
    converted_to_user_id: string | null
    first_seen: string | null
    id: string
    interactions: Json | null
    ip_address: unknown | null
    last_seen: string | null
    page_views: number | null
    session_token: string
    share_id: string | null
    total_time_seconds: number | null
    user_agent: string | null
  }
  Insert: {
    converted_at?: string | null
    converted_to_user_id?: string | null
    first_seen?: string | null
    id?: string
    interactions?: Json | null
    ip_address?: unknown | null
    last_seen?: string | null
    page_views?: number | null
    session_token: string
    share_id?: string | null
    total_time_seconds?: number | null
    user_agent?: string | null
  }
  Update: {
    converted_at?: string | null
    converted_to_user_id?: string | null
    first_seen?: string | null
    id?: string
    interactions?: Json | null
    ip_address?: unknown | null
    last_seen?: string | null
    page_views?: number | null
    session_token?: string
    share_id?: string | null
    total_time_seconds?: number | null
    user_agent?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "viewer_sessions_converted_to_user_id_fkey"
      columns: ["converted_to_user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "viewer_sessions_share_id_fkey"
      columns: ["share_id"]
      isOneToOne: false
      referencedRelation: "project_shares"
      referencedColumns: ["id"]
    },
  ]
}
