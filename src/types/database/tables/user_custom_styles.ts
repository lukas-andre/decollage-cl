import type { Json } from '../json'

export type UserCustomStylesTable = {
  Row: {
    base_prompt: string
    based_on_style_id: string | null
    created_at: string | null
    id: string
    is_public: boolean | null
    metadata: Json | null
    negative_prompt: string | null
    preview_image_url: string | null
    source_space_code: string | null
    style_name: string
    updated_at: string | null
    usage_count: number | null
    user_id: string
  }
  Insert: {
    base_prompt: string
    based_on_style_id?: string | null
    created_at?: string | null
    id?: string
    is_public?: boolean | null
    metadata?: Json | null
    negative_prompt?: string | null
    preview_image_url?: string | null
    source_space_code?: string | null
    style_name: string
    updated_at?: string | null
    usage_count?: number | null
    user_id: string
  }
  Update: {
    base_prompt?: string
    based_on_style_id?: string | null
    created_at?: string | null
    id?: string
    is_public?: boolean | null
    metadata?: Json | null
    negative_prompt?: string | null
    preview_image_url?: string | null
    source_space_code?: string | null
    style_name?: string
    updated_at?: string | null
    usage_count?: number | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "user_custom_styles_based_on_style_id_fkey"
      columns: ["based_on_style_id"]
      isOneToOne: false
      referencedRelation: "design_styles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "user_custom_styles_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
