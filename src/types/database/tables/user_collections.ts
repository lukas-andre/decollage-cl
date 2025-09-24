export type UserCollectionsTable = {
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
