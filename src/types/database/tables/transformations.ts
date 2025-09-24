import type { Json } from '../json'

export type TransformationsTable = {
  Row: {
    base_image_id: string | null
    completed_at: string | null
    created_at: string | null
    custom_instructions: string | null
    error_message: string | null
    id: string
    inspiration_weight: number | null
    is_favorite: boolean | null
    is_shared: boolean | null
    metadata: Json | null
    moodboard_id: string | null
    palette_id: string | null
    processing_time_ms: number | null
    project_id: string | null
    prompt_used: string | null
    rating: number | null
    result_cloudflare_id: string | null
    result_image_url: string | null
    season_id: string | null
    share_count: number | null
    share_settings: Json | null
    status: string | null
    style_id: string | null
    tokens_consumed: number | null
    user_id: string
    user_notes: string | null
    variations: Json | null
  }
  Insert: {
    base_image_id?: string | null
    completed_at?: string | null
    created_at?: string | null
    custom_instructions?: string | null
    error_message?: string | null
    id?: string
    inspiration_weight?: number | null
    is_favorite?: boolean | null
    is_shared?: boolean | null
    metadata?: Json | null
    moodboard_id?: string | null
    palette_id?: string | null
    processing_time_ms?: number | null
    project_id?: string | null
    prompt_used?: string | null
    rating?: number | null
    result_cloudflare_id?: string | null
    result_image_url?: string | null
    season_id?: string | null
    share_count?: number | null
    share_settings?: Json | null
    status?: string | null
    style_id?: string | null
    tokens_consumed?: number | null
    user_id: string
    user_notes?: string | null
    variations?: Json | null
  }
  Update: {
    base_image_id?: string | null
    completed_at?: string | null
    created_at?: string | null
    custom_instructions?: string | null
    error_message?: string | null
    id?: string
    inspiration_weight?: number | null
    is_favorite?: boolean | null
    is_shared?: boolean | null
    metadata?: Json | null
    moodboard_id?: string | null
    palette_id?: string | null
    processing_time_ms?: number | null
    project_id?: string | null
    prompt_used?: string | null
    rating?: number | null
    result_cloudflare_id?: string | null
    result_image_url?: string | null
    season_id?: string | null
    share_count?: number | null
    share_settings?: Json | null
    status?: string | null
    style_id?: string | null
    tokens_consumed?: number | null
    user_id?: string
    user_notes?: string | null
    variations?: Json | null
  }
  Relationships: [
    {
      foreignKeyName: "transformations_base_image_id_fkey"
      columns: ["base_image_id"]
      isOneToOne: false
      referencedRelation: "images"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_moodboard_id_fkey"
      columns: ["moodboard_id"]
      isOneToOne: false
      referencedRelation: "moodboards"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_palette_id_fkey"
      columns: ["palette_id"]
      isOneToOne: false
      referencedRelation: "color_palettes"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_project_id_fkey"
      columns: ["project_id"]
      isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_season_id_fkey"
      columns: ["season_id"]
      isOneToOne: false
      referencedRelation: "seasonal_themes"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_style_id_fkey"
      columns: ["style_id"]
      isOneToOne: false
      referencedRelation: "design_styles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformations_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
