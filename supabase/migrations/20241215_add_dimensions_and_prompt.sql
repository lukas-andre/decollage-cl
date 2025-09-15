-- Add dimensions and custom_prompt fields to staging_generations table

-- Add dimensions field (JSONB for width and height)
ALTER TABLE staging_generations
ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Add custom_prompt field
ALTER TABLE staging_generations  
ADD COLUMN IF NOT EXISTS custom_prompt TEXT;

-- Add provider field to track which AI provider was used
ALTER TABLE staging_generations
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'runware';

-- Create index on provider for performance
CREATE INDEX IF NOT EXISTS idx_staging_generations_provider ON staging_generations(provider);

-- Add dimensions to project_images table as well (for storing original image dimensions)
ALTER TABLE project_images
ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Comment on new columns
COMMENT ON COLUMN staging_generations.dimensions IS 'Room dimensions in meters {width: number, height: number}';
COMMENT ON COLUMN staging_generations.custom_prompt IS 'User-provided custom instructions for generation';
COMMENT ON COLUMN staging_generations.provider IS 'AI provider used for generation (runware, gemini, etc)';
COMMENT ON COLUMN project_images.dimensions IS 'Original image estimated dimensions in meters';