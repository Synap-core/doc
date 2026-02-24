-- ============================================================================
-- Migration: Add view_id to entities
-- ============================================================================
--
-- Run against the DATA POD database (NOT the control plane).
-- This allows entities to link to a View (whiteboard, bento, kanban, etc.)
-- in addition to or instead of a Document.
--
-- The entity panel rendering logic:
--   entity.viewId set    → render that view (canvas/structured)
--   entity.documentId set → render document editor
--   neither              → render properties only
--
-- This is OPTIONAL — entities without a view_id continue to work exactly
-- as before (document-only or properties-only).
-- ============================================================================

ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS view_id UUID REFERENCES views(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_entities_view_id ON entities(view_id)
  WHERE view_id IS NOT NULL;

COMMENT ON COLUMN entities.view_id IS
  'Optional link to a View (whiteboard, bento, kanban) that serves as this entity''s visual content. '
  'Complementary to document_id — an entity can have both, either, or neither.';
