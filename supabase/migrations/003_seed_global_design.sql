-- =============================================
-- GLOBAL DESIGN SYSTEM SEEDER
-- =============================================
-- Comprehensive collection of 42 international design styles
-- From historical foundations to emerging trends
-- Version: 1.0.0
-- Created: 2025-01-15
-- =============================================

-- =============================================
-- SECTION 1: HISTORICAL & FOUNDATIONAL STYLES
-- =============================================

INSERT INTO design_styles (
    code, name, name_en, category, description, 
    base_prompt, negative_prompt, inspiration_keywords, 
    is_featured, sort_order
) VALUES

-- GOTHIC (c. XII-XVI centuries)
('gotico', 'Gótico', 'Gothic', 'historico',
'Evoca la grandeza, el misterio y la verticalidad de las catedrales medievales en un entorno doméstico.',
'Gothic interior with pointed arches, ribbed vaulting, ornate carved details. Dark rich colors: deep purples, intense reds, forest green. Heavy dark woods, wrought iron, stone, luxurious velvet and brocade textiles. Medieval cathedral atmosphere, dramatic and mysterious.',
'bright, modern, minimalist, light colors, plastic',
'{"gotico", "medieval", "arcos", "piedra", "hierro forjado", "terciopelo", "dramatico"}',
false, 101),

-- NEOCLASSICAL (c. 1750-1830)
('neoclasico', 'Neoclásico', 'Neoclassical', 'historico',
'Un retorno a la pureza, el orden y el racionalismo de la antigua Grecia y Roma.',
'Neoclassical interior with symmetry, columns, pilasters, pediments. Soft pale palette: whites, creams, soft blues and greens. Marble, fine woods, silk and brocade. Elegant and formal with classical motifs like urns and friezes.',
'asymmetrical, cluttered, ornate, dark colors',
'{"neoclasico", "columnas", "simetria", "marmol", "elegante", "clasico"}',
false, 102),

-- VICTORIAN (c. 1837-1901)
('victoriano', 'Victoriano', 'Victorian', 'historico',
'Un estilo de "más es más" que refleja la prosperidad de la era industrial.',
'Victorian interior with elaborate ornate details, intricate moldings, rich dark colors: burgundy, forest green, navy. Dark carved woods, velvet, silk, damask. Pattern wallpaper, Tiffany lamps, heavy curtains, collections displayed.',
'minimalist, modern, sparse, light colors',
'{"victoriano", "ornamentado", "terciopelo", "damasco", "lampara tiffany", "recargado"}',
false, 103),

-- QUEEN ANNE (c. XVIII century)
('reina_ana', 'Reina Ana', 'Queen Anne', 'historico',
'Formas más ligeras y gráciles con énfasis en líneas curvas elegantes.',
'Queen Anne interior with cabriole legs, graceful curves, asymmetrical facades. Pale walls: cream, dusky rose, sage green. Walnut wood, velvet and silk upholstery, oriental rugs. Elegant wing-back chairs, minimal shell motifs.',
'heavy, dark, straight lines, modern',
'{"reina ana", "cabriole", "curvas", "nogal", "elegante", "asimetrico"}',
false, 104),

-- ARTS & CRAFTS (c. 1880-1920)
('arts_crafts', 'Arts & Crafts', 'Arts & Crafts', 'historico',
'Reacción contra la producción en masa, defendiendo la artesanía y materiales naturales.',
'Arts & Crafts interior with exposed beams, visible joinery, simple rectangular forms. Earth tones: reds, ochres, deep greens. Robust oak wood, natural stone, brick, handcrafted ceramics. Morris patterns, handmade tiles.',
'machine-made, ornate, delicate, artificial materials',
'{"arts crafts", "artesanal", "roble", "vigas vista", "william morris", "natural"}',
false, 105),

-- ART NOUVEAU (c. 1890-1910)
('art_nouveau', 'Art Nouveau', 'Art Nouveau', 'historico',
'Líneas sinuosas y asimétricas inspiradas en formas orgánicas de la naturaleza.',
'Art Nouveau interior with flowing asymmetrical lines, whiplash curves, nature motifs. Natural palette: soft grays, vanilla, toffee with green and purple accents. Carved wood, stained glass, wrought iron. Tiffany lamps, organic furniture forms.',
'geometric, straight lines, artificial, industrial',
'{"art nouveau", "sinuoso", "organico", "vidrieras", "tiffany", "naturaleza"}',
false, 106),

