import type { Json } from '../json'

export type ShareEngagementEventsTable = {
  Row: {
    created_at: string | null
    device_type: string | null
    event_data: Json | null
    event_type: string
    id: string
    platform: string | null
    session_id: string
    share_id: string | null
    user_id: string | null
  }
  Insert: {
    created_at?: string | null
    device_type?: string | null
    event_data?: Json | null
    event_type: string
    id?: string
    platform?: string | null
    session_id: string
    share_id?: string | null
    user_id?: string | null
  }
  Update: {
    created_at?: string | null
    device_type?: string | null
    event_data?: Json | null
    event_type?: string
    id?: string
    platform?: string | null
    session_id?: string
    share_id?: string | null
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "share_engagement_events_share_id_fkey"
      columns: ["share_id"]
      isOneToOne: false
      referencedRelation: "project_shares"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "share_engagement_events_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
