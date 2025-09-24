export type TokenPackagesTable = {
  Row: {
    bonus_percentage: number | null
    bonus_tokens: number | null
    color_theme: string | null
    created_at: string | null
    description: string | null
    icon_name: string | null
    id: string
    is_active: boolean | null
    is_featured: boolean | null
    is_limited_offer: boolean | null
    max_purchase_count: number | null
    min_purchase_count: number | null
    name: string
    offer_ends_at: string | null
    original_price_clp: number | null
    price_clp: number
    sort_order: number | null
    token_amount: number
  }
  Insert: {
    bonus_percentage?: number | null
    bonus_tokens?: number | null
    color_theme?: string | null
    created_at?: string | null
    description?: string | null
    icon_name?: string | null
    id?: string
    is_active?: boolean | null
    is_featured?: boolean | null
    is_limited_offer?: boolean | null
    max_purchase_count?: number | null
    min_purchase_count?: number | null
    name: string
    offer_ends_at?: string | null
    original_price_clp?: number | null
    price_clp: number
    sort_order?: number | null
    token_amount: number
  }
  Update: {
    bonus_percentage?: number | null
    bonus_tokens?: number | null
    color_theme?: string | null
    created_at?: string | null
    description?: string | null
    icon_name?: string | null
    id?: string
    is_active?: boolean | null
    is_featured?: boolean | null
    is_limited_offer?: boolean | null
    max_purchase_count?: number | null
    min_purchase_count?: number | null
    name?: string
    offer_ends_at?: string | null
    original_price_clp?: number | null
    price_clp?: number
    sort_order?: number | null
    token_amount?: number
  }
  Relationships: []
}