-- ART DECO (c. 1920-1930)
('art_deco', 'Art Déco', 'Art Deco', 'historico',
'Glamour y modernidad celebrando la era de la máquina con geometría audaz.',
'Art Deco interior with geometric forms, zigzags, chevrons, sunburst patterns. Bold vibrant colors: deep yellows, reds, blues with chrome and gold. Polished chrome, stainless steel, lacquer, exotic woods. Streamlined furniture, dramatic lighting.',
'organic, flowing, rustic, matte finishes',
'{"art deco", "geometrico", "zigzag", "cromo", "lacado", "streamline"}',
false, 107),

-- =============================================
-- SECTION 2: MODERNIST MOVEMENT
-- =============================================

-- MODERN (Early-Mid 20th Century)
('moderno_clasico', 'Moderno Clásico', 'Modern Classic', 'moderno',
'Adopta el mantra "menos es más" con simplicidad, funcionalidad y líneas limpias.',
'Modern interior with clean straight lines, geometric perfection, open concept. Primarily neutral, monochromatic palette. Natural materials: wood, leather, stone with industrial chrome and glass. Minimal decoration, furniture with exposed legs.',
'ornate, cluttered, traditional, small windows',
'{"moderno", "minimalista", "lineas limpias", "funcional", "geometrico"}',
true, 108),

-- MID-CENTURY MODERN (c. 1945-1970)
('mid_century_modern', 'Mid-Century Modern', 'Mid-Century Modern', 'moderno',
'Simplicidad y conexión armoniosa con la naturaleza, optimismo de la posguerra.',
'Mid-century modern interior with clean lines, organic curves, tapered legs, open floor plans. Earth tones with vibrant accent colors: mustard yellow, teal, orange. Teak wood, molded plastic, fiberglass, metal. Eames chairs, Sputnik chandeliers.',
'ornate, traditional, heavy, dark colors',
'{"mid century", "teca", "eames", "sputnik", "organico", "conico"}',
true, 109),

-- BRUTALISM (c. 1950-1970)
('brutalismo', 'Brutalismo', 'Brutalism', 'moderno',
'Filosofía de construcción honesta mostrando materiales en bruto sin decoración.',
'Brutalist interior with raw concrete (béton brut), exposed brick, angular geometric forms. Monochromatic palette dominated by raw material textures. Concrete, brick, steel, wood, glass. Industrial furniture, exposed services, massive forms.',
'decorative, polished, delicate, colorful',
'{"brutalismo", "concreto crudo", "angular", "expuesto", "masivo", "industrial"}',
false, 110),

-- INDUSTRIAL
('industrial_global', 'Industrial', 'Industrial', 'moderno',
'Celebra la estética cruda de antiguas fábricas y espacios industriales.',
'Industrial interior with exposed brick walls, wooden beams, steel columns, visible pipes and ducts. Neutral palette: whites, grays, browns, blacks. Weathered wood, exposed brick, concrete, metals. Factory lighting, metal bar stools, reclaimed furniture.',
'polished, decorative, soft, hidden elements',
'{"industrial", "ladrillo visto", "metal", "expuesto", "recuperado", "fabrica"}',
true, 111),

-- TRANSITIONAL
('transicional_global', 'Transicional', 'Transitional', 'moderno',
'Equilibrio entre elegancia clásica del diseño tradicional y líneas limpias contemporáneas.',
'Transitional interior balancing traditional elegance with contemporary clean lines. Neutral relaxing palette: beiges, sands, vanillas, grays. Texture focus: suede, leather, chenille, linen. Comfortable upholstered sofas with elegant wooden frame chairs.',
'extreme traditional, ultra modern, bold colors',
'{"transicional", "equilibrio", "neutro", "textura", "comodo", "elegante"}',
false, 112),

-- =============================================
-- SECTION 3: CONTEMPORARY CANON
-- =============================================

