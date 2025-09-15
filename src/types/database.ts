export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          error_data: Json | null
          flow_commerce_id: string | null
          flow_order_id: string | null
          flow_session_id: string | null
          id: string
          initiated_at: string | null
          metadata: Json | null
          package_id: string | null
          payment_method: string | null
          response_data: Json | null
          status: string | null
          tokens_granted: number | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          error_data?: Json | null
          flow_commerce_id?: string | null
          flow_order_id?: string | null
          flow_session_id?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          package_id?: string | null
          payment_method?: string | null
          response_data?: Json | null
          status?: string | null
          tokens_granted?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          error_data?: Json | null
          flow_commerce_id?: string | null
          flow_order_id?: string | null
          flow_session_id?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          package_id?: string | null
          payment_method?: string | null
          response_data?: Json | null
          status?: string | null
          tokens_granted?: number | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          onboarding_completed: boolean | null
          phone: string | null
          preferences: Json | null
          preferred_language: string | null
          privacy_settings: Json | null
          profile_completion: number | null
          role: string | null
          settings: Json | null
          stats: Json | null
          tokens: number | null
          tokens_available: number | null
          tokens_total_purchased: number | null
          tokens_total_used: number | null
          updated_at: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          profile_completion?: number | null
          role?: string | null
          settings?: Json | null
          stats?: Json | null
          tokens?: number | null
          tokens_available?: number | null
          tokens_total_purchased?: number | null
          tokens_total_used?: number | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          profile_completion?: number | null
          role?: string | null
          settings?: Json | null
          stats?: Json | null
          tokens?: number | null
          tokens_available?: number | null
          tokens_total_purchased?: number | null
          tokens_total_used?: number | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
      }
      staging_generations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          generation_params: Json | null
          id: string
          is_favorite: boolean | null
          is_public: boolean | null
          metadata: Json | null
          original_cloudflare_id: string | null
          original_image_url: string
          processed_cloudflare_id: string | null
          processed_image_url: string | null
          processing_time_ms: number | null
          prompt_used: string | null
          started_at: string | null
          status: string | null
          style_id: string | null
          tokens_consumed: number | null
          user_id: string
          user_prompt: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_params?: Json | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          original_cloudflare_id?: string | null
          original_image_url: string
          processed_cloudflare_id?: string | null
          processed_image_url?: string | null
          processing_time_ms?: number | null
          prompt_used?: string | null
          started_at?: string | null
          status?: string | null
          style_id?: string | null
          tokens_consumed?: number | null
          user_id: string
          user_prompt?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_params?: Json | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          original_cloudflare_id?: string | null
          original_image_url?: string
          processed_cloudflare_id?: string | null
          processed_image_url?: string | null
          processing_time_ms?: number | null
          prompt_used?: string | null
          started_at?: string | null
          status?: string | null
          style_id?: string | null
          tokens_consumed?: number | null
          user_id?: string
          user_prompt?: string | null
        }
      }
      staging_styles: {
        Row: {
          ai_config: Json | null
          base_prompt: string
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          example_image: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          token_cost: number | null
          updated_at: string | null
        }
        Insert: {
          ai_config?: Json | null
          base_prompt: string
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          example_image?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          token_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_config?: Json | null
          base_prompt?: string
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          example_image?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          token_cost?: number | null
          updated_at?: string | null
        }
      }
      token_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          original_price_clp: number | null
          price_clp: number
          sort_order: number | null
          tokens: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          original_price_clp?: number | null
          price_clp: number
          sort_order?: number | null
          tokens: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          original_price_clp?: number | null
          price_clp?: number
          sort_order?: number | null
          tokens?: number
          updated_at?: string | null
        }
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      add_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      complete_generation: {
        Args: {
          p_ai_model: string
          p_cloudflare_id: string
          p_generation_id: string
          p_output_image_url: string
          p_processing_time_ms: number
        }
        Returns: boolean
      }
      consume_tokens: {
        Args: { tokens_to_consume: number; user_id: string }
        Returns: boolean
      }
      fail_generation: {
        Args: {
          p_error_message: string
          p_generation_id: string
          p_refund?: boolean
        }
        Returns: boolean
      }
      process_payment_success: {
        Args: {
          p_amount_clp: number
          p_flow_data: Json
          p_package_id: string
          p_payment_id: string
          p_payment_method: string
          p_user_id: string
        }
        Returns: boolean
      }
      start_generation: {
        Args: {
          p_input_image_url: string
          p_room_type: string
          p_style_id: string
          p_style_preferences: Json
          p_token_cost: number
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}

// Helper types for better type safety
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']