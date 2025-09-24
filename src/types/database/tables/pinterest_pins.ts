import type { Json } from '../json'

export type PinterestPinsTable = {
  Row: {
    board_id: string | null
    description: string | null
    detected_colors: Json | null
    detected_style: string[] | null
    id: string
    image_id: string | null
    image_url: string | null
    imported_at: string | null
    is_processed: boolean | null
    pinterest_pin_id: string
    title: string | null
    url: string | null
    user_id: string
  }
  Insert: {
    board_id?: string | null
    description?: string | null
    detected_colors?: Json | null
    detected_style?: string[] | null
    id?: string
    image_id?: string | null
    image_url?: string | null
    imported_at?: string | null
    is_processed?: boolean | null
    pinterest_pin_id: string
    title?: string | null
    url?: string | null
    user_id: string
  }
  Update: {
    board_id?: string | null
    description?: string | null
    detected_colors?: Json | null
    detected_style?: string[] | null
    id?: string
    image_id?: string | null
    image_url?: string | null
    imported_at?: string | null
    is_processed?: boolean | null
    pinterest_pin_id?: string
    title?: string | null
    url?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "pinterest_pins_board_id_fkey"
      columns: ["board_id"]
      isOneToOne: false
      referencedRelation: "pinterest_boards"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "pinterest_pins_image_id_fkey"
      columns: ["image_id"]
      isOneToOne: false
      referencedRelation: "images"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "pinterest_pins_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