-- CONTEMPORARY
('contemporaneo_global', 'Contemporáneo', 'Contemporary', 'contemporaneo',
'Refleja el diseño del "aquí y ahora" con líneas limpias y curvas.',
'Contemporary interior reflecting current design trends, clean lines with curves, spacious feel. Neutral palette allowing bold art to be the focus. Mixed materials contrasting natural with high-tech details. Sculptural furniture, smart home integration.',
'dated, ornate, cluttered, small spaces',
'{"contemporaneo", "actual", "curvo", "espacioso", "escultorico", "high tech"}',
true, 113),

-- MINIMALISM
('minimalismo_global', 'Minimalismo', 'Minimalism', 'contemporaneo',
'Concentrado en el principio de "menos es más" con espacios puros y armoniosos.',
'Minimalist interior with clean lines, clutter-free aesthetic, functional purpose for every element. Monochromatic or neutral palette: whites, grays, beiges. Simple durable materials: concrete, glass, wood, stone. Essential furniture, hidden storage.',
'cluttered, ornate, many colors, decorative',
'{"minimalismo", "despejado", "funcional", "esencial", "monocromatico"}',
true, 114),

-- SCANDINAVIAN
('escandinavo_global', 'Escandinavo', 'Scandinavian', 'contemporaneo',
'Simplicidad y funcionalidad conectada con la naturaleza y el concepto de hygge.',
'Scandinavian interior with bright airy spaces, clean lines, light wood tones. Often all-white walls with soft pastels and bold playful accents. Light woods, wool, cotton, linen, leather. Clean-lined furniture, high-pile rugs, cozy textiles.',
'dark, heavy, ornate, cluttered',
'{"escandinavo", "hygge", "luminoso", "madera clara", "acogedor", "funcional"}',
true, 115),

-- MODERN FARMHOUSE
('modern_farmhouse_global', 'Modern Farmhouse', 'Modern Farmhouse', 'contemporaneo',
'Giro contemporáneo al estilo rústico combinando encanto rural con elegancia moderna.',
'Modern farmhouse interior with rustic elements like exposed beams and barn doors combined with clean modern lines. Neutral palette: soft whites, grays, earth tones with black accents. Reclaimed wood, metal, stone, shiplap. Barn doors, farmhouse sink.',
'ornate, formal, dark, urban',
'{"modern farmhouse", "shiplap", "rustico", "granero", "recuperado", "neutral"}',
true, 116),

-- =============================================
-- SECTION 4: GLOBAL & CULTURAL STYLES
-- =============================================

-- MEDITERRANEAN
('mediterraneo_global', 'Mediterráneo', 'Mediterranean', 'global',
'Comodidad y sofisticación de un estilo de vida relajado bañado por el sol.',
'Mediterranean interior with whitewashed plaster walls, dark wood beams, arched doorways, intricate tilework. White and neutral base with earthy accents: terracotta, clay, ocean blues and greens. Natural materials, wrought iron, hand-painted tiles.',
'dark, cold, modern, artificial',
'{"mediterraneo", "encalado", "vigas", "azulejos", "hierro forjado", "terroso"}',
true, 117),

-- FRENCH COUNTRY
('campestre_frances', 'Campestre Francés', 'French Country', 'global',
'Elegancia rústica que equilibra refinamiento francés con encanto campestre.',
'French country interior mixing rustic elements with elegant details. Muted palette: warm neutrals with saturated but soft yellows, blues, pinks, greens. Weathered wood, natural stone, terracotta, French fabrics. Toile patterns, antique furniture.',
'modern, minimalist, stark, industrial',
'{"frances", "rustico", "elegante", "toile", "envejecido", "patina"}',
false, 118),

-- TUSCAN
('toscano_global', 'Toscano', 'Tuscan', 'global',
'Calidez y autenticidad de la campiña italiana con materiales naturales ricos.',
'Tuscan interior with warm earthy palette: terracotta, deep olive greens, burnt sienna, muted golds. Textured plaster walls, rustic beam ceilings, stone patios. Heavy natural materials: stone, aged wood, wrought iron, terracotta tiles.',
'cold, modern, artificial, light colors',
'{"toscano", "terroso", "yeso", "hierro forjado", "terracota", "rustico"}',
false, 119),

