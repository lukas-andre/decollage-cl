-- =============================================
-- CHILEAN DESIGN SYSTEM SEEDER
-- =============================================
-- Culturally-grounded design data for Chilean market
-- Based on Chilean geography, architecture, and traditions
-- Version: 1.0.0
-- Created: 2025-01-15
-- =============================================

-- =============================================
-- SECTION 1: CHILEAN DESIGN STYLES
-- =============================================

INSERT INTO design_styles (
    code, name, name_en, category, description, 
    base_prompt, negative_prompt, inspiration_keywords, 
    is_featured, sort_order
) VALUES

-- Mediterráneo de Hacienda
('mediterraneo_hacienda', 'Mediterráneo de Hacienda', 'Hacienda Mediterranean', 'clasico', 
'Una fusión del estilo colonial español con la calidez del Mediterráneo. Prioriza materiales naturales, muros blancos y la conexión con patios y jardines.',
'Interior of a Chilean hacienda great room, white stucco walls with a rough texture, exposed dark wood ceiling beams, terracotta tile floors, large arched doorways leading to a sunlit central courtyard with lush plants. Furnishings are rustic yet elegant, with heavy wooden tables, leather armchairs, and handwoven textiles. Natural light streams in. acogedor, elegante, rústico.',
'cluttered, dark, overly modern, plastic furniture, small windows',
'{"hacienda", "colonial", "terracotta", "madera nativa", "patio interior", "estuco", "vigas a la vista"}',
true, 1),

-- Bohemio Porteño (Valparaíso)
('boho_valparaiso', 'Bohemio Porteño', 'Valparaiso Bohemian', 'bohemio',
'Inspirado en los colores y el espíritu artístico de Valparaíso. Un estilo ecléctico que mezcla lo vintage, el arte local y una explosión de color.',
'An eclectic, bohemian living space in a colorful Valparaíso hillside home. Walls are a vibrant mix of textures, perhaps one wall in a bright color like turquoise or ochre, another with exposed brick. Filled with vintage furniture, mismatched patterns, contemporary Chilean art, and lots of plants. A large window shows a view of the colorful port city. artístico, vibrante, ecléctico, con historia.',
'minimalist, neutral colors, matching furniture set, sterile, corporate',
'{"Valparaíso", "colorido", "ecléctico", "arte local", "vintage", "cerros", "porteño"}',
true, 2),

-- Rústico Patagónico
('rustico_patagonico', 'Rústico Patagónico', 'Patagonian Rustic', 'rustico',
'Un estilo que evoca un refugio en el sur de Chile. Mucha madera nativa, piedra, lana y una gran chimenea, con ventanales que miran al paisaje imponente.',
'A cozy, rustic Patagonian living room. Walls of rough-hewn native wood planks and a large stone fireplace. A massive picture window frames a dramatic view of Torres del Paine granite peaks and a turquoise lake. Furniture is simple and durable, with leather sofas, thick wool blankets (frazadas), and natural textures. Warm, inviting, and connected to the wild landscape. refugio, natural, imponente.',
'delicate, tropical, urban, bright colors, flimsy furniture',
'{"patagonia", "madera nativa", "piedra", "lana", "chimenea", "vista a la montaña", "refugio"}',
true, 3),

-- Modernismo Andino
('modernismo_andino', 'Modernismo Andino', 'Andean Modernism', 'moderno',
'Minimalismo con identidad local. Líneas limpias, concreto a la vista, grandes ventanales y madera, inspirado en la geografía de la Cordillera de los Andes.',
'A minimalist living space with clean lines and a strong connection to the Andean landscape. Polished concrete floors, walls of glass, and ceilings of light native wood. The furniture is low-profile and contemporary, with a neutral color palette. The design emphasizes geometric forms and natural light, with a large window looking out onto the stark, beautiful mountains. A few handcrafted ceramic pieces or a single Aymara textile provide a touch of local artistry. depurado, geométrico, conectado.',
'ornate, classical, cluttered, small, dark, traditional',
'{"moderno", "minimalista", "concreto", "grandes ventanales", "cordillera", "diseño chileno", "arquitectura chilena"}',
false, 4),

