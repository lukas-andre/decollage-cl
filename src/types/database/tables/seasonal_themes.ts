import type { Json } from '../json'

export type SeasonalThemesTable = {
  Row: {
    banner_image_url: string | null
    code: string
    created_at: string | null
    decoration_elements: Json | null
    description: string | null
    end_date: string | null
    icon_url: string | null
    id: string
    is_active: boolean | null
    is_current: boolean | null
    name: string
    sort_order: number | null
    special_prompts: Json | null
    start_date: string | null
    theme_colors: Json | null
  }
  Insert: {
    banner_image_url?: string | null
    code: string
    created_at?: string | null
    decoration_elements?: Json | null
    description?: string | null
    end_date?: string | null
    icon_url?: string | null
    id?: string
    is_active?: boolean | null
    is_current?: boolean | null
    name: string
    sort_order?: number | null
    special_prompts?: Json | null
    start_date?: string | null
    theme_colors?: Json | null
  }
  Update: {
    banner_image_url?: string | null
    code?: string
    created_at?: string | null
    decoration_elements?: Json | null
    description?: string | null
    end_date?: string | null
    icon_url?: string | null
    id?: string
    is_active?: boolean | null
    is_current?: boolean | null
    name?: string
    sort_order?: number | null
    special_prompts?: Json | null
    start_date?: string | null
    theme_colors?: Json | null
  }
  Relationships: []
}
