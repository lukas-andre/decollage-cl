import { Database } from './database.types'

// Shared types from database
export type ProjectShare = Database['public']['Tables']['project_shares']['Row']
export type ProjectShareInsert = Database['public']['Tables']['project_shares']['Insert']
export type ShareAnalytics = Database['public']['Tables']['share_analytics']['Row']
export type UserCollection = Database['public']['Tables']['user_collections']['Row']
export type CollectionItem = Database['public']['Tables']['collection_items']['Row']
export type ProjectFavorite = Database['public']['Tables']['project_favorites']['Row']
export type ContentReaction = Database['public']['Tables']['content_reactions']['Row']
export type ShareTemplate = Database['public']['Tables']['share_templates']['Row']

// Share Configuration Types
export interface ShareConfig {
  type: 'project' | 'transformation' | 'moodboard' | 'collection'
  visibility: 'public' | 'unlisted' | 'private'
  featured?: string[]
  customTitle?: string
  customDescription?: string
  expiresAt?: Date
  password?: string
  maxViews?: number
}

export interface ShareResponse {
  shareUrl: string
  shareToken: string
  shareSlug?: string | null
  ogImageUrl?: string
  embedCode?: string
}

// Favorites Widget Types
export interface FavoriteItem {
  id: string
  type: 'transformation' | 'moodboard' | 'image'
  title: string
  thumbnailUrl: string
  metadata?: Record<string, any>
  position: number
}

export interface FavoritesState {
  items: FavoriteItem[]
  isLoading: boolean
  error?: string
}

// Collection Types
export interface CollectionWithItems extends UserCollection {
  items: CollectionItem[]
}

export interface CreateCollectionData {
  name: string
  description?: string
  isPublic?: boolean
}

export interface AddToCollectionData {
  itemType: 'transformation' | 'moodboard' | 'gallery_item'
  itemId: string
  title?: string
  thumbnailUrl?: string
  notes?: string
}

// Analytics Types
export interface ShareAnalyticsData {
  shareType: string
  shareId: string
  platform?: string
  action: 'created' | 'viewed' | 'clicked' | 'converted'
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  deviceType?: string
  browser?: string
  os?: string
  countryCode?: string
}

export interface ShareStats {
  totalViews: number
  totalClicks: number
  totalShares: number
  conversionRate: number
  topPlatforms: Array<{
    platform: string
    count: number
    percentage: number
  }>
  recentActivity: ShareAnalytics[]
}

// Reaction Types
export interface ReactionData {
  contentType: 'project' | 'transformation' | 'moodboard' | 'gallery_item'
  contentId: string
  reactionType?: string
  sessionId?: string
}

export interface ReactionCounts {
  aplausos: number
  total: number
}

// OG Image Generation Types
export interface OGImageConfig {
  title: string
  description?: string
  images: string[]
  template: 'basic' | 'grid' | 'featured'
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    backgroundImage?: string
  }
}

// Share Template Types
export interface ShareTemplateConfig {
  aspectRatio: string
  width: number
  height: number
  layoutType: 'single' | 'grid' | 'slider' | 'collage'
  maxImages: number
  includeLogo: boolean
  includeWatermark: boolean
  titleTemplate: string
  descriptionTemplate: string
  hashtags: string[]
  theme: {
    colors: string[]
    fonts: string[]
    spacing: Record<string, number>
  }
}

// Share Builder Types
export interface ShareBuilderState {
  selectedItems: FavoriteItem[]
  shareConfig: Partial<ShareConfig>
  previewMode: 'mobile' | 'desktop'
  isGenerating: boolean
}

// Public Share Page Types
export interface PublicShareData {
  share: ProjectShare
  project: {
    id: string
    name: string
    description?: string
    coverImageUrl?: string
    userDisplayName?: string
    userAvatarUrl?: string
  }
  items: Array<{
    id: string
    type: 'transformation' | 'moodboard'
    title?: string
    imageUrl: string
    beforeImageUrl?: string
    description?: string
    metadata?: Record<string, any>
  }>
  reactions: ReactionCounts
  isAuthenticated: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface CreateShareRequest {
  projectId: string
  config: ShareConfig
}

export interface CreateShareResponse extends ApiResponse<ShareResponse> {}

export interface GetShareResponse extends ApiResponse<PublicShareData> {}

export interface UpdateReactionRequest {
  action: 'add' | 'remove'
  reactionData: ReactionData
}

export interface UpdateReactionResponse extends ApiResponse<{
  success: boolean
  newCount: number
}> {}

// Hook Return Types
export interface UseShareReturn {
  share: ShareResponse | null
  isLoading: boolean
  error: string | null
  createShare: (config: ShareConfig) => Promise<ShareResponse>
  updateShare: (token: string, config: Partial<ShareConfig>) => Promise<void>
  deleteShare: (token: string) => Promise<void>
}

export interface UseFavoritesReturn {
  favorites: FavoriteItem[]
  isLoading: boolean
  error: string | null
  addFavorite: (item: Omit<FavoriteItem, 'position'>) => Promise<void>
  removeFavorite: (itemId: string, itemType: string) => Promise<void>
  reorderFavorites: (items: FavoriteItem[]) => Promise<void>
  clearFavorites: () => Promise<void>
}

export interface UseReactionsReturn {
  counts: ReactionCounts
  userReaction: ContentReaction | null
  isLoading: boolean
  error: string | null
  addReaction: (reactionType?: string) => Promise<void>
  removeReaction: () => Promise<void>
}

export interface UseCollectionsReturn {
  collections: UserCollection[]
  isLoading: boolean
  error: string | null
  createCollection: (data: CreateCollectionData) => Promise<UserCollection>
  updateCollection: (id: string, data: Partial<CreateCollectionData>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  addToCollection: (collectionId: string, data: AddToCollectionData) => Promise<void>
  removeFromCollection: (collectionId: string, itemId: string) => Promise<void>
}

// Event Types for Real-time
export interface RealtimeReactionEvent {
  type: 'INSERT' | 'DELETE'
  table: 'content_reactions'
  record: ContentReaction
  old_record?: ContentReaction
}

export interface RealtimeShareEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'project_shares'
  record: ProjectShare
  old_record?: ProjectShare
}

// Chilean-specific Types
export interface ChileanSharingText {
  shareButton: 'Compartir'
  copyLink: 'Copiar enlace'
  shareOn: 'Compartir en'
  addToFavorites: 'Añadir a favoritos'
  saveToCollection: 'Guardar en colección'
  applaud: 'Aplaudir'
  viewProject: 'Ver proyecto completo'
  madeWith: 'Hecho con Decollage.cl'
  inspiration: 'Inspiración'
  transformation: 'Transformación'
  beforeAndAfter: 'Antes y después'
  chileanStyle: 'Estilo chileno'
  discover: 'Descubrir más'
}

export const CHILEAN_SHARING_TEXT: ChileanSharingText = {
  shareButton: 'Compartir',
  copyLink: 'Copiar enlace',
  shareOn: 'Compartir en',
  addToFavorites: 'Añadir a favoritos',
  saveToCollection: 'Guardar en colección',
  applaud: 'Aplaudir',
  viewProject: 'Ver proyecto completo',
  madeWith: 'Hecho con Decollage.cl',
  inspiration: 'Inspiración',
  transformation: 'Transformación',
  beforeAndAfter: 'Antes y después',
  chileanStyle: 'Estilo chileno',
  discover: 'Descubrir más'
}