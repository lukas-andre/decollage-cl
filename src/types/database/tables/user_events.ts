import type { Json } from '../json'

export type UserEventsTable = {
  Row: {
    browser: string | null
    created_at: string | null
    device_type: string | null
    event_category: string | null
    event_data: Json | null
    event_type: string
    id: string
    os: string | null
    page_path: string | null
    project_id: string | null
    referrer: string | null
    session_id: string
    user_id: string | null
  }
  Insert: {
    browser?: string | null
    created_at?: string | null
    device_type?: string | null
    event_category?: string | null
    event_data?: Json | null
    event_type: string
    id?: string
    os?: string | null
    page_path?: string | null
    project_id?: string | null
    referrer?: string | null
    session_id: string
    user_id?: string | null
  }
  Update: {
    browser?: string | null
    created_at?: string | null
    device_type?: string | null
    event_category?: string | null
    event_data?: Json | null
    event_type?: string
    id?: string
    os?: string | null
    page_path?: string | null
    project_id?: string | null
    referrer?: string | null
    session_id?: string
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "user_events_project_id_fkey"
      columns: ["project_id"]
      isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "user_events_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
