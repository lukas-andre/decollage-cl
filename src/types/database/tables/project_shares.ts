import type { Json } from '../json'

export type ProjectSharesTable = {
  Row: {
    author_display: Json | null
    conversion_count: number | null
    created_at: string | null
    created_by: string | null
    current_views: number | null
    description: string | null
    engagement_metrics: Json | null
    expires_at: string | null
    featured_items: string[] | null
    id: string
    last_viewed_at: string | null
    max_views: number | null
    og_image_generated_at: string | null
    og_image_url: string | null
    password_hash: string | null
    pinterest_data: Json | null
    platform_analytics: Json | null
    project_id: string
    share_format: string | null
    share_token: string
    share_type: string
    slug: string | null
    story_data: Json | null
    theme_override: Json | null
    title: string | null
    visibility: string
    whatsapp_message: string | null
  }
  Insert: {
    author_display?: Json | null
    conversion_count?: number | null
    created_at?: string | null
    created_by?: string | null
    current_views?: number | null
    description?: string | null
    engagement_metrics?: Json | null
    expires_at?: string | null
    featured_items?: string[] | null
    id?: string
    last_viewed_at?: string | null
    max_views?: number | null
    og_image_generated_at?: string | null
    og_image_url?: string | null
    password_hash?: string | null
    pinterest_data?: Json | null
    platform_analytics?: Json | null
    project_id: string
    share_format?: string | null
    share_token: string
    share_type?: string
    slug?: string | null
    story_data?: Json | null
    theme_override?: Json | null
    title?: string | null
    visibility?: string
    whatsapp_message?: string | null
  }
  Update: {
    author_display?: Json | null
    conversion_count?: number | null
    created_at?: string | null
    created_by?: string | null
    current_views?: number | null
    description?: string | null
    engagement_metrics?: Json | null
    expires_at?: string | null
    featured_items?: string[] | null
    id?: string
    last_viewed_at?: string | null
    max_views?: number | null
    og_image_generated_at?: string | null
    og_image_url?: string | null
    password_hash?: string | null
    pinterest_data?: Json | null
    platform_analytics?: Json | null
    project_id?: string
    share_format?: string | null
    share_token?: string
    share_type?: string
    slug?: string | null
    story_data?: Json | null
    theme_override?: Json | null
    title?: string | null
    visibility?: string
    whatsapp_message?: string | null
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
