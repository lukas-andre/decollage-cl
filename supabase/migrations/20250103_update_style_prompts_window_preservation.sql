-- Update all staging style base prompts to include window preservation rules
-- This ensures that windows are never modified during virtual staging

UPDATE staging_styles
SET base_prompt = 
  CASE 
    WHEN code = 'modern' THEN 
      'Modern minimalist interior with clean lines, neutral colors, and contemporary furniture. PRESERVE ALL WINDOWS EXACTLY - no modifications to window frames, glass, or views. Only add furniture that fits naturally in the visible space.'
    
    WHEN code = 'scandinavian' THEN 
      'Scandinavian style with light woods, cozy textiles, and hygge atmosphere. MAINTAIN WINDOWS AS-IS - no changes to windows, frames, or natural light. Place furniture naturally without overcrowding.'
    
    WHEN code = 'industrial' THEN 
      'Industrial loft style with exposed elements, metal fixtures, and urban character. DO NOT ALTER WINDOWS - keep original window appearance and natural light. Stage only visible areas naturally.'
    
    WHEN code = 'traditional' THEN 
      'Classic traditional style with elegant furniture and timeless appeal. WINDOWS MUST REMAIN UNCHANGED - preserve exact window structure and views. Add furniture that fits the space naturally.'
    
    WHEN code = 'contemporary' THEN 
      'Contemporary design with current trends and sophisticated elements. KEEP WINDOWS EXACTLY AS SHOWN - no window modifications allowed. Natural furniture placement only.'
    
    WHEN code = 'bohemian' THEN 
      'Bohemian eclectic style with artistic flair and layered textures. PRESERVE ORIGINAL WINDOWS - maintain all window features unchanged. Stage visible space naturally without forcing furniture.'
    
    WHEN code = 'farmhouse' THEN 
      'Rustic farmhouse charm with natural materials and cozy comfort. DO NOT MODIFY WINDOWS - keep all windows in their original state. Place furniture naturally in available space.'
    
    WHEN code = 'mid_century' THEN 
      'Mid-century modern with retro flair and iconic design pieces. WINDOWS REMAIN UNTOUCHED - no changes to window appearance. Natural, uncrowded furniture arrangement.'
    
    WHEN code = 'luxury' THEN 
      'Luxury high-end staging with premium materials and sophisticated design. MAINTAIN EXACT WINDOW APPEARANCE - no window alterations. Stage elegantly without overcrowding.'
    
    WHEN code = 'coastal' THEN 
      'Coastal beach house style with light, airy atmosphere and ocean-inspired palette. PRESERVE ALL WINDOWS - keep original windows and natural light. Natural furniture placement for the visible space.'
    
    WHEN code = 'mediterranean' THEN 
      'Mediterranean villa style with warm colors and old-world charm. DO NOT ALTER ANY WINDOWS - maintain original window features. Stage naturally without forcing all furniture.'
    
    WHEN code = 'japanese' THEN 
      'Japanese zen style with minimalism and natural harmony. WINDOWS MUST STAY UNCHANGED - preserve exact window appearance. Minimal, natural furniture placement.'
    
    WHEN code = 'art_deco' THEN 
      'Art Deco glamour with geometric patterns and luxurious materials. KEEP WINDOWS AS-IS - no window modifications. Stage visible areas naturally.'
    
    WHEN code = 'southwestern' THEN 
      'Southwestern desert style with warm earth tones and cultural elements. PRESERVE WINDOW INTEGRITY - maintain all original window features. Natural furniture arrangement only.'
    
    WHEN code = 'tropical' THEN 
      'Tropical paradise style with lush greenery and vacation vibes. DO NOT CHANGE WINDOWS - keep windows exactly as shown. Stage naturally for the space available.'
    
    ELSE base_prompt || ' IMPORTANT: DO NOT MODIFY WINDOWS - preserve all windows exactly as shown. Stage furniture naturally in visible space only.'
  END,
  updated_at = NOW()
WHERE is_active = true;

-- Add a comment to the table documenting this requirement
COMMENT ON COLUMN staging_styles.base_prompt IS 'Base prompt for AI generation. Must include explicit instructions to preserve windows and architectural features unchanged. Updated 2025-01-03 for window preservation.';