-- SOUTHWESTERN
('suroeste_global', 'Suroeste', 'Southwestern', 'global',
'Belleza natural y herencia cultural del suroeste americano.',
'Southwestern interior with warm earthy desert palette: salmon, terracotta, brick red, turquoise, pumpkin yellow. Adobe or stucco walls, carved wood, wrought iron, leather upholstery. Navajo patterns, hand-painted tiles, rustic pottery, cacti.',
'cool colors, delicate, urban, refined',
'{"suroeste", "desierto", "adobe", "turquesa", "navajo", "cactus"}',
false, 120),

-- MOROCCAN
('marroqui_global', 'Marroquí', 'Moroccan', 'global',
'Mezcla opulenta de influencias árabes, bereberes y mediterráneas.',
'Moroccan interior with intricate geometric patterns, horseshoe arches, carved wood. Bold vibrant colors: deep blues, intense reds, sunny yellows balanced with neutrals. Zellige tiles, Tadelakt plaster, brass and copper, hand-woven rugs. Ornate metal lanterns.',
'simple, monochromatic, modern, minimal patterns',
'{"marroqui", "geometrico", "zellige", "faroles", "alfombras", "intrincado"}',
false, 121),

-- COASTAL
('costero_global', 'Costero', 'Coastal', 'global',
'Atmósfera ligera, aireada y relajada inspirada en la playa.',
'Coastal interior with light airy relaxed atmosphere. Blues and greens with crisp white and sandy neutrals. Natural organic materials: rope, rattan, sisal, jute, driftwood. Light fabrics, slipcover furniture, nautical motifs, seashells.',
'dark, heavy, formal, urban',
'{"costero", "aireado", "azul", "ratan", "nautico", "conchas"}',
true, 122),

-- TROPICAL
('tropical_global', 'Tropical', 'Tropical', 'global',
'Oasis tipo resort con exuberancia y vitalidad de climas tropicales.',
'Tropical interior with lush greenery, large-leaf plants, energetic patterns. Vibrant jungle greens, ocean blues, sunny yellows and golds, bright floral colors. Natural sustainable materials: rattan, wicker, bamboo, teak, jute. Palm leaf patterns.',
'cold, dark, artificial, geometric',
'{"tropical", "exuberante", "palmas", "bambu", "vibrante", "resort"}',
false, 123),

-- BRITISH COLONIAL
('colonial_britanico', 'Colonial Británico', 'British Colonial', 'global',
'Elegancia refinada que mezcla muebles británicos con materiales tropicales.',
'British Colonial interior mixing sophisticated dark wood furniture with lighter airy elements. Light base of whites and creams contrasted with dark wood tones. Dark woods like mahogany and teak with rattan, cane, bamboo, linen. Campaign furniture, botanical prints.',
'modern, minimalist, monochromatic',
'{"colonial", "caoba", "ratan", "botanico", "viajero", "sofisticado"}',
false, 124),

-- =============================================
-- SECTION 5: LIFESTYLE & AESTHETIC STYLES
-- =============================================

-- BOHEMIAN (BOHO)
('bohemio_global', 'Bohemio', 'Bohemian', 'lifestyle',
'Espíritu libre, creativo y poco convencional que celebra la individualidad.',
'Bohemian interior with eclectic layered approach, mixing colors, patterns, textures. Warm earth tones and jewel tones over neutral base. Natural materials: burlap, sisal, rattan, wood with luxurious silk, chenille, velvet. Global textiles, vintage finds, plants.',
'minimalist, matching, corporate, sterile',
'{"bohemio", "eclectico", "capas", "global", "vintage", "plantas", "viajero"}',
true, 125),

-- SHABBY CHIC
('shabby_chic_global', 'Shabby Chic', 'Shabby Chic', 'lifestyle',
'Elegancia desgastada combinando elementos vintage con comodidad campestre.',
'Shabby chic interior with weathered painted furniture, soft feminine pretty feel. Soft palette: creamy whites, soft pastels like mint, pink, peach, pale blue. Soft comfortable fabrics: linen, cotton with ruffles. Vintage furniture, floral patterns, crystal chandeliers.',
'modern, stark, masculine, geometric',
'{"shabby chic", "envejecido", "pastel", "floral", "vintage", "romantico"}',
false, 126),

