export type PinterestBoardsTable = {
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
