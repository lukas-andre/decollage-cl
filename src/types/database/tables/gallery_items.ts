export type GalleryItemsTable = {
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
