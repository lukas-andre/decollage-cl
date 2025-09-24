export type GalleryInteractionsTable = {
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
