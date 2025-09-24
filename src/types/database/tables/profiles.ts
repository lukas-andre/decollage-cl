import type { Json } from '../json'

export type ProfilesTable = {
  Row: {
    avatar_url: string | null
    color_preferences: Json | null
    created_at: string | null
    design_goals: string[] | null
    email: string
    full_name: string | null
    home_type: string | null
    id: string
    instagram_handle: string | null
    is_public: boolean | null
    last_active_at: string | null
    onboarding_completed: boolean | null
    onboarding_step: number | null
    phone: string | null
    pinterest_connected: boolean | null
    pinterest_user_id: string | null
    role: string | null
    style_personality: Json | null
    tokens_available: number | null
    tokens_total_purchased: number | null
    tokens_total_used: number | null
    updated_at: string | null
    user_type: string | null
    username: string | null
  }
  Insert: {
    avatar_url?: string | null
    color_preferences?: Json | null
    created_at?: string | null
    design_goals?: string[] | null
    email: string
    full_name?: string | null
    home_type?: string | null
    id: string
    instagram_handle?: string | null
    is_public?: boolean | null
    last_active_at?: string | null
    onboarding_completed?: boolean | null
    onboarding_step?: number | null
    phone?: string | null
    pinterest_connected?: boolean | null
    pinterest_user_id?: string | null
    role?: string | null
    style_personality?: Json | null
    tokens_available?: number | null
    tokens_total_purchased?: number | null
    tokens_total_used?: number | null
    updated_at?: string | null
    user_type?: string | null
    username?: string | null
  }
  Update: {
    avatar_url?: string | null
    color_preferences?: Json | null
    created_at?: string | null
    design_goals?: string[] | null
    email?: string
    full_name?: string | null
    home_type?: string | null
    id?: string
    instagram_handle?: string | null
    is_public?: boolean | null
    last_active_at?: string | null
    onboarding_completed?: boolean | null
    onboarding_step?: number | null
    phone?: string | null
    pinterest_connected?: boolean | null
    pinterest_user_id?: string | null
    role?: string | null
    style_personality?: Json | null
    tokens_available?: number | null
    tokens_total_purchased?: number | null
    tokens_total_used?: number | null
    updated_at?: string | null
    user_type?: string | null
    username?: string | null
  }
  Relationships: []
}