-- ECLECTIC
('eclectico_global', 'Ecléctico', 'Eclectic', 'lifestyle',
'Mezcla curada y deliberada de elementos de diferentes estilos y culturas.',
'Eclectic interior with intentional mix of different periods, styles, cultures. Often anchored by neutral base color with playful vibrant accents. Deliberate mix of smooth leather against woven rugs, marble against soft blankets. Gallery walls, vintage under modern.',
'uniform, matching, single style, unplanned',
'{"eclectico", "curado", "mezcla", "galeria", "vintage", "inesperado"}',
false, 127),

-- MAXIMALISM
('maximalismo_global', 'Maximalismo', 'Maximalism', 'lifestyle',
'Rebelión contra el minimalismo abrazando "más es más" con abundancia curada.',
'Maximalist interior with vibrant rich bold layers of patterns, colors, textures. Bold jewel tones: emerald green, royal blue, ruby red. Luxurious contrasting textures: velvet, fur, silk, wool. Statement lighting, eclectic art displays, bold striped rugs.',
'minimal, sparse, monochromatic, simple',
'{"maximalismo", "capas", "audaz", "joya", "patron", "abundante"}',
false, 128),

-- GLAM (HOLLYWOOD REGENCY)
('glam_global', 'Glam', 'Glam', 'lifestyle',
'Opulencia, drama y lujo inspirados en la Edad de Oro de Hollywood.',
'Hollywood Regency interior with high contrast, bold patterns, luxury comfort. Deep saturated jewel tones and vibrant colors over high-contrast black and white base. Gold essential accent. Luxurious tactile materials: velvet, silk, suede, mirrored surfaces.',
'minimal, matte, simple, understated',
'{"glam", "hollywood", "dorado", "espejado", "terciopelo", "audaz"}',
false, 129),

-- COTTAGECORE
('cottagecore_global', 'Cottagecore', 'Cottagecore', 'lifestyle',
'Estética nostálgica que idealiza una vida rural simple conectada con la naturaleza.',
'Cottagecore interior with nostalgic well-loved home feel, vintage finds, handmade treasures, abundance of greenery. Soft earthy palette: warm neutrals, buttery yellows, delicate pastels. Natural organic materials: well-worn wood, linen, cotton, jute.',
'modern, urban, synthetic, sterile',
'{"cottagecore", "nostalgia", "rural", "flores", "hecho a mano", "acogedor"}',
false, 130),

-- DARK ACADEMIA
('dark_academia_global', 'Dark Academia', 'Dark Academia', 'lifestyle',
'Estética melancólica centrada en literatura clásica y búsqueda del conocimiento.',
'Dark academia interior with moody melancholic low-light atmosphere evoking old libraries. Dark melancholic palette: dark browns, forest greens, majestic burgundy with gold accents. Dark woods, classic rugs, heavy textiles. Bookshelves, globes, typewriters.',
'bright, modern, colorful, minimal',
'{"dark academia", "biblioteca", "melancolico", "libros", "antiguo", "intelectual"}',
false, 131),

-- =============================================
-- SECTION 6: HYBRID & EMERGING TRENDS
-- =============================================

-- JAPANDI
('japandi_global', 'Japandi', 'Japandi', 'hibrido',
'Fusión del minimalismo escandinavo con la filosofía japonesa del wabi-sabi.',
'Japandi interior combining Scandinavian functional minimalism with Japanese wabi-sabi warmth. Muted neutral palette with light Scandinavian woods contrasted with darker Japanese wood. Natural sustainable materials: wood, bamboo, rattan, linen, cotton, stone.',
'busy, artificial, bright colors, ornate',
'{"japandi", "wabi sabi", "minimalista", "natural", "artesanal", "calido"}',
true, 132),

-- ORGANIC MODERN
('organico_moderno', 'Orgánico Moderno', 'Organic Modern', 'hibrido',
'Mezcla de minimalismo moderno con la belleza y calidez de la naturaleza.',
'Organic modern interior with minimalist base warmed by organic shapes, soft curves, rich textures. Neutral warm muted palette: soft whites, warm grays, muted earth tones. Rich interplay of natural materials: wood, stone, jute, bamboo, clay, concrete, linen.',
'angular, artificial, bright, busy',
'{"organico", "moderno", "curvas", "natural", "textura", "tierra"}',
true, 133),

