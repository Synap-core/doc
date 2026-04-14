#!/usr/bin/env bash
# Import existing documentation from various repos into content/docs/
# Usage: bash scripts/import-docs.sh
# Run from repo root: /Users/antoine/Documents/Code/synap/synap-team-docs/

set -euo pipefail

SYNAP=/Users/antoine/Documents/Code/synap
CONTENT=./content/docs

# ─── Helper: add frontmatter if missing ──────────────────────────────────────
add_frontmatter() {
  local file="$1"
  local title="$2"
  local description="${3:-}"

  # If file already starts with ---, frontmatter exists — skip
  if head -1 "$file" | grep -q "^---"; then
    return
  fi

  # Prepend frontmatter
  local tmp
  tmp=$(mktemp)
  {
    echo "---"
    echo "title: $title"
    [[ -n "$description" ]] && echo "description: $description"
    echo "---"
    echo ""
    cat "$file"
  } > "$tmp"
  mv "$tmp" "$file"
}

# ─── Helper: copy and rename md → mdx with frontmatter ───────────────────────
import() {
  local src="$1"
  local dest="$2"
  local title="$3"
  local description="${4:-}"

  if [[ ! -f "$src" ]]; then
    echo "⚠  Missing: $src"
    return
  fi

  cp "$src" "$dest"
  add_frontmatter "$dest" "$title" "$description"
  echo "✓  $dest"
}

echo ""
echo "── Control Plane ─────────────────────────────────────────────────────────"
echo "  (skipped) synap-control-plane-api/docs/*.md retired — edit synap-team-docs/content/team/control-plane/*.mdx"

echo ""
echo "── docs-internal ─────────────────────────────────────────────────────────"

INTERNAL="$SYNAP/docs-internal"

# Backend
for pair in \
  "PROPERTY-DEF-SCOPING.md:backend/property-def-scoping.mdx:Property Def Scoping:Three-layer workspace overlay system for property definitions." \
  "FEED-SYSTEM.md:backend/feed-system.mdx:Feed System:3-surface feed model — personal chat, proactive feed, notifications." \
  "CHAT-CORE-EXTRACTION-PLAN.md:backend/channel-system.mdx:Channel System:Channel types, scope dimensions, and chat core extraction plan." \
  "IMPORT-ARCHITECTURE.md:backend/import-pipeline.mdx:Import Pipeline:Source map, parser packages, dedup strategies." \
  "CAPTURE-PIPELINE.md:backend/capture-pipeline.mdx:Capture Pipeline:Unified AI capture pipeline across 7 surfaces." \
  "CREATING-APPS.md:backend/hub-protocol-rest.mdx:Creating Apps:How to create new Browser modules and Expo apps reusing Synap packages." \
  "ENTITY-RELATIONS.md:backend/entity-creation.mdx:Entity Relations:Entity relationships, profile inheritance, dedup strategies." \
  "EVENT-CHAIN.md:backend/automation-system.mdx:Event Chain:Typed event registry, delivery router, automation triggers." \
  "INTELLIGENCE-SERVICE.md:intelligence-service/architecture.mdx:IS Architecture:OrchestratorAgent + PersonaAgent, Hub Protocol, session memory, skills." \
  "NATIVE-OS-GUIDE.md:native/native-os-guide.mdx:Native OS Guide:Implementation guide for @synap-core/native-os sub-packages." \
  "NATIVE-OS-DEFERRED.md:native/deferred.mdx:Native OS Deferred:D1-D11 follow-up items and Q1-Q5 open questions." \
  "NATIVE-OS-UX-PLAN.md:native/widgets.mdx:Native OS UX Plan:UX design for share, spotlight, widgets, live activities." \
  "SIGNAL-FEED-ARCHITECTURE.md:platform/connectors.mdx:Signal Feed Architecture:RSSHub integration, feed classification, signal processing pipeline."
do
  IFS=: read -r src_name dest_name title desc <<< "$pair"
  import "$INTERNAL/$src_name" "$CONTENT/$dest_name" "$title" "$desc"
done

# Relay sub-folder
echo ""
echo "── docs-internal/relay ───────────────────────────────────────────────────"
if [[ -d "$INTERNAL/relay" ]]; then
  ls "$INTERNAL/relay/"
  for pair in \
    "architecture.md:relay/architecture.mdx:Relay Architecture:3-surface feed model, data flow, store structure." \
    "user-flows.md:relay/automation-templates.mdx:Relay User Flows:Capture flow, morning flow, space switcher, automation templates."
  do
    IFS=: read -r src_name dest_name title desc <<< "$pair"
    import "$INTERNAL/relay/$src_name" "$CONTENT/$dest_name" "$title" "$desc"
  done
fi

# North Star sub-folder
echo ""
echo "── docs-internal/north-star ──────────────────────────────────────────────"
if [[ -d "$INTERNAL/north-star" ]]; then
  for f in "$INTERNAL/north-star/"*.md; do
    echo "  found: $f"
  done
  import "$INTERNAL/north-star/Synap North Star.md" "$CONTENT/north-star/vision.mdx" "Vision & Strategy" "Synap North Star — emergent complexity, two entry points, product philosophy." 2>/dev/null || true
fi

echo ""
echo "✓ Import complete. Run: npm run dev"
