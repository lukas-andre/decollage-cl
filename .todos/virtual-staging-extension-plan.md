# 🏗️ Virtual Staging Platform Extension Plan
*Version 1.0 - December 2024*

## 📋 Executive Summary

This document outlines the comprehensive plan to extend VirtualStaging.cl with advanced capabilities including dimension controls, exterior space support (gardens & facades), custom user prompts, and persistent custom styles. The implementation follows a phased approach with clear priorities and technical specifications.

---

## 🎯 Feature Overview

### 1. **Dimension Selector** (Optional Enhancement)
- User-selectable output dimensions for generated images
- Aspect ratio preservation options
- Resolution presets for different use cases

### 2. **Exterior Space Support** (Jardines & Fachadas)
- Garden/landscape virtual staging
- Building facade enhancement
- Outdoor furniture and decoration placement

### 3. **Custom User Prompts**
- Free-text input for specific requirements
- AI prompt enhancement and validation
- Prompt history and favorites

### 4. **Custom Style Preservation**
- User-defined style templates
- Style library per user/organization
- Cross-project style application

---

## 📊 Data Model Extensions

### New Database Tables

#### 1. `space_types` (Replacing/Extending room_types)
```sql
CREATE TABLE space_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('interior', 'exterior', 'facade')),
  description TEXT,
  base_elements JSONB, -- Core elements for this space type
  compatible_styles TEXT[], -- Array of compatible style codes
  dimension_presets JSONB, -- Recommended dimensions
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data for new space types
INSERT INTO space_types (code, name, category, base_elements) VALUES
('garden', 'Jardín', 'exterior', '{"elements": ["lawn", "plants", "paths", "lighting"]}'),
('patio', 'Patio', 'exterior', '{"elements": ["flooring", "furniture", "planters", "pergola"]}'),
('pool_area', 'Área de Piscina', 'exterior', '{"elements": ["pool", "deck", "loungers", "umbrellas"]}'),
('facade', 'Fachada', 'facade', '{"elements": ["walls", "windows", "doors", "roof", "landscaping"]}'),
('entrance', 'Entrada Principal', 'facade', '{"elements": ["door", "steps", "lighting", "plants"]}'),
('balcony', 'Balcón/Terraza', 'exterior', '{"elements": ["railing", "flooring", "furniture", "plants"]}');
```

#### 2. `custom_styles`
```sql
CREATE TABLE custom_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Future feature
  name TEXT NOT NULL,
  description TEXT,
  base_prompt TEXT NOT NULL, -- Core prompt template
  style_elements JSONB, -- Detailed style components
  space_type_prompts JSONB, -- Space-specific variations
  example_generation_ids UUID[], -- Reference generations
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT custom_styles_owner CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR 
    (user_id IS NULL AND organization_id IS NOT NULL)
  )
);

CREATE INDEX idx_custom_styles_user ON custom_styles(user_id);
CREATE INDEX idx_custom_styles_public ON custom_styles(is_public) WHERE is_public = true;
```

#### 3. `generation_dimensions`
```sql
CREATE TABLE generation_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  aspect_ratio TEXT, -- e.g., "16:9", "4:3", "1:1"
  category TEXT CHECK (category IN ('standard', 'social', 'print', 'custom')),
  use_cases TEXT[],
  is_default BOOLEAN DEFAULT false,
  token_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Cost adjustment
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed dimension presets
INSERT INTO generation_dimensions (code, name, width, height, aspect_ratio, category, use_cases) VALUES
('hd_landscape', 'HD Horizontal', 1920, 1080, '16:9', 'standard', ARRAY['web', 'presentation']),
('hd_portrait', 'HD Vertical', 1080, 1920, '9:16', 'standard', ARRAY['mobile', 'story']),
('square_lg', 'Cuadrado Grande', 1024, 1024, '1:1', 'standard', ARRAY['social', 'catalog']),
('mls_standard', 'MLS Estándar', 1920, 1280, '3:2', 'standard', ARRAY['real_estate']),
('print_a4', 'Impresión A4', 2480, 3508, '1:1.41', 'print', ARRAY['brochure', 'flyer']),
('instagram_post', 'Instagram Post', 1080, 1080, '1:1', 'social', ARRAY['instagram']),
('instagram_story', 'Instagram Story', 1080, 1920, '9:16', 'social', ARRAY['instagram', 'story']);
```

