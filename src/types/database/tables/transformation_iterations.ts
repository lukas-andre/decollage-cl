import type { Json } from '../json'

export type TransformationIterationsTable = {
  Row: {
    changes_applied: Json | null
    created_at: string | null
    id: string
    iteration_number: number
    parent_iteration_id: string | null
    refinement_prompt: string | null
    result_cloudflare_id: string | null
    result_image_url: string | null
    tokens_consumed: number | null
    transformation_id: string
  }
  Insert: {
    changes_applied?: Json | null
    created_at?: string | null
    id?: string
    iteration_number: number
    parent_iteration_id?: string | null
    refinement_prompt?: string | null
    result_cloudflare_id?: string | null
    result_image_url?: string | null
    tokens_consumed?: number | null
    transformation_id: string
  }
  Update: {
    changes_applied?: Json | null
    created_at?: string | null
    id?: string
    iteration_number?: number
    parent_iteration_id?: string | null
    refinement_prompt?: string | null
    result_cloudflare_id?: string | null
    result_image_url?: string | null
    tokens_consumed?: number | null
    transformation_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "transformation_iterations_parent_iteration_id_fkey"
      columns: ["parent_iteration_id"]
      isOneToOne: false
      referencedRelation: "transformation_iterations"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "transformation_iterations_transformation_id_fkey"
      columns: ["transformation_id"]
      isOneToOne: false
      referencedRelation: "transformations"
      referencedColumns: ["id"]
    },
  ]
}
