export type UserFollowsTable = {
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