#### 4. `user_prompts`
```sql
CREATE TABLE user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES staging_generations(id) ON DELETE SET NULL,
  prompt_text TEXT NOT NULL,
  enhanced_prompt TEXT, -- AI-enhanced version
  prompt_type TEXT CHECK (prompt_type IN ('custom', 'modification', 'style')),
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_prompts_user ON user_prompts(user_id);
CREATE INDEX idx_user_prompts_favorite ON user_prompts(user_id, is_favorite) WHERE is_favorite = true;
```

#### 5. `style_templates` (For Quick Access)
```sql
CREATE TABLE style_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  custom_style_id UUID REFERENCES custom_styles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quick_access_code TEXT UNIQUE,
  space_types TEXT[], -- Compatible space types
  base_settings JSONB, -- Default generation settings
  example_images TEXT[], -- Cloudflare URLs
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Modified Tables

#### Update `staging_generations`
```sql
ALTER TABLE staging_generations 
ADD COLUMN space_type_id UUID REFERENCES space_types(id),
ADD COLUMN custom_style_id UUID REFERENCES custom_styles(id),
ADD COLUMN dimension_id UUID REFERENCES generation_dimensions(id),
ADD COLUMN user_prompt_id UUID REFERENCES user_prompts(id),
ADD COLUMN custom_prompt TEXT,
ADD COLUMN dimension_override JSONB, -- {width: 1920, height: 1080}
ADD COLUMN exterior_elements JSONB, -- Specific to gardens/facades
ADD COLUMN style_strength DECIMAL(3,2) DEFAULT 1.0; -- 0.5 to 1.5

