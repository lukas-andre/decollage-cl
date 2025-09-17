export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      collection_items: {
        Row: {
          added_at: string | null
          collection_id: string
          id: string
          item_id: string
          item_type: string
          metadata: Json | null
          notes: string | null
          position: number | null
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          id?: string
          item_id: string
          item_type: string
          metadata?: Json | null
          notes?: string | null
          position?: number | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          id?: string
          item_id?: string
          item_type?: string
          metadata?: Json | null
          notes?: string | null
          position?: number | null
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "user_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      color_palettes: {
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
      content_reactions: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          reaction_type: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      design_styles: {
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
      gallery_comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          gallery_item_id: string
          id: string
          is_edited: boolean | null
          is_hidden: boolean | null
          moderation_reason: string | null
          parent_comment_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          gallery_item_id: string
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          moderation_reason?: string | null
          parent_comment_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          gallery_item_id?: string
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          moderation_reason?: string | null
          parent_comment_id?: string | null
          user_id?: string
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
          created_at: string | null
          gallery_item_id: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gallery_item_id: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          gallery_item_id?: string
          id?: string
          interaction_type?: string
          user_id?: string
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
          after_image_url: string | null
          before_image_url: string | null
          budget_range: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          featured_at: string | null
          featured_order: number | null
          id: string
          is_active: boolean | null
          is_editors_pick: boolean | null
          is_featured: boolean | null
          likes_count: number | null
          moderation_status: string | null
          moodboard_id: string | null
          published_at: string | null
          room_type: string | null
          saves_count: number | null
          style_tags: string[] | null
          tags: string[] | null
          title: string
          transformation_id: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          budget_range?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          featured_at?: string | null
          featured_order?: number | null
          id?: string
          is_active?: boolean | null
          is_editors_pick?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          moderation_status?: string | null
          moodboard_id?: string | null
          published_at?: string | null
          room_type?: string | null
          saves_count?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          title: string
          transformation_id?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          budget_range?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          featured_at?: string | null
          featured_order?: number | null
          id?: string
          is_active?: boolean | null
          is_editors_pick?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          moderation_status?: string | null
          moodboard_id?: string | null
          published_at?: string | null
          room_type?: string | null
          saves_count?: number | null
          style_tags?: string[] | null
          tags?: string[] | null
          title?: string
          transformation_id?: string | null
          user_id?: string
          views_count?: number | null
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
          analysis_data: Json | null
          cloudflare_id: string | null
          colors: Json | null
          created_at: string | null
          description: string | null
          embedding: string | null
          id: string
          image_type: string
          is_primary: boolean | null
          name: string | null
          pinterest_board_id: string | null
          pinterest_pin_id: string | null
          project_id: string | null
          room_type: string | null
          source: string | null
          style_tags: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          upload_order: number | null
          url: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          cloudflare_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          image_type: string
          is_primary?: boolean | null
          name?: string | null
          pinterest_board_id?: string | null
          pinterest_pin_id?: string | null
          project_id?: string | null
          room_type?: string | null
          source?: string | null
          style_tags?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          upload_order?: number | null
          url: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          cloudflare_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          image_type?: string
          is_primary?: boolean | null
          name?: string | null
          pinterest_board_id?: string | null
          pinterest_pin_id?: string | null
          project_id?: string | null
          room_type?: string | null
          source?: string | null
          style_tags?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          upload_order?: number | null
          url?: string
          user_id?: string
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
          created_at: string | null
          id: string
          image_id: string
          moodboard_id: string
          notes: string | null
          position: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_id: string
          moodboard_id: string
          notes?: string | null
          position?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_id?: string
          moodboard_id?: string
          notes?: string | null
          position?: number | null
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
          color_palette: Json | null
          created_at: string | null
          description: string | null
          id: string
          images_count: number | null
          is_public: boolean | null
          name: string
          project_id: string | null
          share_settings: Json | null
          share_url: string | null
          style_keywords: string[] | null
          synthesized_style: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color_palette?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          images_count?: number | null
          is_public?: boolean | null
          name: string
          project_id?: string | null
          share_settings?: Json | null
          share_url?: string | null
          style_keywords?: string[] | null
          synthesized_style?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color_palette?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          images_count?: number | null
          is_public?: boolean | null
          name?: string
          project_id?: string | null
          share_settings?: Json | null
          share_url?: string | null
          style_keywords?: string[] | null
          synthesized_style?: Json | null
          updated_at?: string | null
          user_id?: string
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
          auto_sync: boolean | null
          created_at: string | null
          description: string | null
          id: string
          last_synced_at: string | null
          name: string
          pins_count: number | null
          pinterest_board_id: string
          sync_to_project_id: string | null
          synced_pins_count: number | null
          url: string | null
          user_id: string
        }
        Insert: {
          auto_sync?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_synced_at?: string | null
          name: string
          pins_count?: number | null
          pinterest_board_id: string
          sync_to_project_id?: string | null
          synced_pins_count?: number | null
          url?: string | null
          user_id: string
        }
        Update: {
          auto_sync?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string
          pins_count?: number | null
          pinterest_board_id?: string
          sync_to_project_id?: string | null
          synced_pins_count?: number | null
          url?: string | null
          user_id?: string
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
          board_id: string | null
          description: string | null
          detected_colors: Json | null
          detected_style: string[] | null
          id: string
          image_id: string | null
          image_url: string | null
          imported_at: string | null
          is_processed: boolean | null
          pinterest_pin_id: string
          title: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          board_id?: string | null
          description?: string | null
          detected_colors?: Json | null
          detected_style?: string[] | null
          id?: string
          image_id?: string | null
          image_url?: string | null
          imported_at?: string | null
          is_processed?: boolean | null
          pinterest_pin_id: string
          title?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          board_id?: string | null
          description?: string | null
          detected_colors?: Json | null
          detected_style?: string[] | null
          id?: string
          image_id?: string | null
          image_url?: string | null
          imported_at?: string | null
          is_processed?: boolean | null
          pinterest_pin_id?: string
          title?: string | null
          url?: string | null
          user_id?: string
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
      project_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          position: number | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          position?: number | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          position?: number | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_favorites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_views: number | null
          description: string | null
          expires_at: string | null
          featured_items: string[] | null
          id: string
          last_viewed_at: string | null
          max_views: number | null
          og_image_generated_at: string | null
          og_image_url: string | null
          password_hash: string | null
          project_id: string
          share_token: string
          share_type: string
          theme_override: Json | null
          title: string | null
          visibility: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_views?: number | null
          description?: string | null
          expires_at?: string | null
          featured_items?: string[] | null
          id?: string
          last_viewed_at?: string | null
          max_views?: number | null
          og_image_generated_at?: string | null
          og_image_url?: string | null
          password_hash?: string | null
          project_id: string
          share_token: string
          share_type?: string
          theme_override?: Json | null
          title?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_views?: number | null
          description?: string | null
          expires_at?: string | null
          featured_items?: string[] | null
          id?: string
          last_viewed_at?: string | null
          max_views?: number | null
          og_image_generated_at?: string | null
          og_image_url?: string | null
          password_hash?: string | null
          project_id?: string
          share_token?: string
          share_type?: string
          theme_override?: Json | null
          title?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          completion_percentage: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          metadata: Json | null
          name: string
          og_image_url: string | null
          project_type: string | null
          share_analytics: Json | null
          share_settings: Json | null
          share_token: string | null
          slug: string | null
          space_type: string | null
          status: string | null
          tags: string[] | null
          total_inspirations: number | null
          total_likes: number | null
          total_transformations: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          og_image_url?: string | null
          project_type?: string | null
          share_analytics?: Json | null
          share_settings?: Json | null
          share_token?: string | null
          slug?: string | null
          space_type?: string | null
          status?: string | null
          tags?: string[] | null
          total_inspirations?: number | null
          total_likes?: number | null
          total_transformations?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          og_image_url?: string | null
          project_type?: string | null
          share_analytics?: Json | null
          share_settings?: Json | null
          share_token?: string | null
          slug?: string | null
          space_type?: string | null
          status?: string | null
          tags?: string[] | null
          total_inspirations?: number | null
          total_likes?: number | null
          total_transformations?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
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
          code: string
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          sort_order: number | null
          suggested_styles: string[] | null
          typical_dimensions: Json | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          suggested_styles?: string[] | null
          typical_dimensions?: Json | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          suggested_styles?: string[] | null
          typical_dimensions?: Json | null
        }
        Relationships: []
      }
      seasonal_themes: {
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
      share_analytics: {
        Row: {
          action: string
          browser: string | null
          country_code: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          platform: string | null
          referrer: string | null
          share_id: string
          share_type: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          action: string
          browser?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          platform?: string | null
          referrer?: string | null
          share_id: string
          share_type: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          action?: string
          browser?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          platform?: string | null
          referrer?: string | null
          share_id?: string
          share_type?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      share_templates: {
        Row: {
          aspect_ratio: string | null
          code: string
          created_at: string | null
          description_template: string | null
          hashtags: string[] | null
          height: number | null
          id: string
          include_logo: boolean | null
          include_watermark: boolean | null
          is_active: boolean | null
          is_premium: boolean | null
          layout_type: string | null
          max_images: number | null
          name: string
          platform: string
          theme: Json | null
          title_template: string | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          code: string
          created_at?: string | null
          description_template?: string | null
          hashtags?: string[] | null
          height?: number | null
          id?: string
          include_logo?: boolean | null
          include_watermark?: boolean | null
          is_active?: boolean | null
          is_premium?: boolean | null
          layout_type?: string | null
          max_images?: number | null
          name: string
          platform: string
          theme?: Json | null
          title_template?: string | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          code?: string
          created_at?: string | null
          description_template?: string | null
          hashtags?: string[] | null
          height?: number | null
          id?: string
          include_logo?: boolean | null
          include_watermark?: boolean | null
          is_active?: boolean | null
          is_premium?: boolean | null
          layout_type?: string | null
          max_images?: number | null
          name?: string
          platform?: string
          theme?: Json | null
          title_template?: string | null
          width?: number | null
        }
        Relationships: []
      }
      token_packages: {
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
      token_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          package_id: string | null
          transformation_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string | null
          transformation_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string | null
          transformation_id?: string | null
          type?: string
          user_id?: string
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
          changes_applied: Json | null
          created_at: string | null
          id: string
          iteration_number: number
          parent_iteration_id: string | null
          refinement_prompt: string | null
          result_cloudflare_id: string | null
          result_image_url: string | null
          tokens_consumed: number | null
          transformation_id: string
        }
        Insert: {
          changes_applied?: Json | null
          created_at?: string | null
          id?: string
          iteration_number: number
          parent_iteration_id?: string | null
          refinement_prompt?: string | null
          result_cloudflare_id?: string | null
          result_image_url?: string | null
          tokens_consumed?: number | null
          transformation_id: string
        }
        Update: {
          changes_applied?: Json | null
          created_at?: string | null
          id?: string
          iteration_number?: number
          parent_iteration_id?: string | null
          refinement_prompt?: string | null
          result_cloudflare_id?: string | null
          result_image_url?: string | null
          tokens_consumed?: number | null
          transformation_id?: string
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
      user_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          item_count: number | null
          name: string
          share_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_count?: number | null
          name: string
          share_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_count?: number | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_data: Json | null
          event_type: string
          id: string
          os: string | null
          page_path: string | null
          project_id: string | null
          referrer: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          os?: string | null
          page_path?: string | null
          project_id?: string | null
          referrer?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          os?: string | null
          page_path?: string | null
          project_id?: string | null
          referrer?: string | null
          session_id?: string
          user_id?: string | null
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
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
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
          biggest_challenge: string | null
          converted_at: string | null
          created_at: string | null
          email: string
          email_clicks: number | null
          email_opens: number | null
          home_type: string | null
          id: string
          interest_type: string | null
          invited_at: string | null
          name: string | null
          phone: string | null
          referral_code: string | null
          referral_source: string | null
          status: string | null
        }
        Insert: {
          biggest_challenge?: string | null
          converted_at?: string | null
          created_at?: string | null
          email: string
          email_clicks?: number | null
          email_opens?: number | null
          home_type?: string | null
          id?: string
          interest_type?: string | null
          invited_at?: string | null
          name?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          status?: string | null
        }
        Update: {
          biggest_challenge?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string
          email_clicks?: number | null
          email_opens?: number | null
          home_type?: string | null
          id?: string
          interest_type?: string | null
          invited_at?: string | null
          name?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      consume_tokens: {
        Args: {
          p_amount: number
          p_description?: string
          p_transformation_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_username: {
        Args: { base_name: string }
        Returns: string
      }
      get_user_token_balance: {
        Args: { user_id: string }
        Returns: number
      }
      grant_bonus_tokens: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: boolean
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_username_available: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_owns_content: {
        Args: { content_id_param: string; content_type_param: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const