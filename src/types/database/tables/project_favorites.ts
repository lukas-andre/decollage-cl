export type ProjectFavoritesTable = {
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
