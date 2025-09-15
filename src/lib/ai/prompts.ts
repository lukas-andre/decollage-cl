/**
 * Prompt System for Virtual Staging
 * English prompts optimized for 500 character limit (Runware requirement)
 */

export interface StagingStyle {
  id: string
  name: string
  description: string
  prompt: string // Max 500 chars
  keywords: string[]
}

export interface RoomType {
  id: string
  name: string
  furniture: string[]
  atmosphere: string
}

export interface AdvancedSettings {
  density: 'minimalist' | 'balanced' | 'full'
  temperature: 'warm' | 'cool' | 'neutral' | 'monochromatic'
  seed?: string
}

// Room types configuration
export const ROOM_TYPES: Record<string, RoomType> = {
  living_room: {
    id: 'living_room',
    name: 'Living Room',
    furniture: ['sofa', 'coffee table', 'rug', 'TV stand'],
    atmosphere: 'cozy social space'
  },
  bedroom: {
    id: 'bedroom',
    name: 'Bedroom',
    furniture: ['bed', 'nightstands', 'dresser', 'lamps'],
    atmosphere: 'restful sanctuary'
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    furniture: ['cabinets', 'island', 'stools', 'appliances'],
    atmosphere: 'functional cooking space'
  },
  dining_room: {
    id: 'dining_room',
    name: 'Dining Room',
    furniture: ['dining table', 'chairs', 'chandelier', 'buffet'],
    atmosphere: 'elegant gathering space'
  },
  bathroom: {
    id: 'bathroom',
    name: 'Bathroom',
    furniture: ['vanity', 'towels', 'accessories', 'mirror'],
    atmosphere: 'clean spa-like retreat'
  },
  home_office: {
    id: 'home_office',
    name: 'Home Office',
    furniture: ['desk', 'chair', 'shelving', 'lighting'],
    atmosphere: 'productive workspace'
  }
}

// Staging styles - each prompt MUST be under 500 characters
// IMPORTANT: All prompts include preservation of architectural features
export const STAGING_STYLES: Record<string, StagingStyle> = {
  contemporary: {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Modern clean lines with current trends',
    prompt: 'Contemporary style interior. Clean lines, neutral colors, modern furniture. PRESERVE existing windows, doors, architecture. Glass and metal accents. Professional staging, photorealistic.',
    keywords: ['modern', 'clean', 'neutral', 'minimal']
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic timeless elegance',
    prompt: 'Traditional elegant interior. Classic furniture, rich wood tones. PRESERVE existing windows, doors, architecture. Warm colors, refined textiles. Professional staging.',
    keywords: ['classic', 'elegant', 'formal', 'timeless']
  },
  eclectic: {
    id: 'eclectic',
    name: 'Eclectic',
    description: 'Creative mix of styles and periods',
    prompt: 'Eclectic mixed-style interior. Diverse furniture, bold colors. PRESERVE existing windows, doors, architecture. Unique art pieces. Professional staging.',
    keywords: ['mixed', 'creative', 'bold', 'unique']
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek minimalist contemporary design',
    prompt: 'Modern minimalist interior. Sleek furniture, monochrome palette. PRESERVE existing windows, doors, architecture. Open floor plan. Professional staging, photorealistic.',
    keywords: ['minimalist', 'sleek', 'geometric', 'functional']
  },
  scandinavian: {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Nordic comfort and simplicity',
    prompt: 'Scandinavian cozy interior. Light wood furniture, white walls. PRESERVE existing windows, doors, architecture. Natural light, hygge atmosphere. Professional staging.',
    keywords: ['nordic', 'cozy', 'light', 'hygge']
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Urban loft with raw materials',
    prompt: 'Industrial loft interior. Exposed brick, metal fixtures. PRESERVE existing windows, doors, architecture. Raw materials, urban style. Professional staging.',
    keywords: ['urban', 'raw', 'metal', 'brick']
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Refined traditional elegance',
    prompt: 'Classic refined interior. Traditional furniture, quality materials. PRESERVE existing windows, doors, architecture. Neutral colors. Professional staging.',
    keywords: ['refined', 'traditional', 'balanced', 'sophisticated']
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Essential elements only',
    prompt: 'Minimalist zen interior. Essential furniture only, empty space. PRESERVE existing windows, doors, architecture. Clean surfaces. Professional staging.',
    keywords: ['essential', 'empty', 'clean', 'pure']
  },
  rustic: {
    id: 'rustic',
    name: 'Rustic',
    description: 'Natural materials and countryside charm',
    prompt: 'Rustic countryside interior. Natural wood, stone accents. PRESERVE existing windows, doors, architecture. Earthy colors, cozy atmosphere. Professional staging.',
    keywords: ['natural', 'wood', 'countryside', 'cozy']
  },
  bohemian: {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Artistic free-spirited style',
    prompt: 'Bohemian artistic interior. Layered textiles, plants. PRESERVE existing windows, doors, architecture. Rich colors, global influences. Professional staging.',
    keywords: ['artistic', 'layered', 'colorful', 'global']
  },
  mediterranean: {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: 'Coastal European elegance',
    prompt: 'Mediterranean coastal interior. Terracotta, blue accents. PRESERVE existing windows, doors, architecture. Warm lighting. Professional staging.',
    keywords: ['coastal', 'terracotta', 'warm', 'european']
  }
}

