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

// Room types configuration with macrocategory support
export const ROOM_TYPES: Record<string, RoomType & { macrocategory: string; compatibleStyleMacrocategories: string[] }> = {
  // Interior spaces
  living_room: {
    id: 'living_room',
    name: 'Living Room',
    furniture: ['sofa', 'coffee table', 'rug', 'TV stand'],
    atmosphere: 'cozy social space',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },
  bedroom: {
    id: 'bedroom',
    name: 'Bedroom',
    furniture: ['bed', 'nightstands', 'dresser', 'lamps'],
    atmosphere: 'restful sanctuary',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    furniture: ['cabinets', 'island', 'stools', 'appliances'],
    atmosphere: 'functional cooking space',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },
  dining_room: {
    id: 'dining_room',
    name: 'Dining Room',
    furniture: ['dining table', 'chairs', 'chandelier', 'buffet'],
    atmosphere: 'elegant gathering space',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },
  bathroom: {
    id: 'bathroom',
    name: 'Bathroom',
    furniture: ['vanity', 'towels', 'accessories', 'mirror'],
    atmosphere: 'clean spa-like retreat',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },
  home_office: {
    id: 'home_office',
    name: 'Home Office',
    furniture: ['desk', 'chair', 'shelving', 'lighting'],
    atmosphere: 'productive workspace',
    macrocategory: 'interior',
    compatibleStyleMacrocategories: ['Modern', 'Classic', 'Regional', 'Lifestyle', 'Nature']
  },

  // Infantil spaces
  pieza_nino: {
    id: 'pieza_nino',
    name: 'Pieza Niño',
    furniture: ['cama infantil', 'escritorio', 'juguetes', 'estanterías'],
    atmosphere: 'espacio divertido y educativo',
    macrocategory: 'infantil',
    compatibleStyleMacrocategories: ['Infantil', 'Lifestyle']
  },
  pieza_nina: {
    id: 'pieza_nina',
    name: 'Pieza Niña',
    furniture: ['cama princesa', 'tocador', 'juguetes', 'espejo'],
    atmosphere: 'espacio mágico y creativo',
    macrocategory: 'infantil',
    compatibleStyleMacrocategories: ['Infantil', 'Lifestyle']
  },
  pieza_bebe: {
    id: 'pieza_bebe',
    name: 'Pieza Bebé',
    furniture: ['cuna', 'cambiador', 'mecedora', 'móvil'],
    atmosphere: 'espacio seguro y tranquilo',
    macrocategory: 'infantil',
    compatibleStyleMacrocategories: ['Infantil', 'Lifestyle']
  },

  // Exterior spaces
  fachada: {
    id: 'fachada',
    name: 'Fachada',
    furniture: ['elementos arquitectónicos', 'materiales', 'ventanas', 'puertas'],
    atmosphere: 'presencia exterior impactante',
    macrocategory: 'exterior',
    compatibleStyleMacrocategories: ['Regional', 'Modern', 'Classic', 'Luxury']
  },
  jardin: {
    id: 'jardin',
    name: 'Jardín / Paisajismo',
    furniture: ['plantas', 'mobiliario exterior', 'senderos', 'elementos agua'],
    atmosphere: 'conexión con la naturaleza',
    macrocategory: 'exterior',
    compatibleStyleMacrocategories: ['Nature', 'Regional', 'Modern', 'Lifestyle', 'Classic']
  }
}

