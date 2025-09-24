import type { Json } from '../json'

export type RoomTypesTable = {
  Row: {
    code: string
    compatible_style_macrocategories: string[] | null
    created_at: string | null
    description: string | null
    icon_name: string | null
    id: string
    is_active: boolean | null
    macrocategory: string | null
    name: string
    name_en: string | null
    sort_order: number | null
    suggested_styles: string[] | null
    typical_dimensions: Json | null
  }
  Insert: {
    code: string
    compatible_style_macrocategories?: string[] | null
    created_at?: string | null
    description?: string | null
    icon_name?: string | null
    id?: string
    is_active?: boolean | null
    macrocategory?: string | null
    name: string
    name_en?: string | null
    sort_order?: number | null
    suggested_styles?: string[] | null
    typical_dimensions?: Json | null
  }
  Update: {
    code?: string
    compatible_style_macrocategories?: string[] | null
    created_at?: string | null
    description?: string | null
    icon_name?: string | null
    id?: string
    is_active?: boolean | null
    macrocategory?: string | null
    name?: string
    name_en?: string | null
    sort_order?: number | null
    suggested_styles?: string[] | null
    typical_dimensions?: Json | null
  }
  Relationships: []
}
