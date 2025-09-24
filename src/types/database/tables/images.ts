import type { Json } from '../json'

export type ImagesTable = {
  Row: {
    analysis_data: Json | null
    cloudflare_id: string | null
    colors: Json | null
    created_at: string | null
    description: string | null
    embedding: string | null
    id: string
    image_type: string
    is_primary: boolean | null
    name: string | null
    pinterest_board_id: string | null
    pinterest_pin_id: string | null
    project_id: string | null
    room_type: string | null
    source: string | null
    style_tags: string[] | null
    tags: string[] | null
    thumbnail_url: string | null
    upload_order: number | null
    url: string
    user_id: string
  }
  Insert: {
    analysis_data?: Json | null
    cloudflare_id?: string | null
    colors?: Json | null
    created_at?: string | null
    description?: string | null
    embedding?: string | null
    id?: string
    image_type: string
    is_primary?: boolean | null
    name?: string | null
    pinterest_board_id?: string | null
    pinterest_pin_id?: string | null
    project_id?: string | null
    room_type?: string | null
    source?: string | null
    style_tags?: string[] | null
    tags?: string[] | null
    thumbnail_url?: string | null
    upload_order?: number | null
    url: string
    user_id: string
  }
  Update: {
    analysis_data?: Json | null
    cloudflare_id?: string | null
    colors?: Json | null
    created_at?: string | null
    description?: string | null
    embedding?: string | null
    id?: string
    image_type?: string
    is_primary?: boolean | null
    name?: string | null
    pinterest_board_id?: string | null
    pinterest_pin_id?: string | null
    project_id?: string | null
    room_type?: string | null
    source?: string | null
    style_tags?: string[] | null
    tags?: string[] | null
    thumbnail_url?: string | null
    upload_order?: number | null
    url?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "images_project_id_fkey"
      columns: ["project_id"]
      isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "images_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
