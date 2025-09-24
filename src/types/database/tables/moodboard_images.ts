export type MoodboardImagesTable = {
  Row: {
    created_at: string | null
    id: string
    image_id: string
    moodboard_id: string
    notes: string | null
    position: number | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    image_id: string
    moodboard_id: string
    notes?: string | null
    position?: number | null
  }
  Update: {
    created_at?: string | null
    id?: string
    image_id?: string
    moodboard_id?: string
    notes?: string | null
    position?: number | null
  }
  Relationships: [
    {
      foreignKeyName: "moodboard_images_image_id_fkey"
      columns: ["image_id"]
      isOneToOne: false
      referencedRelation: "images"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "moodboard_images_moodboard_id_fkey"
      columns: ["moodboard_id"]
      isOneToOne: false
      referencedRelation: "moodboards"
      referencedColumns: ["id"]
    },
  ]
}