/**
 * Generate staging prompt (max 500 chars)
 */
export function generateStagingPrompt(
  styleId: string,
  roomType?: string,
  advancedSettings?: AdvancedSettings
): string {
  const style = STAGING_STYLES[styleId]
  const room = roomType ? ROOM_TYPES[roomType] : null
  
  if (!style) {
    throw new Error(`Unknown style: ${styleId}`)
  }
  
  // Build prompt components
  const components: string[] = []
  
  // Room type if specified
  if (room) {
    components.push(`${room.name} staging.`)
  }
  
  // Base style prompt (already optimized)
  components.push(style.prompt)
  
  // Advanced settings modifiers (very concise)
  if (advancedSettings) {
    if (advancedSettings.density === 'minimalist') {
      components.push('Minimal furniture.')
    } else if (advancedSettings.density === 'full') {
      components.push('Fully furnished.')
    }
    
    if (advancedSettings.temperature === 'warm') {
      components.push('Warm tones.')
    } else if (advancedSettings.temperature === 'cool') {
      components.push('Cool tones.')
    } else if (advancedSettings.temperature === 'monochromatic') {
      components.push('Monochrome.')
    }
  }
  
  // Join and ensure under 500 chars
  let prompt = components.join(' ')
  
  // Add architectural preservation if not already in prompt
  if (!prompt.includes('PRESERVE')) {
    prompt += ' PRESERVE existing windows, doors, architecture.'
  }
  
  // Trim if over 500 chars
  if (prompt.length > 500) {
    prompt = `${style.prompt} Professional staging.`
  }
  
  return prompt.trim()
}

/**
 * Generate product placement prompt (max 500 chars)
 */
export function generateProductPlacementPrompt(
  products: Array<{ type: string; position: string }>
): string {
  const productList = products
    .slice(0, 3) // Max 3 products to fit in 500 chars
    .map(p => `${p.type} at ${p.position}`)
    .join(', ')
  
  const prompt = `Add furniture to room: ${productList}. PRESERVE existing windows, doors, architecture. Maintain room perspective, lighting. Professional result.`
  
  return prompt.length > 500 ? prompt.substring(0, 497) + '...' : prompt
}

/**
 * Get all available styles
 */
export function getAvailableStyles(): StagingStyle[] {
  return Object.values(STAGING_STYLES)
}

/**
 * Get all available room types
 */
export function getAvailableRoomTypes(): RoomType[] {
  return Object.values(ROOM_TYPES)
}