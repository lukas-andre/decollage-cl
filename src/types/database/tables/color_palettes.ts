import type { Json } from '../json'

export type ColorPalettesTable = {
  Row: {
    accent_colors: Json | null
    code: string
    created_at: string | null
    description: string | null
    example_rooms: Json | null
    id: string
    is_active: boolean | null
    is_featured: boolean | null
    mood: string | null
    name: string
    name_en: string | null
    neutral_colors: Json | null
    preview_image_url: string | null
    primary_colors: Json
    season: string | null
    sort_order: number | null
    usage_count: number | null
  }
  Insert: {
    accent_colors?: Json | null
    code: string
    created_at?: string | null
    description?: string | null
    example_rooms?: Json | null
    id?: string
    is_active?: boolean | null
    is_featured?: boolean | null
    mood?: string | null
    name: string
    name_en?: string | null
    neutral_colors?: Json | null
    preview_image_url?: string | null
    primary_colors: Json
    season?: string | null
    sort_order?: number | null
    usage_count?: number | null
  }
  Update: {
    accent_colors?: Json | null
    code?: string
    created_at?: string | null
    description?: string | null
    example_rooms?: Json | null
    id?: string
    is_active?: boolean | null
    is_featured?: boolean | null
    mood?: string | null
    name?: string
    name_en?: string | null
    neutral_colors?: Json | null
    preview_image_url?: string | null
    primary_colors?: Json
    season?: string | null
    sort_order?: number | null
    usage_count?: number | null
  }
  Relationships: []
}