// Staging styles - each prompt MUST be under 500 characters
// IMPORTANT: All prompts include preservation of architectural features
export const STAGING_STYLES: Record<string, StagingStyle> = {
  contemporary: {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Modern clean lines with current trends',
    prompt: 'Contemporary style DECORATION ONLY. Clean lines, neutral colors, modern furniture. MAINTAIN ALL existing walls, windows, doors, ceiling, floor structure. PRESERVE window views/backgrounds. Only add furniture and decor. Professional staging, photorealistic.',
    keywords: ['modern', 'clean', 'neutral', 'minimal']
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic timeless elegance',
    prompt: 'Traditional DECORATION ONLY. Classic furniture, rich wood. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
    keywords: ['classic', 'elegant', 'formal', 'timeless']
  },
  eclectic: {
    id: 'eclectic',
    name: 'Eclectic',
    description: 'Creative mix of styles and periods',
    prompt: 'Eclectic DECORATION ONLY. Mixed styles, bold colors. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
    keywords: ['mixed', 'creative', 'bold', 'unique']
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek minimalist contemporary design',
    prompt: 'Modern DECORATION ONLY. Sleek furniture, monochrome palette. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
    keywords: ['minimalist', 'sleek', 'geometric', 'functional']
  },
  moderno_clasico: {
    id: 'moderno_clasico',
    name: 'Moderno Clásico',
    description: 'Modern interior with clean lines and classic elegance',
    prompt: 'Modern classic DECORATION ONLY. Clean lines, neutral palette, quality materials. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
    keywords: ['modern', 'classic', 'elegant', 'clean', 'quality']
  },
  scandinavian: {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Nordic comfort and simplicity',
    prompt: 'Scandinavian DECORATION ONLY. Light wood, cozy textiles. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
    keywords: ['nordic', 'cozy', 'light', 'hygge']
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Urban loft with raw materials',
    prompt: 'Industrial DECORATION ONLY. Metal furniture, urban decor. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and accessories. Professional staging.',
    keywords: ['urban', 'raw', 'metal', 'brick']
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Refined traditional elegance',
    prompt: 'Classic DECORATION ONLY. Traditional furniture, quality materials. MAINTAIN ALL existing walls, windows, doors, ceiling, floor. Only add furniture and decor. Professional staging.',
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
  },
  personalizado: {
    id: 'personalizado',
    name: 'Personalizado',
    description: 'Describe tu visión única - agrega más detalles para resultados más personalizados',
    prompt: 'Custom interior design as specified by user. PRESERVE existing windows, doors, architecture. PRESERVE window views/backgrounds. Professional staging with user-defined style elements.',
    keywords: ['custom', 'personalized', 'unique', 'user-defined']
  },

  // Garden/Jardín Styles
  jardin_zen: {
    id: 'jardin_zen',
    name: 'Jardín Zen Japonés',
    description: 'Un espacio de calma y meditación que utiliza rocas, arena y musgo para crear un paisaje minimalista.',
    prompt: 'Serene Japanese Zen garden. Raked gravel, moss-covered boulders, stone lantern, sculptural plants. PRESERVE existing architecture. Tranquil, balanced, meditative.',
    keywords: ['zen', 'japonés', 'minimalista', 'serenidad', 'meditación', 'rocas']
  },
  jardin_mediterraneo: {
    id: 'jardin_mediterraneo',
    name: 'Jardín Mediterráneo Rústico',
    description: 'Inspirado en las costas de Italia y Grecia, con plantas resistentes al sol, terracota y zonas para relajarse.',
    prompt: 'Sun-drenched Mediterranean garden. Terracotta pots, bougainvillea, olive trees, lavender. Pergola with vines. PRESERVE existing architecture. Warm, timeless.',
    keywords: ['mediterráneo', 'rústico', 'terracota', 'lavanda', 'olivo', 'soleado']
  },
  jardin_moderno: {
    id: 'jardin_moderno',
    name: 'Jardín Moderno y Escultórico',
    description: 'Un diseño de líneas limpias que trata a las plantas y materiales como formas geométricas y artísticas.',
    prompt: 'Modern sculptural garden. Geometric concrete planters, ornamental grasses, succulents. Clean lines, water feature. PRESERVE existing architecture. Minimalist.',
    keywords: ['moderno', 'minimalista', 'geométrico', 'concreto', 'escultórico', 'suculentas']
  },
  jardin_campo_ingles: {
    id: 'jardin_campo_ingles',
    name: 'Jardín de Campo Inglés',
    description: 'Un estilo romántico y exuberante, lleno de flores, senderos sinuosos y un encanto natural y controlado.',
    prompt: 'English cottage garden. Roses, delphiniums, foxgloves, lavender. Cobblestone paths, wooden bench. PRESERVE existing architecture. Romantic, abundant.',
    keywords: ['inglés', 'cottage', 'romántico', 'flores', 'exuberante', 'rústico']
  },
  jardin_tropical: {
    id: 'jardin_tropical',
    name: 'Jardín Tropical Exuberante',
    description: 'Un oasis denso y verde con plantas de hojas grandes, flores exóticas y una sensación de selva vibrante.',
    prompt: 'Lush tropical garden. Large-leaf plants, monstera, palms, hibiscus. Waterfall feature, naturalistic pond. PRESERVE existing architecture. Dense, vibrant.',
    keywords: ['tropical', 'selva', 'exuberante', 'palmeras', 'húmedo', 'vibrante']
  },
  jardin_seco: {
    id: 'jardin_seco',
    name: 'Xerojardín de Clima Seco',
    description: 'Un diseño sostenible y de bajo consumo de agua, ideal para el clima de Chile central, usando cactus y suculentas.',
    prompt: 'Water-wise xeriscape garden. Succulents, cacti, agaves, decorative gravel. Ornamental boulders. PRESERVE existing architecture. Sustainable, beautiful.',
    keywords: ['xerojardín', 'seco', 'sostenible', 'cactus', 'suculentas', 'grava']
  },
  huerto_urbano: {
    id: 'huerto_urbano',
    name: 'Huerto Urbano Comestible',
    description: 'Un espacio funcional y estético que combina la belleza de un jardín con la producción de hortalizas, frutas y hierbas.',
    prompt: 'Urban edible garden. Raised beds, leafy greens, tomatoes, herbs in terracotta pots. Vertical garden wall. PRESERVE existing architecture. Functional, organic.',
    keywords: ['huerto', 'comestible', 'orgánico', 'urbano', 'sostenible', 'hierbas']
  },
  jardin_nativo_chileno: {
    id: 'jardin_nativo_chileno',
    name: 'Jardín Silvestre Nativo',
    description: 'Un jardín que celebra la flora local de Chile, creando un ecosistema naturalista que atrae a la fauna autóctona.',
    prompt: 'Native Chilean garden. Chilcos, notros, añañucas, native grasses. Winding mulch paths, natural stone. PRESERVE existing architecture. Wild, naturalistic.',
    keywords: ['nativo', 'chileno', 'silvestre', 'flora local', 'biodiversidad', 'naturalista']
  },

  // Facade Styles
  fachada_colonial_chilena: {
    id: 'fachada_colonial_chilena',
    name: 'Fachada Colonial de Hacienda',
    description: 'Estilo tradicional chileno con muros anchos de estuco, tejas de arcilla y corredores con pilares de madera.',
    prompt: 'Chilean colonial hacienda facade. Thick stucco walls, terracotta tiles, wooden corredor posts. Small dark-framed windows. Solid, rustic, elegant.',
    keywords: ['colonial', 'hacienda', 'chilena', 'estuco', 'tejas', 'corredor', 'tradicional']
  },
  fachada_moderna_concreto: {
    id: 'fachada_moderna_concreto',
    name: 'Fachada Moderna de Concreto y Madera',
    description: 'Arquitectura contemporánea que combina la crudeza del hormigón a la vista con la calidez de la madera nativa.',
    prompt: 'Modern facade. Exposed concrete, vertical wood slats, floor-to-ceiling glass. Geometric design, clean lines. Minimalist, strong architectural statement.',
    keywords: ['moderna', 'concreto', 'hormigón', 'madera', 'minimalista', 'arquitectura chilena']
  },
  fachada_valparaiso: {
    id: 'fachada_valparaiso',
    name: 'Fachada Porteña de Valparaíso',
    description: 'Un estilo vibrante y ecléctico, con revestimiento de planchas de zinc acanalado y una paleta de colores audaces.',
    prompt: 'Valparaíso hillside house facade. Colorful corrugated zinc panels, bold contrasting colors. Asymmetrical windows, playful character. Vibrant, bohemian.',
    keywords: ['valparaíso', 'porteño', 'colorido', 'calamina', 'vibrante', 'ecléctico', 'cerros']
  },
  fachada_industrial_loft: {
    id: 'fachada_industrial_loft',
    name: 'Fachada Industrial tipo Loft',
    description: 'Inspirada en antiguas fábricas, con ladrillo a la vista, grandes ventanales de metal y un aire urbano.',
    prompt: 'Industrial loft facade. Weathered brick walls, large black metal windows, exposed steel elements. Metal staircase. Raw, utilitarian, urban chic.',
    keywords: ['industrial', 'loft', 'ladrillo', 'urbano', 'metal', 'fábrica']
  },
  fachada_surena_tejuelas: {
    id: 'fachada_surena_tejuelas',
    name: 'Fachada Sureña con Tejuelas',
    description: 'Típica del sur de Chile, esta fachada está completamente revestida en tejuelas de alerce, evocando calidez y refugio.',
    prompt: 'Southern Chilean facade. Weathered wood shingles, steeply pitched roof, dormer windows, stone foundation. Cozy cabin feel, mountain refuge.',
    keywords: ['sureña', 'tejuelas', 'alerce', 'madera', 'refugio', 'patagonia', 'chiloé']
  },
  fachada_mediterranea_costera: {
    id: 'fachada_mediterranea_costera',
    name: 'Fachada Mediterránea Costera',
    description: 'Luminosa y fresca, con paredes encaladas, detalles en azul intenso y arcos que evocan las islas griegas.',
    prompt: 'Coastal Mediterranean facade. Whitewashed walls, vibrant blue doors and shutters, arched openings. Bougainvillea vines. Bright, airy, vacation feel.',
    keywords: ['mediterránea', 'costera', 'blanco', 'azul', 'encalado', 'islas griegas', 'verano']
  },
  fachada_tudor: {
    id: 'fachada_tudor',
    name: 'Fachada de Estilo Tudor',
    description: 'De inspiración inglesa, con entramado de madera oscura sobre estuco claro, techos inclinados y ladrillo.',
    prompt: 'Tudor style facade. Half-timbering, dark wood beams on light stucco, pitched gabled roof, brick chimney. Tall narrow windows. Stately, historic charm.',
    keywords: ['tudor', 'inglés', 'clásico', 'histórico', 'entramado', 'ladrillo']
  },
  fachada_brutalista: {
    id: 'fachada_brutalista',
    name: 'Fachada Brutalista',
    description: 'Una estética audaz y monumental que utiliza el hormigón crudo en formas geométricas masivas y angulares.',
    prompt: 'Brutalist facade. Raw board-formed concrete, massive geometric forms, small recessed windows. Heavy, fortress-like. Powerful, angular, unapologetically modern.',
    keywords: ['brutalista', 'concreto', 'hormigón crudo', 'geométrico', 'monumental', 'moderno']
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
  
  // Add architectural preservation if not already in prompt (more concise)
  if (!prompt.includes('MAINTAIN') && !prompt.includes('PRESERVE')) {
    prompt += ' Preserve architecture, windows unchanged. Decoration only.'
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
  
  const prompt = `Add furniture: ${productList}. Preserve architecture, windows unchanged. Professional staging.`
  
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