-- BIOPHILIC DESIGN
('biofilico_global', 'Biofílico', 'Biophilic', 'hibrido',
'Conexión innata humana con la naturaleza para mejorar el bienestar.',
'Biophilic interior incorporating nature directly and indirectly for wellbeing. Natural color palette: greens, blues, earth neutrals. Natural authentic materials: wood, stone, rattan, linen. Living walls, water features, abundant natural light, natural ventilation.',
'artificial, enclosed, synthetic, dark',
'{"biofilico", "naturaleza", "plantas", "luz natural", "bienestar", "agua"}',
false, 134),

-- DOPAMINE DECOR
('dopamine_decor', 'Dopamine Decor', 'Dopamine Decor', 'hibrido',
'Espacios alegres que mejoran el estado de ánimo a través del color vibrante.',
'Dopamine decor interior with joyful mood-enhancing bright bold colors. Crayon box bright colors: hot pink, chrome yellow, lime green, cobalt blue, rich jewel tones. Contrasting textures: soft velvet, boucle, corduroy against leather and natural fibers.',
'neutral, muted, monochromatic, serious',
'{"dopamine", "alegre", "vibrante", "feliz", "audaz", "colorido"}',
false, 135),

-- DESERT MODERN
('desierto_moderno', 'Desierto Moderno', 'Desert Modern', 'hibrido',
'Modernismo adaptado al entorno desértico mezclando lo industrial con lo natural.',
'Desert modern interior with clean lines adapted to arid environment. Desert palette: warm neutrals, soft pinks, brick reds, soft greens, vibrant yellow and orange accents. Juxtaposition of industrial materials with natural local stone, woven desert culture textiles.',
'lush, tropical, dark, cold',
'{"desierto", "moderno", "arido", "cactus", "industrial", "tejidos"}',
false, 136),

-- RUSTIC MODERN
('rustico_moderno_global', 'Rústico Moderno', 'Rustic Modern', 'hibrido',
'Mezcla de texturas crudas naturales con formas limpias contemporáneas.',
'Rustic modern interior creating tranquil accessible cozy yet elevated feel. Raw tactile textures, earthy neutrals, warm tones. Raw tactile textures: travertine, pumiced stone, boucle, natural woods with soft matte finishes, sculptural furniture.',
'polished, artificial, busy, cold',
'{"rustico", "moderno", "textura", "crudo", "acogedor", "escultorico"}',
true, 137),

-- ALPINE CHIC
('alpino_chic', 'Alpino Chic', 'Alpine Chic', 'hibrido',
'Vida de montaña acogedora elevada inspirada en chalets de esquí suizos.',
'Alpine chic interior with sophisticated mountain living, layered look combining raw materials with luxurious high-pile textiles. Can be moody dark or light airy, always rooted in natural tones. Raw reclaimed materials: wood, stone, iron with cozy high-pile textiles.',
'tropical, urban, delicate, artificial',
'{"alpino", "chalet", "esqui", "madera", "piedra", "acogedor"}',
false, 138),

-- AMERICANA
('americana_global', 'Americana', 'Americana', 'hibrido',
'Mezcla del encanto Farmhouse y Country con elementos chic de mediados de siglo.',
'Americana interior mixing farmhouse and country charm with mid-century chic elements. Classic American palette incorporating reds, whites, blues in sophisticated way. Solid wood, patchwork, checkered patterns. Patchwork quilts, vintage solid wood furniture.',
'foreign, modern, synthetic, minimal',
'{"americana", "patchwork", "vintage", "madera", "patriotico", "funcional"}',
false, 139),

