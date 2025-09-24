export type ShareConversionsTable = {
  Row: {
    conversion_type: string
    created_at: string | null
    id: string
    ip_address: unknown | null
    referrer_platform: string | null
    share_id: string | null
    user_agent: string | null
    user_id: string | null
    utm_campaign: string | null
    utm_medium: string | null
    utm_source: string | null
  }
  Insert: {
    conversion_type: string
    created_at?: string | null
    id?: string
    ip_address?: unknown | null
    referrer_platform?: string | null
    share_id?: string | null
    user_agent?: string | null
    user_id?: string | null
    utm_campaign?: string | null
    utm_medium?: string | null
    utm_source?: string | null
  }
  Update: {
    conversion_type?: string
    created_at?: string | null
    id?: string
    ip_address?: unknown | null
    referrer_platform?: string | null
    share_id?: string | null
    user_agent?: string | null
    user_id?: string | null
    utm_campaign?: string | null
    utm_medium?: string | null
    utm_source?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "share_conversions_share_id_fkey"
      columns: ["share_id"]
      isOneToOne: false
      referencedRelation: "project_shares"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "share_conversions_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
