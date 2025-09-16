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
      color_palettes: {
        Row: {
          id: string
          code: string
          name: string
          name_en: string | null
          description: string | null
          primary_colors: Json
          accent_colors: Json | null
          neutral_colors: Json | null
          mood: string | null
          season: string | null
          preview_image_url: string | null
          example_rooms: Json
          is_featured: boolean
          usage_count: number
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_en?: string | null
          description?: string | null
          primary_colors: Json
          accent_colors?: Json | null
          neutral_colors?: Json | null
          mood?: string | null
          season?: string | null
          preview_image_url?: string | null
          example_rooms?: Json
          is_featured?: boolean
          usage_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_en?: string | null
          description?: string | null
          primary_colors?: Json
          accent_colors?: Json | null
          neutral_colors?: Json | null
          mood?: string | null
          season?: string | null
          preview_image_url?: string | null
          example_rooms?: Json
          is_featured?: boolean
          usage_count?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      design_styles: {
        Row: {
          id: string
          code: string
          name: string
          name_en: string | null
          description: string | null
          category: string | null
          macrocategory: string | null
          base_prompt: string
          negative_prompt: string | null
          example_images: Json
          inspiration_keywords: string[] | null
          usage_count: number
          is_featured: boolean
          is_seasonal: boolean
          is_trending: boolean
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_en?: string | null
          description?: string | null
          category?: string | null
          macrocategory?: string | null
          base_prompt: string
          negative_prompt?: string | null
          example_images?: Json
          inspiration_keywords?: string[] | null
          usage_count?: number
          is_featured?: boolean
          is_seasonal?: boolean
          is_trending?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_en?: string | null
          description?: string | null
          category?: string | null
          macrocategory?: string | null
          base_prompt?: string
          negative_prompt?: string | null
          example_images?: Json
          inspiration_keywords?: string[] | null
          usage_count?: number
          is_featured?: boolean
          is_seasonal?: boolean
          is_trending?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      gallery_comments: {
        Row: {
          id: string
          gallery_item_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          is_edited: boolean
          edited_at: string | null
          is_hidden: boolean
          moderation_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gallery_item_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          is_edited?: boolean
          edited_at?: string | null
          is_hidden?: boolean
          moderation_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          gallery_item_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          is_edited?: boolean
          edited_at?: string | null
          is_hidden?: boolean
          moderation_reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_comments_gallery_item_id_fkey"
            columns: ["gallery_item_id"]
            isOneToOne: false
            referencedRelation: "gallery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "gallery_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_interactions: {
        Row: {
          id: string
          user_id: string
          gallery_item_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gallery_item_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gallery_item_id?: string
          interaction_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_interactions_gallery_item_id_fkey"
            columns: ["gallery_item_id"]
            isOneToOne: false
            referencedRelation: "gallery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          id: string
          transformation_id: string | null
          moodboard_id: string | null
          user_id: string
          title: string
          description: string | null
          before_image_url: string | null
          after_image_url: string | null
          tags: string[] | null
          style_tags: string[] | null
          room_type: string | null
          budget_range: string | null
          views_count: number
          likes_count: number
          saves_count: number
          comments_count: number
          is_featured: boolean
          is_editors_pick: boolean
          featured_order: number | null
          featured_at: string | null
          is_active: boolean
          moderation_status: string
          created_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          transformation_id?: string | null
          moodboard_id?: string | null
          user_id: string
          title: string
          description?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
          tags?: string[] | null
          style_tags?: string[] | null
          room_type?: string | null
          budget_range?: string | null
          views_count?: number
          likes_count?: number
          saves_count?: number
          comments_count?: number
          is_featured?: boolean
          is_editors_pick?: boolean
          featured_order?: number | null
          featured_at?: string | null
          is_active?: boolean
          moderation_status?: string
          created_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          transformation_id?: string | null
          moodboard_id?: string | null
          user_id?: string
          title?: string
          description?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
          tags?: string[] | null
          style_tags?: string[] | null
          room_type?: string | null
          budget_range?: string | null
          views_count?: number
          likes_count?: number
          saves_count?: number
          comments_count?: number
          is_featured?: boolean
          is_editors_pick?: boolean
          featured_order?: number | null
          featured_at?: string | null
          is_active?: boolean
          moderation_status?: string
          created_at?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          url: string
          cloudflare_id: string | null
          thumbnail_url: string | null
          image_type: string
          source: string | null
          pinterest_pin_id: string | null
          pinterest_board_id: string | null
          name: string | null
          description: string | null
          tags: string[] | null
          colors: Json | null
          style_tags: string[] | null
          room_type: string | null
          embedding: string | null
          analysis_data: Json | null
          is_primary: boolean
          upload_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          url: string
          cloudflare_id?: string | null
          thumbnail_url?: string | null
          image_type: string
          source?: string | null
          pinterest_pin_id?: string | null
          pinterest_board_id?: string | null
          name?: string | null
          description?: string | null
          tags?: string[] | null
          colors?: Json | null
          style_tags?: string[] | null
          room_type?: string | null
          embedding?: string | null
          analysis_data?: Json | null
          is_primary?: boolean
          upload_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          url?: string
          cloudflare_id?: string | null
          thumbnail_url?: string | null
          image_type?: string
          source?: string | null
          pinterest_pin_id?: string | null
          pinterest_board_id?: string | null
          name?: string | null
          description?: string | null
          tags?: string[] | null
          colors?: Json | null
          style_tags?: string[] | null
          room_type?: string | null
          embedding?: string | null
          analysis_data?: Json | null
          is_primary?: boolean
          upload_order?: number | null
          created_at?: string
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
      moodboard_images: {
        Row: {
          id: string
          moodboard_id: string
          image_id: string
          position: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          moodboard_id: string
          image_id: string
          position?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          moodboard_id?: string
          image_id?: string
          position?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_images_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboard_images_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboards: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          name: string
          description: string | null
          synthesized_style: Json | null
          color_palette: Json | null
          style_keywords: string[] | null
          is_public: boolean
          share_url: string | null
          images_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          name: string
          description?: string | null
          synthesized_style?: Json | null
          color_palette?: Json | null
          style_keywords?: string[] | null
          is_public?: boolean
          share_url?: string | null
          images_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          name?: string
          description?: string | null
          synthesized_style?: Json | null
          color_palette?: Json | null
          style_keywords?: string[] | null
          is_public?: boolean
          share_url?: string | null
          images_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moodboards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pinterest_boards: {
        Row: {
          id: string
          user_id: string
          pinterest_board_id: string
          name: string
          description: string | null
          url: string | null
          auto_sync: boolean
          sync_to_project_id: string | null
          last_synced_at: string | null
          pins_count: number
          synced_pins_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pinterest_board_id: string
          name: string
          description?: string | null
          url?: string | null
          auto_sync?: boolean
          sync_to_project_id?: string | null
          last_synced_at?: string | null
          pins_count?: number
          synced_pins_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pinterest_board_id?: string
          name?: string
          description?: string | null
          url?: string | null
          auto_sync?: boolean
          sync_to_project_id?: string | null
          last_synced_at?: string | null
          pins_count?: number
          synced_pins_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_boards_sync_to_project_id_fkey"
            columns: ["sync_to_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinterest_boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pinterest_pins: {
        Row: {
          id: string
          user_id: string
          board_id: string | null
          image_id: string | null
          pinterest_pin_id: string
          title: string | null
          description: string | null
          url: string | null
          image_url: string | null
          detected_style: string[] | null
          detected_colors: Json | null
          imported_at: string
          is_processed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          board_id?: string | null
          image_id?: string | null
          pinterest_pin_id: string
          title?: string | null
          description?: string | null
          url?: string | null
          image_url?: string | null
          detected_style?: string[] | null
          detected_colors?: Json | null
          imported_at?: string
          is_processed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          board_id?: string | null
          image_id?: string | null
          pinterest_pin_id?: string
          title?: string | null
          description?: string | null
          url?: string | null
          image_url?: string | null
          detected_style?: string[] | null
          detected_colors?: Json | null
          imported_at?: string
          is_processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_pins_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "pinterest_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinterest_pins_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinterest_pins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          tokens_available: number
          tokens_total_purchased: number
          tokens_total_used: number
          style_personality: Json
          color_preferences: Json
          design_goals: string[] | null
          home_type: string | null
          is_public: boolean
          instagram_handle: string | null
          pinterest_connected: boolean
          pinterest_user_id: string | null
          onboarding_completed: boolean
          onboarding_step: number
          last_active_at: string | null
          created_at: string
          updated_at: string
          role: string
          user_type: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          tokens_available?: number
          tokens_total_purchased?: number
          tokens_total_used?: number
          style_personality?: Json
          color_preferences?: Json
          design_goals?: string[] | null
          home_type?: string | null
          is_public?: boolean
          instagram_handle?: string | null
          pinterest_connected?: boolean
          pinterest_user_id?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
          role?: string
          user_type?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          tokens_available?: number
          tokens_total_purchased?: number
          tokens_total_used?: number
          style_personality?: Json
          color_preferences?: Json
          design_goals?: string[] | null
          home_type?: string | null
          is_public?: boolean
          instagram_handle?: string | null
          pinterest_connected?: boolean
          pinterest_user_id?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
          role?: string
          user_type?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string | null
          description: string | null
          cover_image_url: string | null
          project_type: string
          space_type: string | null
          status: string
          completion_percentage: number
          is_public: boolean
          is_featured: boolean
          share_token: string | null
          total_transformations: number
          total_inspirations: number
          total_views: number
          total_likes: number
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug?: string | null
          description?: string | null
          cover_image_url?: string | null
          project_type?: string
          space_type?: string | null
          status?: string
          completion_percentage?: number
          is_public?: boolean
          is_featured?: boolean
          share_token?: string | null
          total_transformations?: number
          total_inspirations?: number
          total_views?: number
          total_likes?: number
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string | null
          description?: string | null
          cover_image_url?: string | null
          project_type?: string
          space_type?: string | null
          status?: string
          completion_percentage?: number
          is_public?: boolean
          is_featured?: boolean
          share_token?: string | null
          total_transformations?: number
          total_inspirations?: number
          total_views?: number
          total_likes?: number
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          id: string
          code: string
          name: string
          name_en: string | null
          description: string | null
          icon_name: string | null
          typical_dimensions: Json | null
          suggested_styles: string[] | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_en?: string | null
          description?: string | null
          icon_name?: string | null
          typical_dimensions?: Json | null
          suggested_styles?: string[] | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_en?: string | null
          description?: string | null
          icon_name?: string | null
          typical_dimensions?: Json | null
          suggested_styles?: string[] | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      seasonal_themes: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          theme_colors: Json | null
          decoration_elements: Json | null
          special_prompts: Json | null
          banner_image_url: string | null
          icon_url: string | null
          is_active: boolean
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          theme_colors?: Json | null
          decoration_elements?: Json | null
          special_prompts?: Json | null
          banner_image_url?: string | null
          icon_url?: string | null
          is_active?: boolean
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          theme_colors?: Json | null
          decoration_elements?: Json | null
          special_prompts?: Json | null
          banner_image_url?: string | null
          icon_url?: string | null
          is_active?: boolean
          is_current?: boolean
          created_at?: string
        }
        Relationships: []
      }
      token_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          token_amount: number
          price_clp: number
          original_price_clp: number | null
          bonus_tokens: number
          bonus_percentage: number | null
          icon_name: string | null
          color_theme: string | null
          is_featured: boolean
          is_limited_offer: boolean
          offer_ends_at: string | null
          min_purchase_count: number | null
          max_purchase_count: number | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          token_amount: number
          price_clp: number
          original_price_clp?: number | null
          bonus_tokens?: number
          bonus_percentage?: number | null
          icon_name?: string | null
          color_theme?: string | null
          is_featured?: boolean
          is_limited_offer?: boolean
          offer_ends_at?: string | null
          min_purchase_count?: number | null
          max_purchase_count?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          token_amount?: number
          price_clp?: number
          original_price_clp?: number | null
          bonus_tokens?: number
          bonus_percentage?: number | null
          icon_name?: string | null
          color_theme?: string | null
          is_featured?: boolean
          is_limited_offer?: boolean
          offer_ends_at?: string | null
          min_purchase_count?: number | null
          max_purchase_count?: number | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          balance_before: number
          balance_after: number
          transformation_id: string | null
          package_id: string | null
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          balance_before: number
          balance_after: number
          transformation_id?: string | null
          package_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          balance_before?: number
          balance_after?: number
          transformation_id?: string | null
          package_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "token_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transformation_iterations: {
        Row: {
          id: string
          transformation_id: string
          parent_iteration_id: string | null
          refinement_prompt: string | null
          changes_applied: Json | null
          result_image_url: string | null
          result_cloudflare_id: string | null
          iteration_number: number
          tokens_consumed: number
          created_at: string
        }
        Insert: {
          id?: string
          transformation_id: string
          parent_iteration_id?: string | null
          refinement_prompt?: string | null
          changes_applied?: Json | null
          result_image_url?: string | null
          result_cloudflare_id?: string | null
          iteration_number: number
          tokens_consumed?: number
          created_at?: string
        }
        Update: {
          id?: string
          transformation_id?: string
          parent_iteration_id?: string | null
          refinement_prompt?: string | null
          changes_applied?: Json | null
          result_image_url?: string | null
          result_cloudflare_id?: string | null
          iteration_number?: number
          tokens_consumed?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformation_iterations_parent_iteration_id_fkey"
            columns: ["parent_iteration_id"]
            isOneToOne: false
            referencedRelation: "transformation_iterations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_iterations_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          base_image_id: string | null
          moodboard_id: string | null
          style_id: string | null
          palette_id: string | null
          season_id: string | null
          prompt_used: string | null
          custom_instructions: string | null
          inspiration_weight: number | null
          result_image_url: string | null
          result_cloudflare_id: string | null
          variations: Json | null
          status: string
          error_message: string | null
          tokens_consumed: number
          processing_time_ms: number | null
          is_favorite: boolean
          rating: number | null
          user_notes: string | null
          is_shared: boolean
          share_count: number
          metadata: Json
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          base_image_id?: string | null
          moodboard_id?: string | null
          style_id?: string | null
          palette_id?: string | null
          season_id?: string | null
          prompt_used?: string | null
          custom_instructions?: string | null
          inspiration_weight?: number | null
          result_image_url?: string | null
          result_cloudflare_id?: string | null
          variations?: Json | null
          status?: string
          error_message?: string | null
          tokens_consumed?: number
          processing_time_ms?: number | null
          is_favorite?: boolean
          rating?: number | null
          user_notes?: string | null
          is_shared?: boolean
          share_count?: number
          metadata?: Json
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          base_image_id?: string | null
          moodboard_id?: string | null
          style_id?: string | null
          palette_id?: string | null
          season_id?: string | null
          prompt_used?: string | null
          custom_instructions?: string | null
          inspiration_weight?: number | null
          result_image_url?: string | null
          result_cloudflare_id?: string | null
          variations?: Json | null
          status?: string
          error_message?: string | null
          tokens_consumed?: number
          processing_time_ms?: number | null
          is_favorite?: boolean
          rating?: number | null
          user_notes?: string | null
          is_shared?: boolean
          share_count?: number
          metadata?: Json
          created_at?: string
          completed_at?: string | null
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
      user_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          event_type: string
          event_category: string | null
          event_data: Json
          project_id: string | null
          page_path: string | null
          referrer: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          event_type: string
          event_category?: string | null
          event_data?: Json
          project_id?: string | null
          page_path?: string | null
          referrer?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          event_type?: string
          event_category?: string | null
          event_data?: Json
          project_id?: string | null
          page_path?: string | null
          referrer?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          interest_type: string | null
          home_type: string | null
          biggest_challenge: string | null
          referral_source: string | null
          referral_code: string | null
          status: string
          invited_at: string | null
          converted_at: string | null
          email_opens: number
          email_clicks: number
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          interest_type?: string | null
          home_type?: string | null
          biggest_challenge?: string | null
          referral_source?: string | null
          referral_code?: string | null
          status?: string
          invited_at?: string | null
          converted_at?: string | null
          email_opens?: number
          email_clicks?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          interest_type?: string | null
          home_type?: string | null
          biggest_challenge?: string | null
          referral_source?: string | null
          referral_code?: string | null
          status?: string
          invited_at?: string | null
          converted_at?: string | null
          email_opens?: number
          email_clicks?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_tokens: {
        Args: {
          p_user_id: string
          p_amount: number
          p_transformation_id?: string
          p_description?: string
        }
        Returns: boolean
      }
      generate_unique_username: {
        Args: {
          base_name: string
        }
        Returns: string
      }
      get_user_token_balance: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      grant_bonus_tokens: {
        Args: {
          p_user_id: string
          p_amount: number
          p_reason: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      is_username_available: {
        Args: {
          username_to_check: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific types for common use
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type Transformation = Tables<'transformations'>
export type Image = Tables<'images'>
export type Moodboard = Tables<'moodboards'>
export type DesignStyle = Tables<'design_styles'>
export type ColorPalette = Tables<'color_palettes'>
export type SeasonalTheme = Tables<'seasonal_themes'>
export type RoomType = Tables<'room_types'>
export type TokenPackage = Tables<'token_packages'>
export type TokenTransaction = Tables<'token_transactions'>
export type GalleryItem = Tables<'gallery_items'>
export type UserEvent = Tables<'user_events'>
export type PinterestBoard = Tables<'pinterest_boards'>
export type PinterestPin = Tables<'pinterest_pins'>

// Enums for type safety
export type UserRole = 'user' | 'admin' | 'moderator'
export type UserType = 'personal' | 'professional' | 'other'
export type ProjectType = 'transformation' | 'moodboard' | 'seasonal'
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'
export type TransformationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ImageType = 'room' | 'inspiration' | 'pinterest' | 'generated'
export type ImageSource = 'upload' | 'pinterest' | 'ai' | 'gallery'
export type InteractionType = 'like' | 'save' | 'view'
export type TokenTransactionType = 'purchase' | 'consumption' | 'bonus' | 'refund' | 'gift'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'
export type BudgetRange = 'economico' | 'medio' | 'premium'
export type StyleCategory = 'clasico' | 'moderno' | 'rustico' | 'bohemio' | 'minimalista'
export type StyleMacroCategory = 'Modern' | 'Classic' | 'Regional' | 'Luxury' | 'Nature' | 'Lifestyle'
export type ColorMood = 'calido' | 'fresco' | 'acogedor' | 'energetico' | 'romantico'
export type Season = 'verano' | 'oto�o' | 'invierno' | 'primavera' | 'todo-el-a�o'
export type HomeType = 'casa' | 'departamento' | 'oficina'
export type InterestType = 'personal' | 'profesional' | 'curiosidad'
export type ReferralSource = 'instagram' | 'facebook' | 'amiga' | 'google'
export type WaitlistStatus = 'pending' | 'invited' | 'converted'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type EventCategory = 'onboarding' | 'creation' | 'social' | 'purchase'
export type ColorTheme = 'pink' | 'purple' | 'gold' | 'platinum'