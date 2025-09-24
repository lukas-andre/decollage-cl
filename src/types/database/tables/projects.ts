import type { Json } from '../json'

export type ProjectsTable = {
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
