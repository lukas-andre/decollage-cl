import type { Json } from '../json'

export type TokenTransactionsTable = {
  Row: {
    amount: number
    balance_after: number
    balance_before: number
    created_at: string | null
    description: string | null
    id: string
    metadata: Json | null
    package_id: string | null
    transformation_id: string | null
    type: string
    user_id: string
  }
  Insert: {
    amount: number
    balance_after: number
    balance_before: number
    created_at?: string | null
    description?: string | null
    id?: string
    metadata?: Json | null
    package_id?: string | null
    transformation_id?: string | null
    type: string
    user_id: string
  }
  Update: {
    amount?: number
    balance_after?: number
    balance_before?: number
    created_at?: string | null
    description?: string | null
    id?: string
    metadata?: Json | null
    package_id?: string | null
    transformation_id?: string | null
    type?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "token_transactions_package_id_fkey"
      columns: ["package_id"]
      isOneToOne: false
      referencedRelation: "token_packages"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "token_transactions_transformation_id_fkey"
      columns: ["transformation_id"]
      isOneToOne: false
      referencedRelation: "transformations"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "token_transactions_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
