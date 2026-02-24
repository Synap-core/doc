-- ============================================================================
-- Seed: "Service" package (first official example)
-- ============================================================================
--
-- Run against the CONTROL PLANE database after 002_create_packages.sql.
-- This seeds the first official Synap package: "service".
--
-- Users who install this package into their data pod get:
--   * A "Service" entity type with fields: repo_url, live_url, server_host,
--     service_version, service_status, docs_url, stack
--   * A custom panel layout: Properties -> Service Dashboard -> Document -> Links
--   * The "service-dashboard" panel section is rendered by a custom component
--     registered in the host app
-- ============================================================================

INSERT INTO packages (
  slug,
  version,
  display_name,
  description,
  author_id,
  is_public,
  is_verified,
  tags,
  definition
) VALUES (
  'service',
  '1.0.0',
  'Service / Infrastructure',
  'Track and monitor services, APIs, and infrastructure components. View GitHub repo status, deployment info, server access, and documentation in one place.',
  NULL, -- official Synap package (no author)
  true,
  true,
  ARRAY['devops', 'infrastructure', 'monitoring', 'service-catalog'],
  '{
    "profiles": [
      {
        "slug": "service",
        "displayName": "Service",
        "scope": "workspace",
        "uiHints": {
          "icon": "Server",
          "color": "#3b82f6",
          "description": "A service, API, or infrastructure component",
          "panelConfig": {
            "autoProvisionDocument": false,
            "defaultSection": "properties",
            "sections": [
              { "type": "properties", "label": "Overview" },
              { "type": "service-dashboard", "label": "Dashboard", "config": {} },
              { "type": "document", "label": "Notes" },
              { "type": "links", "label": "Related" }
            ]
          }
        },
        "propertyDefs": [
          {
            "slug": "repo_url",
            "valueType": "string",
            "required": false,
            "displayOrder": 1,
            "constraints": { "format": "uri" },
            "uiHints": {
              "label": "Repository",
              "icon": "Github",
              "placeholder": "https://github.com/org/repo",
              "inputType": "url"
            }
          },
          {
            "slug": "live_url",
            "valueType": "string",
            "required": false,
            "displayOrder": 2,
            "constraints": { "format": "uri" },
            "uiHints": {
              "label": "Live URL",
              "icon": "Globe",
              "placeholder": "https://api.example.com",
              "inputType": "url"
            }
          },
          {
            "slug": "server_host",
            "valueType": "string",
            "required": false,
            "displayOrder": 3,
            "uiHints": {
              "label": "Server",
              "icon": "Server",
              "placeholder": "root@195.x.x.x",
              "helpText": "SSH target for terminal access",
              "inputType": "text"
            }
          },
          {
            "slug": "service_status",
            "valueType": "string",
            "required": false,
            "displayOrder": 4,
            "defaultValue": "unknown",
            "constraints": {
              "enum": ["live", "staging", "down", "maintenance", "unknown"]
            },
            "uiHints": {
              "label": "Status",
              "icon": "Activity",
              "inputType": "select",
              "color": "#22c55e"
            }
          },
          {
            "slug": "service_version",
            "valueType": "string",
            "required": false,
            "displayOrder": 5,
            "uiHints": {
              "label": "Version",
              "icon": "Tag",
              "placeholder": "1.0.0",
              "inputType": "text"
            }
          },
          {
            "slug": "docs_url",
            "valueType": "string",
            "required": false,
            "displayOrder": 6,
            "constraints": { "format": "uri" },
            "uiHints": {
              "label": "Documentation",
              "icon": "BookOpen",
              "placeholder": "https://docs.example.com",
              "inputType": "url"
            }
          },
          {
            "slug": "stack",
            "valueType": "string",
            "required": false,
            "displayOrder": 7,
            "uiHints": {
              "label": "Stack",
              "icon": "Layers",
              "placeholder": "Next.js + Hono + Postgres",
              "helpText": "Tech stack summary",
              "inputType": "text"
            }
          }
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (slug, version, COALESCE(author_id, '__synap_official__'))
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  definition = EXCLUDED.definition,
  tags = EXCLUDED.tags,
  is_public = EXCLUDED.is_public,
  is_verified = EXCLUDED.is_verified,
  updated_at = now();
