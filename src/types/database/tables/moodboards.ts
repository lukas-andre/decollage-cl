import type { Json } from '../json'

export type MoodboardsTable = {
  Row: {
    color_palette: Json | null
    created_at: string | null
    description: string | null
    id: string
    images_count: number | null
    is_public: boolean | null
    name: string
    project_id: string | null
    share_settings: Json | null
    share_url: string | null
    style_keywords: string[] | null
    synthesized_style: Json | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    color_palette?: Json | null
    created_at?: string | null
    description?: string | null
    id?: string
    images_count?: number | null
    is_public?: boolean | null
    name: string
    project_id?: string | null
    share_settings?: Json | null
    share_url?: string | null
    style_keywords?: string[] | null
    synthesized_style?: Json | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    color_palette?: Json | null
    created_at?: string | null
    description?: string | null
    id?: string
    images_count?: number | null
    is_public?: boolean | null
    name?: string
    project_id?: string | null
    share_settings?: Json | null
    share_url?: string | null
    style_keywords?: string[] | null
    synthesized_style?: Json | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "moodboards_project_id_fkey"
      columns: ["project_id"]
      isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "moodboards_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
