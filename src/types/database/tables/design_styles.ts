import type { Json } from '../json'

export type DesignStylesTable = {
  Row: {
    base_prompt: string
    category: string | null
    code: string
    created_at: string | null
    description: string | null
    example_images: Json | null
    id: string
    inspiration_keywords: string[] | null
    is_active: boolean | null
    is_featured: boolean | null
    is_seasonal: boolean | null
    is_trending: boolean | null
    macrocategory: string | null
    name: string
    name_en: string | null
    negative_prompt: string | null
    sort_order: number | null
    usage_count: number | null
  }
  Insert: {
    base_prompt: string
    category?: string | null
    code: string
    created_at?: string | null
    description?: string | null
    example_images?: Json | null
    id?: string
    inspiration_keywords?: string[] | null
    is_active?: boolean | null
    is_featured?: boolean | null
    is_seasonal?: boolean | null
    is_trending?: boolean | null
    macrocategory?: string | null
    name: string
    name_en?: string | null
    negative_prompt?: string | null
    sort_order?: number | null
    usage_count?: number | null
  }
  Update: {
    base_prompt?: string
    category?: string | null
    code?: string
    created_at?: string | null
    description?: string | null
    example_images?: Json | null
    id?: string
    inspiration_keywords?: string[] | null
    is_active?: boolean | null
    is_featured?: boolean | null
    is_seasonal?: boolean | null
    is_trending?: boolean | null
    macrocategory?: string | null
    name?: string
    name_en?: string | null
    negative_prompt?: string | null
    sort_order?: number | null
    usage_count?: number | null
  }
  Relationships: []
}
