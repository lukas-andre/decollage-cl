import type { Json } from '../json'

export type AnalyticsEventsTable = {
  Row: {
    created_at: string
    event_type: string
    id: string
    metadata: Json | null
    session_id: string | null
    user_id: string | null
  }
  Insert: {
    created_at?: string
    event_type: string
    id?: string
    metadata?: Json | null
    session_id?: string | null
    user_id?: string | null
  }
  Update: {
    created_at?: string
    event_type?: string
    id?: string
    metadata?: Json | null
    session_id?: string | null
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "analytics_events_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}