-- Add indexes
CREATE INDEX idx_staging_generations_space_type ON staging_generations(space_type_id);
CREATE INDEX idx_staging_generations_custom_style ON staging_generations(custom_style_id);
```

#### Update `projects`
```sql
ALTER TABLE projects
ADD COLUMN default_custom_style_id UUID REFERENCES custom_styles(id),
ADD COLUMN default_dimension_id UUID REFERENCES generation_dimensions(id),
ADD COLUMN project_type TEXT CHECK (project_type IN ('residential', 'commercial', 'mixed', 'landscape'));
```

---

## 🏗️ Implementation Tasks

### Phase 1: Foundation (Priority: HIGH) 🔴

#### Task 1.1: Database Schema Updates
- [ ] Create migration for `space_types` table
- [ ] Migrate existing `room_types` data to `space_types`
- [ ] Create `generation_dimensions` table with presets
- [ ] Update `staging_generations` with new columns
- [ ] Create indexes for performance

#### Task 1.2: Exterior Space Types
- [ ] Add garden/landscape prompts to AI system
- [ ] Create facade-specific generation logic
- [ ] Implement exterior element detection
- [ ] Add weather/lighting conditions support

#### Task 1.3: API Endpoints
- [ ] `GET /api/space-types` - List all space types with categories
- [ ] `GET /api/dimensions` - Get available dimensions
- [ ] `POST /api/generations/exterior` - Generate exterior staging

### Phase 2: Custom Prompts (Priority: HIGH) 🔴

#### Task 2.1: User Prompt System
- [ ] Create `user_prompts` table
- [ ] Implement prompt validation (max 500 chars for Runware)
- [ ] Add prompt enhancement using AI
- [ ] Create prompt history tracking

#### Task 2.2: UI Components
- [ ] Add custom prompt textarea in generation panel
- [ ] Create prompt suggestions/autocomplete
- [ ] Implement prompt favorites system
- [ ] Add prompt history dropdown

#### Task 2.3: Prompt Processing
- [ ] Integrate custom prompts with base style prompts
- [ ] Implement prompt merging logic
- [ ] Add safety filters for inappropriate content
- [ ] Create prompt optimization for different models

### Phase 3: Custom Styles (Priority: MEDIUM) 🟡

#### Task 3.1: Style Management
- [ ] Create `custom_styles` table structure
- [ ] Implement style creation from successful generations
- [ ] Add style editing interface
- [ ] Create style sharing mechanism

#### Task 3.2: Style Application
- [ ] Build style template system
- [ ] Implement cross-project style usage
- [ ] Add style strength controls
- [ ] Create style mixing capabilities

#### Task 3.3: Style Library UI
- [ ] Design style library interface
- [ ] Add style preview gallery
- [ ] Implement style search/filter
- [ ] Create style import/export

### Phase 4: Dimension Controls (Priority: LOW) 🟢

#### Task 4.1: Dimension System
- [ ] Implement dimension presets
- [ ] Add custom dimension input
- [ ] Create aspect ratio calculator
- [ ] Add resolution validation

#### Task 4.2: Cost Calculation
- [ ] Implement token cost multipliers for dimensions
- [ ] Add dimension-based pricing tiers
- [ ] Create cost preview before generation

#### Task 4.3: UI Integration
- [ ] Add dimension selector dropdown
- [ ] Create custom dimension modal
- [ ] Implement dimension preview
- [ ] Add dimension recommendations

---

## 🔧 Technical Implementation Details

### AI Prompt Engineering

#### Garden/Landscape Prompts
```typescript
const GARDEN_STYLES = {
  modern_garden: {
    base: "Modern minimalist garden design",
    elements: ["geometric patterns", "clean lines", "contemporary planters"],
    lighting: ["LED strips", "uplighting", "architectural lighting"]
  },
  tropical_garden: {
    base: "Lush tropical paradise garden",
    elements: ["palm trees", "exotic plants", "water features"],
    lighting: ["tiki torches", "string lights", "moonlighting"]
  },
  zen_garden: {
    base: "Japanese zen garden design",
    elements: ["rock formations", "sand patterns", "bamboo"],
    lighting: ["lanterns", "subtle path lighting"]
  }
}
```

#### Facade Enhancement Prompts
```typescript
const FACADE_STYLES = {
  modern_facade: {
    base: "Contemporary building facade",
    materials: ["glass", "steel", "concrete"],
    features: ["clean lines", "large windows", "flat roof"]
  },
  mediterranean_facade: {
    base: "Mediterranean villa exterior",
    materials: ["stucco", "terracotta", "stone"],
    features: ["arched windows", "tile roof", "warm colors"]
  },
  colonial_facade: {
    base: "Classic colonial architecture",
    materials: ["brick", "wood siding", "shutters"],
    features: ["symmetrical design", "columns", "traditional roof"]
  }
}
```

### Custom Style Processing

```typescript
interface CustomStyle {
  id: string
  name: string
  basePrompt: string
  spaceTypeVariations: {
    [spaceType: string]: {
      prompt: string
      elements: string[]
      modifiers: string[]
    }
  }
  strength: number // 0.5 to 1.5
  colorPalette?: string[]
  materials?: string[]
  furniture?: string[]
}

class CustomStyleProcessor {
  async processCustomStyle(
    style: CustomStyle,
    spaceType: string,
    userPrompt?: string
  ): Promise<string> {
    let finalPrompt = style.basePrompt
    
    // Add space-specific variations
    if (style.spaceTypeVariations[spaceType]) {
      const variation = style.spaceTypeVariations[spaceType]
      finalPrompt += ` ${variation.prompt}`
    }
    
    // Merge with user prompt
    if (userPrompt) {
      finalPrompt = this.mergePrompts(finalPrompt, userPrompt)
    }
    
    // Apply strength modifier
    if (style.strength !== 1.0) {
      finalPrompt = this.adjustPromptStrength(finalPrompt, style.strength)
    }
    
    // Ensure under 500 chars for Runware
    return this.optimizePromptLength(finalPrompt, 500)
  }
}
```

### Dimension Processing

```typescript
interface DimensionSettings {
  width: number
  height: number
  aspectRatio: string
  upscale?: boolean
  tokenMultiplier: number
}

class DimensionProcessor {
  validateDimensions(settings: DimensionSettings): boolean {
    const maxPixels = 4096 * 4096 // Runware limit
    const totalPixels = settings.width * settings.height
    
    if (totalPixels > maxPixels) {
      throw new Error('Dimensions exceed maximum allowed size')
    }
    
    if (settings.width < 512 || settings.height < 512) {
      throw new Error('Minimum dimension is 512px')
    }
    
    return true
  }
  
