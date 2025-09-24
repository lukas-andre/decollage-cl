export type ContentReactionsTable = {
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
