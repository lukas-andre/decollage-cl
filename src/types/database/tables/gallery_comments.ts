export type GalleryCommentsTable = {
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