  calculateTokenCost(
    baseCost: number,
    dimensions: DimensionSettings
  ): number {
    return Math.ceil(baseCost * dimensions.tokenMultiplier)
  }
}
```

---

## 🎨 UI/UX Design Specifications

### Generation Interface Updates

#### 1. Space Type Selector
```tsx
<Tabs defaultValue="interior">
  <TabsList>
    <TabsTrigger value="interior">
      <Home className="w-4 h-4 mr-2" />
      Interiores
    </TabsTrigger>
    <TabsTrigger value="exterior">
      <Trees className="w-4 h-4 mr-2" />
      Exteriores
    </TabsTrigger>
    <TabsTrigger value="facade">
      <Building className="w-4 h-4 mr-2" />
      Fachadas
    </TabsTrigger>
  </TabsList>
</Tabs>
```

#### 2. Custom Prompt Input
```tsx
<div className="space-y-2">
  <Label>Instrucciones Personalizadas (Opcional)</Label>
  <Textarea 
    placeholder="Ej: Agregar plantas tropicales, muebles de mimbre, iluminación cálida..."
    maxLength={300}
    value={customPrompt}
    onChange={(e) => setCustomPrompt(e.target.value)}
  />
  <div className="flex justify-between text-xs text-muted-foreground">
    <span>{customPrompt.length}/300 caracteres</span>
    <Button size="xs" variant="ghost">
      <Sparkles className="w-3 h-3 mr-1" />
      Mejorar con IA
    </Button>
  </div>
</div>
```

#### 3. Custom Style Manager
```tsx
<Card>
  <CardHeader>
    <CardTitle>Mis Estilos Personalizados</CardTitle>
    <Button size="sm">
      <Plus className="w-4 h-4 mr-2" />
      Crear desde Generación
    </Button>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      {customStyles.map(style => (
        <StyleCard 
          key={style.id}
          style={style}
          onApply={() => applyCustomStyle(style)}
          onEdit={() => editCustomStyle(style)}
        />
      ))}
    </div>
  </CardContent>
</Card>
```

#### 4. Dimension Selector
```tsx
<Select value={selectedDimension} onValueChange={setSelectedDimension}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar dimensiones" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Estándar</SelectLabel>
      <SelectItem value="hd_landscape">HD Horizontal (1920x1080)</SelectItem>
      <SelectItem value="square_lg">Cuadrado (1024x1024)</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Redes Sociales</SelectLabel>
      <SelectItem value="instagram_post">Instagram Post (1080x1080)</SelectItem>
      <SelectItem value="instagram_story">Instagram Story (1080x1920)</SelectItem>
    </SelectGroup>
    <Separator />
    <SelectItem value="custom">
      <Settings2 className="w-4 h-4 mr-2" />
      Personalizado...
    </SelectItem>
  </SelectContent>
</Select>
```

---

## 🚀 API Endpoint Specifications

### New Endpoints

#### 1. Space Types
```typescript
// GET /api/space-types
Response: {
  interior: SpaceType[]
  exterior: SpaceType[]
  facade: SpaceType[]
}

// GET /api/space-types/:id/styles
Response: {
  compatible: Style[]
  recommended: Style[]
}
```

#### 2. Custom Styles
```typescript
// POST /api/custom-styles
Request: {
  name: string
  basePrompt: string
  fromGenerationId?: string
  spaceTypes: string[]
}

// GET /api/custom-styles
Response: {
  personal: CustomStyle[]
  organization: CustomStyle[]
  public: CustomStyle[]
}

// POST /api/custom-styles/:id/apply
Request: {
  projectId: string
  baseImageId: string
  strength?: number
}
```

#### 3. Dimensions
```typescript
// GET /api/dimensions
Response: {
  presets: Dimension[]
  categories: {
    standard: Dimension[]
    social: Dimension[]
    print: Dimension[]
  }
}

