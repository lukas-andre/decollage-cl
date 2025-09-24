import type { Json } from '../json'

export type CollectionItemsTable = {
  Row: {
    added_at: string | null
    collection_id: string
    id: string
    item_id: string
    item_type: string
    metadata: Json | null
    notes: string | null
    position: number | null
    thumbnail_url: string | null
    title: string | null
  }
  Insert: {
    added_at?: string | null
    collection_id: string
    id?: string
    item_id: string
    item_type: string
    metadata?: Json | null
    notes?: string | null
    position?: number | null
    thumbnail_url?: string | null
    title?: string | null
  }
  Update: {
    added_at?: string | null
    collection_id?: string
    id?: string
    item_id?: string
    item_type?: string
    metadata?: Json | null
    notes?: string | null
    position?: number | null
    thumbnail_url?: string | null
    title?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "collection_items_collection_id_fkey"
      columns: ["collection_id"]
      isOneToOne: false
      referencedRelation: "user_collections"
      referencedColumns: ["id"]
    },
  ]
}
