# Project Management Feature

## Overview
The Project feature allows users to organize their virtual staging work into named projects (e.g., "House 1", "Downtown Apartment", "Client Smith Property"). This provides better organization, easier navigation, and improved gallery viewing of generated images.

## User Flow

### 1. Project Creation
- User clicks "New Project" button on dashboard
- Modal appears with project creation form:
  - Project Name (required, max 100 chars)
  - Description (optional, max 500 chars)
  - Client Name (optional)
  - Property Address (optional)
  - Project Type (residential/commercial)
  - Target Completion Date (optional)
- System creates project with unique ID
- User is redirected to project workspace

### 2. Project Workspace
- **Project Header**
  - Project name and details
  - Edit/Delete project buttons
  - Progress indicator (X images generated)
  - Token usage for project
  
- **Upload Section**
  - Drag-and-drop zone for multiple images
  - Batch upload support
  - Image preview before processing
  
- **Generation Queue**
  - List of pending/processing images
  - Batch style application
  - Priority ordering
  
- **Gallery View**
  - Grid/List toggle
  - Before/After slider view
  - Filter by room type, style, date
  - Bulk download options

### 3. Project Management
- Projects list on dashboard
- Search and filter projects
- Archive completed projects
- Share project via link (read-only)
- Export project report (PDF)

## Data Model

### Tables

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  client_name VARCHAR(200),
  property_address TEXT,
  project_type VARCHAR(50) DEFAULT 'residential', -- residential, commercial
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  target_date DATE,
  metadata JSONB DEFAULT '{}',
  share_token VARCHAR(100) UNIQUE, -- for sharing
  is_public BOOLEAN DEFAULT false,
  total_images INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_share_token ON projects(share_token) WHERE share_token IS NOT NULL;
```

#### `project_images`
```sql
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES staging_generations(id) ON DELETE SET NULL,
  original_image_url TEXT NOT NULL,
  original_cloudflare_id TEXT,
  upload_order INTEGER,
  room_name VARCHAR(100), -- user-defined room name
  room_type VARCHAR(50), -- living_room, bedroom, etc.
  notes TEXT,
  status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, queued, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_project_images_generation_id ON project_images(generation_id);
CREATE INDEX idx_project_images_status ON project_images(status);
```

#### `project_collaborators`
```sql
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer', -- viewer, editor
  invited_by UUID REFERENCES profiles(id),
  accepted BOOLEAN DEFAULT false,
  invite_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_email ON project_collaborators(email);
CREATE INDEX idx_project_collaborators_invite_token ON project_collaborators(invite_token);
```

#### `project_templates`
```sql
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  style_id UUID REFERENCES staging_styles(id),
  room_type VARCHAR(50),
  advanced_settings JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_templates_project_id ON project_templates(project_id);
```

### Update to existing `staging_generations` table
```sql
ALTER TABLE staging_generations 
ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN project_image_id UUID REFERENCES project_images(id) ON DELETE SET NULL;

CREATE INDEX idx_staging_generations_project_id ON staging_generations(project_id);
```

## API Endpoints

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/archive` - Archive project
- `GET /api/projects/:id/share` - Get shareable link
- `GET /api/projects/:id/export` - Export project report

### Project Images
- `POST /api/projects/:id/images` - Upload images to project
- `GET /api/projects/:id/images` - List project images
- `DELETE /api/projects/:id/images/:imageId` - Remove image
- `POST /api/projects/:id/images/batch-generate` - Batch generate staging

### Collaboration
- `POST /api/projects/:id/collaborators` - Invite collaborator
- `GET /api/projects/:id/collaborators` - List collaborators
- `DELETE /api/projects/:id/collaborators/:collaboratorId` - Remove collaborator

## Frontend Components

### Required Components
```typescript
// components/projects/
├── ProjectCard.tsx          // Project thumbnail card
├── ProjectCreateModal.tsx   // New project form
├── ProjectList.tsx         // Projects grid/list view
├── ProjectWorkspace.tsx    // Main project workspace
├── ProjectHeader.tsx       // Project info and actions
├── ProjectGallery.tsx      // Image gallery with filters
├── ProjectUploader.tsx     // Batch upload interface
├── ProjectShareModal.tsx   // Share project settings
├── ProjectExport.tsx       // Export options
└── BeforeAfterSlider.tsx  // Image comparison view
```

## Implementation Phases

### Phase 1: Core Project Management (Week 1)
- [ ] Create database tables and migrations
- [ ] Implement basic CRUD APIs for projects
- [ ] Create project list and creation UI
- [ ] Basic project workspace

### Phase 2: Image Management (Week 2)
- [ ] Batch upload functionality
- [ ] Link generations to projects
- [ ] Gallery view with filtering
- [ ] Before/after comparison

### Phase 3: Collaboration & Sharing (Week 3)
- [ ] Share link generation
- [ ] Collaborator invitations
- [ ] Public project view
- [ ] Export functionality

### Phase 4: Advanced Features (Week 4)
- [ ] Project templates
- [ ] Batch processing
- [ ] Progress tracking
- [ ] Analytics per project

## Security Considerations

### Row Level Security (RLS)
```sql
-- Projects: Users can only see their own projects or shared projects
CREATE POLICY projects_select ON projects
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_public = true OR
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND email = auth.email()
      AND accepted = true
    )
  );

-- Project images: Inherit project permissions
CREATE POLICY project_images_select ON project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_images.project_id
      AND (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_id = projects.id
          AND email = auth.email()
          AND accepted = true
        )
      )
    )
  );
```

## Performance Optimizations

### Caching Strategy
- Cache project list per user (5 min TTL)
- Cache project details (10 min TTL)
- CDN caching for shared projects
- Lazy load images in gallery

### Database Optimizations
- Pagination for image galleries
- Partial indexes for active projects
- Materialized view for project statistics
- Background jobs for batch operations

## Metrics & Analytics

### Track per Project
- Total images uploaded
- Successful generations
- Token consumption
- Average processing time
- Most used styles
- User engagement time

### Dashboard Metrics
- Active projects count
- Completion rate
- Average project size
- Popular styles by project type
- Collaboration statistics

## Future Enhancements

### V2 Features
- Project duplication
- Bulk style changes
- AI-suggested room organization
- Project comparison tool
- White-label project sharing
- API access per project
- Webhook notifications
- Mobile app support

### V3 Features
- Project marketplace
- Template library
- Team workspaces
- Advanced permissions
- Version control for images
- AI project insights
- Cost estimation per project
- Integration with property management systems