-- Sur Mágico de Chiloé
('sur_chilote', 'Sur Mágico de Chiloé', 'Magical Chiloé', 'rustico',
'Inspirado en la arquitectura única de Chiloé. Interiores completamente revestidos en madera, con técnicas de carpintería naval y un ambiente acogedor y místico.',
'The interior of a Chilote "palafito" (stilt house) overlooking the water. The entire room—walls, floor, and vaulted ceiling—is clad in warm, interlocking native wood planks, showcasing expert carpentry. A central wood-burning stove provides warmth. The decor is simple and handcrafted, featuring handwoven wool textiles and local pottery. A window looks out onto the misty fjord. artesanal, maderero, acogedor, sureño.',
'concrete, metal, minimalist, urban, tropical, bright',
'{"chiloé", "palafito", "madera", "artesanía", "tejidos", "niebla", "tejuelas"}',
false, 5),

-- Étnico Contemporáneo Mapuche
('etnico_mapuche', 'Étnico Contemporáneo Mapuche', 'Contemporary Mapuche Ethnic', 'bohemio',
'Un estilo moderno que integra con respeto la rica simbología y estética de la cultura Mapuche, usando sus textiles, colores y materialidad.',
'A modern living room with a strong Mapuche influence. Neutral walls serve as a gallery for a large, handwoven Mapuche textile with bold geometric patterns in black, red, and white. The decor includes low wooden furniture, cushions with traditional patterns, and subtle silver accents. A piece of handcrafted pottery (greda) sits on a side table. The atmosphere is earthy, spiritual, and deeply connected to Chilean roots. con alma, geométrico, tierra.',
'industrial, futuristic, plastic, overly colorful, generic',
'{"mapuche", "textil", "greca", "kultrun", "platería", "tierra", "artesanía"}',
false, 6)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SECTION 2: CHILEAN COLOR PALETTES
-- =============================================

INSERT INTO color_palettes (
    code, name, name_en, mood, season, 
    primary_colors, accent_colors, neutral_colors,
    is_featured, sort_order
) VALUES

-- Atardecer en Atacama
('atardecer_atacama', 'Atardecer en Atacama', 'Atacama Sunset', 'calido', 'todo-el-año',
'[{"name": "Rojo Atacama", "hex": "#D73027"}, {"name": "Naranja Desierto", "hex": "#FC8D59"}, {"name": "Ocre Cálido", "hex": "#FEE08B"}]'::jsonb,
'[{"name": "Cielo Púrpura", "hex": "#764189"}]'::jsonb,
'[{"name": "Arena Blanca", "hex": "#F7F7F7"}, {"name": "Tierra Oscura", "hex": "#8B4513"}]'::jsonb,
true, 1),

-- Azul Glaciar Patagónico
('glaciar_patagonia', 'Azul Glaciar Patagónico', 'Patagonian Glacier Blue', 'fresco', 'invierno',
'[{"name": "Azul Glaciar", "hex": "#4A90E2"}, {"name": "Turquesa Lago", "hex": "#17A2B8"}, {"name": "Gris Granito", "hex": "#6C757D"}]'::jsonb,
'[{"name": "Nieve Pura", "hex": "#FFFFFF"}]'::jsonb,
'[{"name": "Roca Oscura", "hex": "#343A40"}, {"name": "Hielo Pálido", "hex": "#F8F9FA"}]'::jsonb,
true, 2),

-- Valparaíso Vibrante
('valparaiso_vibrante', 'Valparaíso Vibrante', 'Vibrant Valparaíso', 'energetico', 'verano',
'[{"name": "Amarillo Cerro", "hex": "#FFC107"}, {"name": "Azul Porteño", "hex": "#007BFF"}, {"name": "Rojo Casa", "hex": "#DC3545"}]'::jsonb,
'[{"name": "Ascensor Verde", "hex": "#00E671"}, {"name": "Flor de Jacarandá", "hex": "#9A2CF8"}]'::jsonb,
'[{"name": "Niebla Marina", "hex": "#E9ECEF"}, {"name": "Sombra Cerro", "hex": "#495057"}]'::jsonb,
true, 3),

