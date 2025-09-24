import type { Json } from '../json'

export type ShareTemplatesTable = {
  Row: {
    aspect_ratio: string | null
    code: string
    created_at: string | null
    description_template: string | null
    hashtags: string[] | null
    height: number | null
    id: string
    include_logo: boolean | null
    include_watermark: boolean | null
    is_active: boolean | null
    is_premium: boolean | null
    layout_config: Json | null
    layout_type: string | null
    max_images: number | null
    message_template: string | null
    name: string
    platform: string
    template_type: string | null
    theme: Json | null
    title_template: string | null
    usage_count: number | null
    width: number | null
  }
  Insert: {
    aspect_ratio?: string | null
    code: string
    created_at?: string | null
    description_template?: string | null
    hashtags?: string[] | null
    height?: number | null
    id?: string
    include_logo?: boolean | null
    include_watermark?: boolean | null
    is_active?: boolean | null
    is_premium?: boolean | null
    layout_config?: Json | null
    layout_type?: string | null
    max_images?: number | null
    message_template?: string | null
    name: string
    platform: string
    template_type?: string | null
    theme?: Json | null
    title_template?: string | null
    usage_count?: number | null
    width?: number | null
  }
  Update: {
    aspect_ratio?: string | null
    code?: string
    created_at?: string | null
    description_template?: string | null
    hashtags?: string[] | null
    height?: number | null
    id?: string
    include_logo?: boolean | null
    include_watermark?: boolean | null
    is_active?: boolean | null
    is_premium?: boolean | null
    layout_config?: Json | null
    layout_type?: string | null
    max_images?: number | null
    message_template?: string | null
    name?: string
    platform?: string
    template_type?: string | null
    theme?: Json | null
    title_template?: string | null
    usage_count?: number | null
    width?: number | null
  }
  Relationships: []
}
