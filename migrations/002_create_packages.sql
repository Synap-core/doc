-- ============================================================================
-- Migration: Create packages table
-- ============================================================================
--
-- Run against the CONTROL PLANE database (api.synap.live).
-- This creates the package registry — a catalog of installable package
-- definitions that users can browse and install into their data pods.
--
-- Replaces the earlier entity_profile_packages table with a more general
-- "packages" table that supports multi-profile packages, views, and widgets.
-- ============================================================================

-- Drop old table if migrating from entity_profile_packages
-- DROP TABLE IF EXISTS entity_profile_packages CASCADE;

CREATE TABLE IF NOT EXISTS packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Package identity
  slug          TEXT NOT NULL,
  version       TEXT NOT NULL DEFAULT '1.0.0',
  display_name  TEXT NOT NULL,
  description   TEXT,

  -- Author & visibility
  author_id     TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  is_public     BOOLEAN NOT NULL DEFAULT false,
  is_verified   BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  preview_image_url TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  install_count INTEGER NOT NULL DEFAULT 0,

  -- The complete package definition (see PackageDefinition type)
  -- Contains: profiles[], views[]?, widgets[]?
  definition    JSONB NOT NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one entry per slug+version+author
-- COALESCE handles NULL author_id (official Synap packages)
CREATE UNIQUE INDEX IF NOT EXISTS packages_slug_version_author_idx
  ON packages(slug, version, COALESCE(author_id, '__synap_official__'));

CREATE INDEX IF NOT EXISTS packages_public_idx
  ON packages(is_public);

CREATE INDEX IF NOT EXISTS packages_author_idx
  ON packages(author_id);

CREATE INDEX IF NOT EXISTS packages_slug_idx
  ON packages(slug);