-- Valle Central Carmenere
('vino_carmenere', 'Valle Central Carmenere', 'Central Valley Carmenere', 'sofisticado', 'otoño',
'[{"name": "Carmenere Profundo", "hex": "#722F37"}, {"name": "Verde Viña", "hex": "#355E3B"}, {"name": "Tierra Fértil", "hex": "#8B4513"}]'::jsonb,
'[{"name": "Uva Moscatel", "hex": "#F0E68C"}, {"name": "Madera Roble", "hex": "#D2691E"}]'::jsonb,
'[{"name": "Corcho Natural", "hex": "#DEB887"}, {"name": "Sombra Barrica", "hex": "#654321"}]'::jsonb,
false, 4),

-- Lapislázuli Andino
('lapislazuli_andino', 'Lapislázuli Andino', 'Andean Lapis Lazuli', 'elegante', 'todo-el-año',
'[{"name": "Azul Lapislázuli", "hex": "#1E3A8A"}, {"name": "Ultramarino", "hex": "#3B82F6"}, {"name": "Calcita Blanca", "hex": "#F8FAFC"}]'::jsonb,
'[{"name": "Oro Pirita", "hex": "#FBBF24"}, {"name": "Plata Andina", "hex": "#E5E7EB"}]'::jsonb,
'[{"name": "Gris Andino", "hex": "#9CA3AF"}, {"name": "Roca Madre", "hex": "#4B5563"}]'::jsonb,
false, 5)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SECTION 3: CHILEAN ROOM TYPES
-- =============================================

INSERT INTO room_types (
    code, name, name_en, description, icon_name, sort_order
) VALUES

-- Standard Chilean domestic spaces
('living', 'Living', 'Living Room', 'El espacio principal y más formal de la casa para recibir visitas.', 'Sofa', 1),
('sala_estar', 'Sala de Estar', 'Family Room', 'Un segundo living más pequeño e informal, para el uso diario de la familia.', 'Tv', 2),
('comedor', 'Comedor', 'Dining Room', 'El lugar designado para las comidas formales.', 'Utensils', 3),
('dormitorio_principal', 'Dormitorio Principal / En Suite', 'Master Bedroom', 'La habitación principal, usualmente con baño privado.', 'BedDouble', 4),
('dormitorio_ninos', 'Dormitorio de Niños', 'Kids Room', 'Espacio diseñado para los más pequeños de la casa.', 'Baby', 5),
('cocina', 'Cocina', 'Kitchen', 'El corazón del hogar, donde se prepara la comida.', 'ChefHat', 6),
('bano_visitas', 'Baño de Visitas', 'Powder Room', 'Baño pequeño para invitados, usualmente sin ducha.', 'ShowerHead', 7),

-- Uniquely Chilean spaces
('logia', 'Logia', 'Utility Room', 'Espacio cerrado para la lavadora, secadora y artículos de aseo.', 'WashingMachine', 8),
('quincho', 'Quincho', 'BBQ Area', 'Estructura, a menudo techada, con parrilla para hacer asados.', 'Grill', 9),

-- Additional spaces
('home_office', 'Home Office / Escritorio', 'Home Office', 'Espacio de trabajo o estudio en casa.', 'Laptop', 10),
('terraza', 'Terraza / Balcón', 'Terrace / Balcony', 'Espacio exterior conectado a la casa, puede ser techado o no.', 'Sun', 11),
('bodega', 'Bodega', 'Storage Room', 'Espacio de almacenamiento, a menudo en el subterráneo o garaje.', 'Archive', 12)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SECTION 4: CHILEAN SEASONAL THEMES
-- =============================================

INSERT INTO seasonal_themes (
    code, name, description, start_date, end_date,
    theme_colors, decoration_elements, special_prompts
) VALUES