-- WABI-SABI
('wabi_sabi_global', 'Wabi-Sabi', 'Wabi-Sabi', 'hibrido',
'Filosofía japonesa de encontrar belleza en la imperfección y fugacidad.',
'Wabi-sabi interior with asymmetrical simple essential forms, imperfections celebrated. Muted neutral nature-inspired palette: earth tones, grays, greens, off-whites. Natural humble materials: wood, stone, ceramics, bamboo, raw matte fabrics. Handmade objects with stories.',
'perfect, artificial, bright, busy',
'{"wabi sabi", "imperfecto", "natural", "ceramica", "hecho a mano", "simple"}',
false, 140)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SECTION 7: GLOBAL COLOR PALETTES
-- =============================================

INSERT INTO color_palettes (
    code, name, name_en, mood, season, 
    primary_colors, accent_colors, neutral_colors,
    is_featured, sort_order
) VALUES

-- Classic Palettes
('blanco_negro_clasico', 'Blanco y Negro Clásico', 'Classic Black & White', 'elegante', 'todo-el-año',
'[{"name": "Blanco Puro", "hex": "#FFFFFF"}, {"name": "Negro Profundo", "hex": "#000000"}]'::jsonb,
'[{"name": "Gris Medio", "hex": "#808080"}]'::jsonb,
'[{"name": "Gris Claro", "hex": "#F5F5F5"}, {"name": "Gris Oscuro", "hex": "#333333"}]'::jsonb,
true, 201),

-- Earth Tones
('tonos_tierra_global', 'Tonos Tierra', 'Global Earth Tones', 'calido', 'otoño',
'[{"name": "Terracota", "hex": "#CD853F"}, {"name": "Siena Quemada", "hex": "#A0522D"}, {"name": "Verde Oliva", "hex": "#808000"}]'::jsonb,
'[{"name": "Óxido", "hex": "#B7410E"}, {"name": "Mostaza", "hex": "#FFDB58"}]'::jsonb,
'[{"name": "Arena", "hex": "#F4A460"}, {"name": "Piedra", "hex": "#696969"}]'::jsonb,
true, 202),

-- Ocean Blues
('azules_oceano', 'Azules del Océano', 'Ocean Blues', 'fresco', 'verano',
'[{"name": "Azul Marino", "hex": "#000080"}, {"name": "Azul Acero", "hex": "#4682B4"}, {"name": "Aguamarina", "hex": "#7FFFD4"}]'::jsonb,
'[{"name": "Turquesa", "hex": "#40E0D0"}, {"name": "Verde Mar", "hex": "#2E8B57"}]'::jsonb,
'[{"name": "Blanco Espuma", "hex": "#F8F8FF"}, {"name": "Gris Plomo", "hex": "#708090"}]'::jsonb,
true, 203),

-- Jewel Tones
('tonos_joya', 'Tonos Joya', 'Jewel Tones', 'lujoso', 'todo-el-año',
'[{"name": "Esmeralda", "hex": "#50C878"}, {"name": "Zafiro", "hex": "#0F52BA"}, {"name": "Rubí", "hex": "#E0115F"}]'::jsonb,
'[{"name": "Amatista", "hex": "#9966CC"}, {"name": "Topacio", "hex": "#FFC87C"}]'::jsonb,
'[{"name": "Platino", "hex": "#E5E4E2"}, {"name": "Carbón", "hex": "#36454F"}]'::jsonb,
false, 204),

-- Scandinavian Minimalist
('escandinavo_minimal', 'Escandinavo Minimal', 'Scandinavian Minimal', 'sereno', 'todo-el-año',
'[{"name": "Blanco Nórdico", "hex": "#FEFEFE"}, {"name": "Gris Suave", "hex": "#E8E8E8"}, {"name": "Beige Cálido", "hex": "#F5F5DC"}]'::jsonb,
'[{"name": "Azul Acero Suave", "hex": "#B0C4DE"}, {"name": "Verde Salvia", "hex": "#9CAF88"}]'::jsonb,
'[{"name": "Madera Clara", "hex": "#F3E5AB"}, {"name": "Gris Carbón", "hex": "#4A4A4A"}]'::jsonb,
true, 205)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN design_styles.code IS 'Unique identifier for each global design style';
COMMENT ON COLUMN design_styles.category IS 'Style categorization: historico, moderno, contemporaneo, global, lifestyle, hibrido';
COMMENT ON COLUMN color_palettes.mood IS 'Emotional tone: elegante, calido, fresco, lujoso, sereno, energetico';