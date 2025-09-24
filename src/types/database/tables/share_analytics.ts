export type ShareAnalyticsTable = {
  Row: {
    action: string
    browser: string | null
    country_code: string | null
    created_at: string | null
    device_type: string | null
    id: string
    ip_address: unknown | null
    os: string | null
    platform: string | null
    referrer: string | null
    share_id: string
    share_type: string
    user_agent: string | null
    user_id: string | null
    utm_campaign: string | null
    utm_medium: string | null
    utm_source: string | null
  }
  Insert: {
    action: string
    browser?: string | null
    country_code?: string | null
    created_at?: string | null
    device_type?: string | null
    id?: string
    ip_address?: unknown | null
    os?: string | null
    platform?: string | null
    referrer?: string | null
    share_id: string
    share_type: string
    user_agent?: string | null
    user_id?: string | null
    utm_campaign?: string | null
    utm_medium?: string | null
    utm_source?: string | null
  }
  Update: {
    action?: string
    browser?: string | null
    country_code?: string | null
    created_at?: string | null
    device_type?: string | null
    id?: string
    ip_address?: unknown | null
    os?: string | null
    platform?: string | null
    referrer?: string | null
    share_id?: string
    share_type?: string
    user_agent?: string | null
    user_id?: string | null
    utm_campaign?: string | null
    utm_medium?: string | null
    utm_source?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "share_analytics_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