// POST /api/dimensions/validate
Request: {
  width: number
  height: number
}
Response: {
  valid: boolean
  tokenMultiplier: number
  warnings?: string[]
}
```

#### 4. Enhanced Generation
```typescript
// POST /api/generate/advanced
Request: {
  baseImageId: string
  spaceType: 'interior' | 'exterior' | 'facade'
  styleId?: string
  customStyleId?: string
  customPrompt?: string
  dimensionId?: string
  dimensionOverride?: {
    width: number
    height: number
  }
  exteriorSettings?: {
    season?: 'spring' | 'summer' | 'fall' | 'winter'
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
    weather?: 'sunny' | 'cloudy' | 'rainy'
  }
}
```

---

## 📈 Migration Strategy

### Phase 1: Data Migration
1. Backup existing database
2. Create new tables without dropping old ones
3. Migrate room_types → space_types
4. Update foreign key references gradually
5. Validate data integrity

### Phase 2: Code Migration
1. Create feature flags for new capabilities
2. Implement backward compatibility layer
3. Deploy new endpoints alongside existing
4. Gradually migrate UI components
5. Monitor for issues

### Phase 3: User Migration
1. Enable features for beta users first
2. Gather feedback and iterate
3. Create user documentation
4. Full rollout with announcement
5. Deprecate old features after 30 days

---

## 🎯 Success Metrics

### Technical Metrics
- Generation success rate > 95%
- Average generation time < 30 seconds
- Custom style application accuracy > 90%
- Dimension processing without quality loss

### Business Metrics
- User engagement increase by 40%
- Custom style usage by 60% of active users
- Exterior space generations: 30% of total
- Token consumption increase by 25%

### User Experience Metrics
- Custom prompt usage: 50% of generations
- Style library saves per user: >5
- Dimension customization: 20% of users
- User satisfaction score > 4.5/5

---

## 🔒 Security Considerations

### Prompt Injection Prevention
- Sanitize all user inputs
- Limit prompt length (500 chars)
- Filter prohibited content
- Rate limit per user

### Style Sharing Security
- Validate style ownership
- Implement permission system
- Audit style modifications
- Prevent style theft

### Resource Limits
- Max custom styles per user: 50
- Max prompt history: 100
- Max dimensions: 4096x4096
- Rate limiting: 10 generations/minute

---

## 📅 Timeline

### Month 1: Foundation
- Week 1-2: Database schema and migrations
- Week 3: Exterior space support
- Week 4: Basic API implementation

### Month 2: Core Features
- Week 1-2: Custom prompt system
- Week 3: UI integration
- Week 4: Testing and refinement

### Month 3: Advanced Features
- Week 1-2: Custom style system
- Week 3: Dimension controls
- Week 4: Beta testing

### Month 4: Polish & Launch
- Week 1: Bug fixes and optimization
- Week 2: Documentation
- Week 3: Marketing preparation
- Week 4: Production launch

---

## 🧪 Testing Strategy

### Unit Tests
- Prompt processing logic
- Dimension validation
- Style merging algorithms
- Cost calculations

### Integration Tests
- End-to-end generation flow
- Custom style application
- Database transactions
- API endpoint validation

### User Acceptance Tests
- Garden/facade generation quality
- Custom prompt effectiveness
- Style preservation accuracy
- UI/UX flow validation

### Performance Tests
- Generation speed benchmarks
- Concurrent user handling
- Database query optimization
- Image processing efficiency

---

## 📚 Documentation Requirements

### Developer Documentation
- API reference with examples
- Database schema documentation
- Integration guides
- Troubleshooting guide

### User Documentation
- Feature tutorials
- Best practices guide
- Style creation guide
- FAQ section

### Internal Documentation
- Architecture decisions
- Prompt engineering guide
- Monitoring playbook
- Deployment procedures

---

## 🎉 Conclusion

This comprehensive plan provides a roadmap for extending VirtualStaging.cl with powerful new capabilities. The phased approach ensures stable delivery while maintaining system reliability. Priority should be given to exterior space support and custom prompts as they provide immediate value to users.

### Next Steps
1. Review and approve plan with stakeholders
2. Set up development environment
3. Begin Phase 1 implementation
4. Create detailed sprint plans
5. Establish monitoring and metrics

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Author:** VirtualStaging.cl Development Team