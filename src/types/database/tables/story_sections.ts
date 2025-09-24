import type { Json } from '../json'

export type StorySectionsTable = {
  Row: {
    content: Json
    created_at: string | null
    id: string
    is_visible: boolean | null
    position: number
    section_type: string
    share_id: string | null
    updated_at: string | null
  }
  Insert: {
    content: Json
    created_at?: string | null
    id?: string
    is_visible?: boolean | null
    position: number
    section_type: string
    share_id?: string | null
    updated_at?: string | null
  }
  Update: {
    content?: Json
    created_at?: string | null
    id?: string
    is_visible?: boolean | null
    position?: number
    section_type?: string
    share_id?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "story_sections_share_id_fkey"
      columns: ["share_id"]
      isOneToOne: false
      referencedRelation: "project_shares"
      referencedColumns: ["id"]
    },
  ]
}