-- Fiestas Patrias
('fiestas_patrias', 'Fiestas Patrias', 
'Celebra el 18 de septiembre con los colores de Chile, guirnaldas y un ambiente de fonda.',
'2025-09-01', '2025-09-30',
'{"primary": ["#D52B1E", "#FFFFFF", "#0039A6"], "accent": ["#C59960"]}'::jsonb,
'["guirnaldas tricolor", "banderines chilenos", "mantel de cuadros", "copihues rojos y blancos"]'::jsonb,
'{"add": "A table in the background is set with empanadas de pino and a glass of red wine, festive atmosphere.", "style": "Celebratory and traditional Chilean style."}'::jsonb),

-- Navidad Chilena
('navidad_chilena', 'Navidad Chilena',
'El espíritu de una Navidad en verano. Decora con el Viejito Pascuero, Pan de Pascua y un toque de sol.',
'2025-12-01', '2025-12-31',
'{"primary": ["#C41E3A", "#165B33", "#FFD700"], "accent": ["#FFFFFF", "#C0C0C0"]}'::jsonb,
'["árbol de pascua artificial", "luces navideñas", "pesebre", "figuras del Viejito Pascuero"]'::jsonb,
'{"add": "Through a window, you can see a sunny summer day. On a side table, there is a slice of Pan de Pascua and a glass of Cola de Mono.", "style": "Festive summer Christmas."}'::jsonb),

-- Verano en la Costa
('verano_chileno', 'Verano en la Costa',
'Captura la brisa y la luz del verano en la costa chilena. Tonos claros, materiales naturales y una sensación de relajo.',
'2024-12-21', '2025-03-20',
'{"primary": ["#87CEEB", "#F5DEB3", "#FFFFFF"], "accent": ["#40E0D0"]}'::jsonb,
'["conchas marinas", "textiles de lino blanco", "madera lavada", "elementos náuticos sutiles"]'::jsonb,
'{"add": "The room has large open doors leading to a wooden deck with a view of the Pacific Ocean.", "style": "Bright, airy, and relaxed coastal summer style."}'::jsonb),

-- Otoño de Vendimia
('otono_vendimia', 'Otoño de Vendimia',
'Los colores cálidos del otoño y la vendimia en los valles de Chile. Tonos tierra, naranjos y burdeos para un ambiente acogedor.',
'2025-03-21', '2025-05-31',
'{"primary": ["#D2691E", "#B22222", "#8B4513"], "accent": ["#80013F"]}'::jsonb,
'["hojas de parra secas", "centros de mesa con uvas", "textiles en tonos tierra", "botellas de vino decorativas"]'::jsonb,
'{"add": "A cozy throw blanket in a deep burgundy color is draped over a chair. The lighting is warm and golden, like an autumn afternoon.", "style": "Warm, cozy, and sophisticated autumn harvest theme."}'::jsonb)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SECTION 5: UPDATE EXISTING STYLES
-- =============================================

-- Update existing styles with Chilean-specific content
UPDATE design_styles SET
    name = 'Mediterráneo Costero',
    name_en = 'Chilean Coastal Mediterranean',
    base_prompt = 'Chilean coastal Mediterranean interior with terracotta floors, white stucco walls, and ocean views. Natural materials, arched doorways, rustic wood beams.',
    inspiration_keywords = '{"mediterraneo", "costero", "terracotta", "madera", "arco", "blanco"}'
WHERE code = 'mediterraneo_chileno' AND EXISTS (SELECT 1 FROM design_styles WHERE code = 'mediterraneo_chileno');

UPDATE design_styles SET
    name = 'Minimalista Andino',
    name_en = 'Andean Minimalist',
    base_prompt = 'Minimalist interior with Andean influences, concrete floors, large mountain views, neutral colors, geometric forms, natural light.',
    inspiration_keywords = '{"minimalista", "andino", "concreto", "montaña", "geometrico", "luz"}'
WHERE code = 'minimalista_santiago' AND EXISTS (SELECT 1 FROM design_styles WHERE code = 'minimalista_santiago');

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE design_styles IS 'Chilean-inspired design styles rooted in geography and culture';
COMMENT ON TABLE color_palettes IS 'Color palettes derived from Chilean landscapes and cultural elements';
COMMENT ON TABLE room_types IS 'Room types using authentic Chilean domestic terminology';
COMMENT ON TABLE seasonal_themes IS 'Seasonal themes celebrating Chilean holidays and traditions';