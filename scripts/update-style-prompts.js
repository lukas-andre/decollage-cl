import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateStylePrompts() {
  console.log('🔄 Updating style prompts with window preservation rules...')
  
  const styles = [
    {
      code: 'modern',
      prompt: 'Modern minimalist interior with clean lines, neutral colors, and contemporary furniture. PRESERVE ALL WINDOWS EXACTLY - no modifications to window frames, glass, or views. Only add furniture that fits naturally in the visible space.'
    },
    {
      code: 'scandinavian',
      prompt: 'Scandinavian style with light woods, cozy textiles, and hygge atmosphere. MAINTAIN WINDOWS AS-IS - no changes to windows, frames, or natural light. Place furniture naturally without overcrowding.'
    },
    {
      code: 'industrial',
      prompt: 'Industrial loft style with exposed elements, metal fixtures, and urban character. DO NOT ALTER WINDOWS - keep original window appearance and natural light. Stage only visible areas naturally.'
    },
    {
      code: 'traditional',
      prompt: 'Classic traditional style with elegant furniture and timeless appeal. WINDOWS MUST REMAIN UNCHANGED - preserve exact window structure and views. Add furniture that fits the space naturally.'
    },
    {
      code: 'contemporary',
      prompt: 'Contemporary design with current trends and sophisticated elements. KEEP WINDOWS EXACTLY AS SHOWN - no window modifications allowed. Natural furniture placement only.'
    },
    {
      code: 'bohemian',
      prompt: 'Bohemian eclectic style with artistic flair and layered textures. PRESERVE ORIGINAL WINDOWS - maintain all window features unchanged. Stage visible space naturally without forcing furniture.'
    },
    {
      code: 'farmhouse',
      prompt: 'Rustic farmhouse charm with natural materials and cozy comfort. DO NOT MODIFY WINDOWS - keep all windows in their original state. Place furniture naturally in available space.'
    },
    {
      code: 'mid_century',
      prompt: 'Mid-century modern with retro flair and iconic design pieces. WINDOWS REMAIN UNTOUCHED - no changes to window appearance. Natural, uncrowded furniture arrangement.'
    },
    {
      code: 'luxury',
      prompt: 'Luxury high-end staging with premium materials and sophisticated design. MAINTAIN EXACT WINDOW APPEARANCE - no window alterations. Stage elegantly without overcrowding.'
    },
    {
      code: 'coastal',
      prompt: 'Coastal beach house style with light, airy atmosphere and ocean-inspired palette. PRESERVE ALL WINDOWS - keep original windows and natural light. Natural furniture placement for the visible space.'
    }
  ]
  
  for (const style of styles) {
    const { error } = await supabase
      .from('staging_styles')
      .update({ 
        base_prompt: style.prompt,
        updated_at: new Date().toISOString()
      })
      .eq('code', style.code)
    
    if (error) {
      console.error(`❌ Error updating ${style.code}:`, error)
    } else {
      console.log(`✅ Updated ${style.code}`)
    }
  }
  
  console.log('✨ Style prompts updated successfully!')
}

updateStylePrompts().catch(console.error)