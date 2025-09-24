export type WaitlistTable = {
  Row: {
    biggest_challenge: string | null
    converted_at: string | null
    created_at: string | null
    email: string
    email_clicks: number | null
    email_opens: number | null
    home_type: string | null
    id: string
    interest_type: string | null
    invited_at: string | null
    name: string | null
    phone: string | null
    referral_code: string | null
    referral_source: string | null
    status: string | null
  }
  Insert: {
    biggest_challenge?: string | null
    converted_at?: string | null
    created_at?: string | null
    email: string
    email_clicks?: number | null
    email_opens?: number | null
    home_type?: string | null
    id?: string
    interest_type?: string | null
    invited_at?: string | null
    name?: string | null
    phone?: string | null
    referral_code?: string | null
    referral_source?: string | null
    status?: string | null
  }
  Update: {
    biggest_challenge?: string | null
    converted_at?: string | null
    created_at?: string | null
    email?: string
    email_clicks?: number | null
    email_opens?: number | null
    home_type?: string | null
    id?: string
    interest_type?: string | null
    invited_at?: string | null
    name?: string | null
    phone?: string | null
    referral_code?: string | null
    referral_source?: string | null
    status?: string | null
  }
  Relationships: []
}
