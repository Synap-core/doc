#!/usr/bin/env bash
# Full documentation import across all Synap repos.
# Organized into 6 Fumadocs spaces.
# Run from repo root: bash scripts/import-all.sh

set -euo pipefail

SYNAP=/Users/antoine/Documents/Code/synap
CONTENT=./content/docs

# ─── Helpers ──────────────────────────────────────────────────────────────────

add_frontmatter() {
  local file="$1" title="$2" description="${3:-}"
  if head -1 "$file" | grep -q "^---"; then return; fi
  local tmp; tmp=$(mktemp)
  { echo "---"
    echo "title: \"$(echo "$title" | sed 's/"/\\"/g')\""
    [[ -n "$description" ]] && echo "description: \"$(echo "$description" | sed 's/"/\\"/g')\""
    echo "---"
    echo ""
    cat "$file"
  } > "$tmp" && mv "$tmp" "$file"
}

import() {
  local src="$1" dest="$2" title="$3" desc="${4:-}"
  if [[ ! -f "$src" ]]; then echo "  ⚠  missing: $src"; return; fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  add_frontmatter "$dest" "$title" "$desc"
  # Fix bare <N patterns that MDX misreads as JSX tags
  sed -i '' 's/<\([0-9]\)/\&lt;\1/g' "$dest" 2>/dev/null || true
  echo "  ✓  $dest"
}

stub() {
  local file="$1" title="$2" desc="${3:-}"
  mkdir -p "$(dirname "$file")"
  [[ -f "$file" ]] && return   # don't overwrite real content
  { echo "---"
    echo "title: \"$(echo "$title" | sed 's/"/\\"/g')\""
    [[ -n "$desc" ]] && echo "description: \"$(echo "$desc" | sed 's/"/\\"/g')\""
    echo "---"
    echo ""
    echo "# $title"
    echo ""
    [[ -n "$desc" ]] && echo "> $desc"
    echo ""
    echo "> Work in progress."
  } > "$file"
  echo "  ~ stub: $file"
}

echo ""
echo "═══════════════════════════════════════════════════════"
echo " Synap Team Docs — Full Import"
echo "═══════════════════════════════════════════════════════"

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 1: HOME  (vision, product, big picture)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 1: Home ─────────────────────────────────────"

# North star & strategy
import "$SYNAP/docs-internal/north-star/Synap North Star.md" \
  "$CONTENT/home/north-star.mdx" "North Star" "Synap's product vision, philosophy, and emergent complexity model."

import "$SYNAP/docs-internal/north-star/analysis-and-options.md" \
  "$CONTENT/home/analysis.mdx" "Strategic Analysis" "Market analysis and strategic options."

import "$SYNAP/docs-internal/north-star/market-campain.md" \
  "$CONTENT/home/market.mdx" "Market & Campaign" "Go-to-market strategy and positioning."

import "$SYNAP/docs-internal/north-star/openclaw-connection.md" \
  "$CONTENT/home/openclaw-strategy.mdx" "OpenClaw Strategy" "How OpenClaw connects to Synap's broader strategy."

import "$SYNAP/docs-internal/north-star/openclaw-state-what-it-implies.md" \
  "$CONTENT/home/openclaw-state.mdx" "OpenClaw State & Implications" "Current OpenClaw ecosystem state and implications."

import "$SYNAP/docs-internal/north-star/openclaw-ecosystem-research.md" \
  "$CONTENT/home/openclaw-research.mdx" "OpenClaw Ecosystem Research" "Research into the OpenClaw ecosystem and integration opportunities."

# Product vision — `users-docs/` removed (2026-04-14). Edit team MDX directly:
#   $CONTENT/home/vision.mdx
#   $CONTENT/home/strategy-vision.mdx
#   $CONTENT/home/roadmap.mdx
#   $CONTENT/home/product-overview.mdx
# Public counterparts live under synap-team-docs/content/docs/start/

import "$SYNAP/docs-internal/DEV-PLAN.md" \
  "$CONTENT/home/dev-plan.mdx" "Development Plan" "Current development plan and sprint focus."

import "$SYNAP/docs-internal/synap-design-brief.md" \
  "$CONTENT/home/design-brief.mdx" "Design Brief" "Synap brand and design philosophy."

import "$SYNAP/docs-internal/visual-assets-brief.md" \
  "$CONTENT/home/visual-assets.mdx" "Visual Assets" "Visual asset guidelines and requirements."

import "$SYNAP/docs-internal/token-pricing-plan.md" \
  "$CONTENT/home/pricing.mdx" "Pricing Plan" "Token and subscription pricing strategy."

import "$SYNAP/docs-internal/pre-launch-checklist.md" \
  "$CONTENT/home/pre-launch.mdx" "Pre-Launch Checklist" "Ordered launch sequence across all tracks."

import "$SYNAP/docs-internal/browser-release-strategy.md" \
  "$CONTENT/home/release-strategy.mdx" "Release Strategy" "Browser and app release strategy."

import "$SYNAP/docs-internal/browser-release-checklist.md" \
  "$CONTENT/home/release-checklist.mdx" "Release Checklist" "Pre-release verification checklist."

import "$SYNAP/docs-internal/landing-page-audit-2026-03.md" \
  "$CONTENT/home/landing-audit.mdx" "Landing Page Audit" "Landing page audit findings and gaps."

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 2: PLATFORM  (backend, data model, architecture, frontend)
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 2: Platform ─────────────────────────────────"

# Backend core architecture — sources under synap-backend/docs/*.md were retired (2026-04-13).
# Edit canonical pages: synap-team-docs/content/team/platform/*.mdx

import "$SYNAP/synap-backend/packages/hub-protocol/README.md" \
  "$CONTENT/platform/hub-protocol.mdx" "Hub Protocol" "Hub Protocol package: 76+ REST endpoints for IS↔Backend."

import "$SYNAP/synap-backend/packages/database/MIGRATIONS.md" \
  "$CONTENT/platform/migrations.mdx" "Migration System" "Strict migration rules, numbered SQL files, schema coherence."

# docs-internal architecture
import "$SYNAP/docs-internal/PROPERTY-DEF-SCOPING.md" \
  "$CONTENT/platform/property-def-scoping.mdx" "Property Def Scoping" "Three-layer property scope: global, profile-base, workspace-overlay."

import "$SYNAP/docs-internal/ENTITY-RELATIONS.md" \
  "$CONTENT/platform/entity-relations.mdx" "Entity Relations" "Entity relationships, profile inheritance, relation model."

import "$SYNAP/docs-internal/AUTH-ARCHITECTURE.md" \
  "$CONTENT/platform/auth-architecture.mdx" "Auth Architecture" "Auth consolidation: Better Auth, API keys, CLI tokens."

import "$SYNAP/docs-internal/IMPORT-ARCHITECTURE.md" \
  "$CONTENT/platform/import-pipeline.mdx" "Import Pipeline" "Source map, parser packages, dedup strategies, EntityUpsertService."

import "$SYNAP/docs-internal/CAPTURE-PIPELINE.md" \
  "$CONTENT/platform/capture-pipeline.mdx" "Capture Pipeline" "Unified AI capture pipeline across 7 surfaces."

import "$SYNAP/docs-internal/EVENT-CHAIN.md" \
  "$CONTENT/platform/event-chain-internal.mdx" "Event Chain (Internal)" "Internal event chain spec — typed registry, delivery router."

import "$SYNAP/docs-internal/CREATING-APPS.md" \
  "$CONTENT/platform/creating-apps.mdx" "Creating Apps" "How to create new Browser modules and Expo apps."

import "$SYNAP/docs-internal/server-model-architecture.md" \
  "$CONTENT/platform/server-model.mdx" "Server Model" "Multi-server architecture: CP, IS, pods, shared pod model."

import "$SYNAP/docs-internal/provisioning-paths.md" \
  "$CONTENT/platform/provisioning-paths.mdx" "Provisioning Paths" "All pod provisioning paths: standard, warm pool, self-hosted."

import "$SYNAP/docs-internal/cross-pod-sharing.md" \
  "$CONTENT/platform/cross-pod-sharing.mdx" "Cross-Pod Sharing" "Sharing entities and data across pod boundaries."

import "$SYNAP/docs-internal/external-integration-design.md" \
  "$CONTENT/platform/external-integrations.mdx" "External Integrations" "External service integration design: Nango, webhooks, APIs."

import "$SYNAP/docs-internal/external-api-next-steps.md" \
  "$CONTENT/platform/external-api.mdx" "External API" "External API next steps and design decisions."

# Feed system
import "$SYNAP/docs-internal/FEED-SYSTEM.md" \
  "$CONTENT/platform/feed-system.mdx" "Feed System" "3-surface feed model: personal chat, proactive feed, notifications."

import "$SYNAP/docs-internal/SIGNAL-FEED-ARCHITECTURE.md" \
  "$CONTENT/platform/signal-feed-architecture.mdx" "Signal Feed Architecture" "RSSHub integration, feed classification, signal processing pipeline."

import "$SYNAP/docs-internal/SIGNAL-FEED-IMPLEMENTATION.md" \
  "$CONTENT/platform/signal-feed-impl.mdx" "Signal Feed Implementation" "Signal feed implementation guide and pipeline details."

import "$SYNAP/docs-internal/UNIFIED-FEED-ARCHITECTURE.md" \
  "$CONTENT/platform/unified-feed.mdx" "Unified Feed Architecture" "Unified feed architecture across all surfaces."

import "$SYNAP/docs-internal/FEED_ARCHITECTURE_ANALYSIS.md" \
  "$CONTENT/platform/feed-analysis.mdx" "Feed Architecture Analysis" "Analysis of feed architecture trade-offs and decisions."

import "$SYNAP/docs-internal/SIGNAL-FEED-AI-CLASSIFICATION.md" \
  "$CONTENT/platform/signal-feed-ai.mdx" "Signal Feed AI Classification" "AI-powered feed item classification and enrichment."

# Chat & channels
import "$SYNAP/docs-internal/CHAT-CORE-EXTRACTION-PLAN.md" \
  "$CONTENT/platform/chat-core.mdx" "Chat Core Extraction" "Plan to extract chat into @synap-core/chat-core package."

import "$SYNAP/docs-internal/CHAT_ARCHITECTURE_UNIFICATION.md" \
  "$CONTENT/platform/chat-architecture.mdx" "Chat Architecture" "Chat architecture unification across surfaces."

import "$SYNAP/docs-internal/NATIVE_CHAT_DESIGN_SPEC.md" \
  "$CONTENT/platform/native-chat.mdx" "Native Chat Design" "Native chat design spec for Relay and iOS/Android."

# OpenClaw skill
import "$SYNAP/synap-backend/skills/synap/SKILL.md" \
  "$CONTENT/platform/openclaw-skill.mdx" "OpenClaw Synap Skill" "Unified synap skill for OpenClaw: knowledge graph, message relay, A2AI."

import "$SYNAP/synap-backend/skills/synap/README.md" \
  "$CONTENT/platform/openclaw-skill-readme.mdx" "OpenClaw Skill Setup" "How to install and configure the synap OpenClaw skill."

import "$SYNAP/docs-internal/openclaw-channel-interactions.md" \
  "$CONTENT/platform/openclaw-channels.mdx" "OpenClaw Channel Interactions" "How OpenClaw agents interact through Synap channels."

import "$SYNAP/docs-internal/openclaw-integration-state.md" \
  "$CONTENT/platform/openclaw-integration.mdx" "OpenClaw Integration State" "Current OpenClaw integration status and next steps."

# Platform review
import "$SYNAP/docs-internal/platform-review/00-overview.md" \
  "$CONTENT/platform/review-overview.mdx" "Platform Review Overview" "Platform completeness review across all feature areas."

import "$SYNAP/docs-internal/platform-review/01-widgets.md" \
  "$CONTENT/platform/review-widgets.mdx" "Platform Review: Widgets" "Widget system completeness and gaps."

import "$SYNAP/docs-internal/platform-review/02-entity-profiles.md" \
  "$CONTENT/platform/review-entity-profiles.mdx" "Platform Review: Entity Profiles" "Entity profile system completeness and gaps."

import "$SYNAP/docs-internal/platform-review/03-templates.md" \
  "$CONTENT/platform/review-templates.mdx" "Platform Review: Templates" "Template system completeness and composable packs."

import "$SYNAP/docs-internal/platform-review/04-terminal-bridge.md" \
  "$CONTENT/platform/review-terminal.mdx" "Platform Review: Terminal Bridge" "Terminal bridge / CLI integration review."

import "$SYNAP/docs-internal/platform-review/05-notifications.md" \
  "$CONTENT/platform/review-notifications.mdx" "Platform Review: Notifications" "Notification system completeness."

import "$SYNAP/docs-internal/platform-review/06-skills.md" \
  "$CONTENT/platform/review-skills.mdx" "Platform Review: Skills" "Skills system completeness and gaps."

import "$SYNAP/docs-internal/platform-review/07-vault-ai.md" \
  "$CONTENT/platform/review-vault-ai.mdx" "Platform Review: Vault & AI" "Vault and AI integration review."

import "$SYNAP/docs-internal/platform-review/SYSTEM-COMPLETION.md" \
  "$CONTENT/platform/system-completion.mdx" "System Completion Status" "Overall platform system completion tracking."

# Design system
import "$SYNAP/docs-internal/DESIGN-SYSTEM-AUDIT.md" \
  "$CONTENT/platform/design-system-audit.mdx" "Design System Audit" "Design system coherence audit: tokens, components, patterns."

import "$SYNAP/docs-internal/FLOATING-CONTAINER-SYSTEM.md" \
  "$CONTENT/platform/floating-containers.mdx" "Floating Container System" "Floating menus, panels, and container system design."

import "$SYNAP/docs-internal/HOLD-MENU-IMPLEMENTATION.md" \
  "$CONTENT/platform/hold-menu.mdx" "Hold Menu Implementation" "Hold/long-press menu implementation for mobile and desktop."

import "$SYNAP/synap-app/packages/core/ui-system/DESIGN_GUIDELINES.md" \
  "$CONTENT/platform/design-guidelines.mdx" "Design Guidelines" "UI system design guidelines: tokens, spacing, colors."

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 3: INTELLIGENCE SERVICE
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 3: Intelligence Service ─────────────────────"

import "$SYNAP/synap-intelligence-service/ARCHITECTURE.md" \
  "$CONTENT/intelligence/architecture.mdx" "IS Architecture" "Full Intelligence Service architecture: agents, Hub Protocol, Swarm."

import "$SYNAP/synap-intelligence-service/INTELLIGENCE_HUB.md" \
  "$CONTENT/intelligence/hub.mdx" "Intelligence Hub" "Hub design, routing, agent dispatch, session management."

import "$SYNAP/synap-intelligence-service/INTERNAL_API.md" \
  "$CONTENT/intelligence/internal-api.mdx" "Internal API" "IS internal REST API — all endpoints, auth, request/response shapes."

import "$SYNAP/synap-intelligence-service/ROADMAP.md" \
  "$CONTENT/intelligence/roadmap.mdx" "IS Roadmap" "Intelligence Service roadmap and upcoming features."

# IS deep docs (agent system, contract, streaming, SDK, pricing, external agents): edit
#   synap-team-docs/content/team/intelligence/*.mdx — sources under synap-intelligence-service/docs/ were retired.

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/agents/README.md" \
  "$CONTENT/intelligence/agents-readme.mdx" "Agents README" "Agent implementation guide and registry patterns."

import "$SYNAP/synap-intelligence-service/apps/monitor/src/inline-help/agents.md" \
  "$CONTENT/intelligence/monitor-agents.mdx" "Monitor: Agents" "Agent monitoring dashboard — what data is shown and why."

import "$SYNAP/synap-intelligence-service/apps/monitor/src/inline-help/execution-cycles.md" \
  "$CONTENT/intelligence/monitor-execution.mdx" "Monitor: Execution Cycles" "Execution cycle tracking and visualization."

import "$SYNAP/synap-intelligence-service/apps/monitor/src/inline-help/memory.md" \
  "$CONTENT/intelligence/monitor-memory.mdx" "Monitor: Memory" "Session memory monitoring and inspection."

import "$SYNAP/synap-intelligence-service/apps/monitor/src/inline-help/skills.md" \
  "$CONTENT/intelligence/monitor-skills.mdx" "Monitor: Skills" "Skills monitoring — loaded skills, invocations, errors."

import "$SYNAP/synap-intelligence-service/apps/monitor/src/inline-help/tools.md" \
  "$CONTENT/intelligence/monitor-tools.mdx" "Monitor: Tools" "Tool monitoring — registered tools, usage, errors."

import "$SYNAP/synap-intelligence-service/deploy/DEPLOYMENT.md" \
  "$CONTENT/intelligence/deployment.mdx" "IS Deployment" "Docker Swarm deployment guide: Traefik, replicas, autoscaler."

import "$SYNAP/synap-intelligence-service/deploy/OPERATIONS.md" \
  "$CONTENT/intelligence/operations.mdx" "IS Operations" "Day-to-day operations: update, scale, logs, alerts."

import "$SYNAP/synap-intelligence-service/deploy/LITELLM_MIGRATION.md" \
  "$CONTENT/intelligence/litellm-migration.mdx" "LiteLLM Migration" "Migration guide from direct provider calls to LiteLLM."

import "$SYNAP/synap-intelligence-service/packages/agent-sdk/README.md" \
  "$CONTENT/intelligence/sdk-readme.mdx" "Agent SDK README" "Getting started with the @synap/agent-sdk package."

import "$SYNAP/docs-internal/INTELLIGENCE-SERVICE.md" \
  "$CONTENT/intelligence/overview-internal.mdx" "IS Overview (Internal)" "Internal intelligence service overview and design notes."

# IS Skills documentation
import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/hub-protocol.md" \
  "$CONTENT/intelligence/skill-hub-protocol.mdx" "Skill: Hub Protocol" "Hub Protocol skill file — how IS accesses backend data."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/entity-management.md" \
  "$CONTENT/intelligence/skill-entities.mdx" "Skill: Entity Management" "Entity create/read/update skill guidance for agents."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/automations.md" \
  "$CONTENT/intelligence/skill-automations.mdx" "Skill: Automations" "Automation skill — how agents trigger and manage automations."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/document-management.md" \
  "$CONTENT/intelligence/skill-documents.mdx" "Skill: Document Management" "Document skill — AI-assisted document editing and creation."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/propose-workspace.md" \
  "$CONTENT/intelligence/skill-workspace.mdx" "Skill: Propose Workspace" "Workspace proposal skill — AI-driven space creation."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/workspace-views.md" \
  "$CONTENT/intelligence/skill-views.mdx" "Skill: Workspace Views" "View management skill — querying and manipulating views."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/native-widget.md" \
  "$CONTENT/intelligence/skill-widgets.mdx" "Skill: Native Widgets" "AI widget creation and composition skill."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/view-types/bento.md" \
  "$CONTENT/intelligence/view-bento.mdx" "View Type: Bento" "Bento grid view — how agents compose bento dashboards."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/view-types/kanban.md" \
  "$CONTENT/intelligence/view-kanban.mdx" "View Type: Kanban" "Kanban view skill guidance."

import "$SYNAP/synap-intelligence-service/apps/intelligence-hub/src/skills/view-types/flow.md" \
  "$CONTENT/intelligence/view-flow.mdx" "View Type: Flow" "Flow/graph view skill guidance."

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 4: CONTROL PLANE
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 4: Control Plane ────────────────────────────"

# Control Plane markdown under synap-control-plane-api/docs/ was retired — edit
#   synap-team-docs/content/team/control-plane/*.mdx as the single source of truth.

# Backend deployment (pod-side ops)
import "$SYNAP/synap-backend/deploy/DEPLOYMENT_STRATEGIES.md" \
  "$CONTENT/control-plane/pod-deploy-strategies.mdx" "Pod Deployment Strategies" "Deployment strategy options for self-hosted data pods."

import "$SYNAP/synap-backend/deploy/docs/installation.md" \
  "$CONTENT/control-plane/pod-install.mdx" "Pod Installation" "Step-by-step pod installation guide."

import "$SYNAP/synap-backend/deploy/docs/configuration.md" \
  "$CONTENT/control-plane/pod-config.mdx" "Pod Configuration" "All pod configuration options and environment variables."

import "$SYNAP/synap-backend/deploy/docs/BUILD_ON_SERVER.md" \
  "$CONTENT/control-plane/pod-build-server.mdx" "Build on Server" "Building pod Docker images directly on server."

import "$SYNAP/synap-backend/deploy/docs/SECURITY.md" \
  "$CONTENT/control-plane/pod-security.mdx" "Pod Security" "Pod security hardening guide."

import "$SYNAP/synap-backend/deploy/docs/backups.md" \
  "$CONTENT/control-plane/pod-backups.mdx" "Pod Backups" "Database backup and restore procedures."

import "$SYNAP/synap-backend/deploy/docs/troubleshooting.md" \
  "$CONTENT/control-plane/pod-troubleshooting.mdx" "Pod Troubleshooting" "Common pod issues and debugging steps."

# Incident / SLO / deploy checklist — edit synap-team-docs/content/team/control-plane/*.mdx (sources retired).

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 5: RELAY & NATIVE
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 5: Relay & Native ───────────────────────────"

import "$SYNAP/docs-internal/relay/ARCHITECTURE.md" \
  "$CONTENT/relay/architecture.mdx" "Relay Architecture" "3-surface feed model, data flow, store structure."

import "$SYNAP/docs-internal/relay/DESIGN.md" \
  "$CONTENT/relay/design.mdx" "Relay Design" "UX design principles and visual design for Relay."

import "$SYNAP/docs-internal/relay/USER-FLOWS.md" \
  "$CONTENT/relay/user-flows.mdx" "User Flows" "Capture flow, morning flow, space switcher, onboarding."

import "$SYNAP/docs-internal/relay/USER-STORIES.md" \
  "$CONTENT/relay/user-stories.mdx" "User Stories" "Relay user stories and acceptance criteria."

import "$SYNAP/docs-internal/relay/PAGES.md" \
  "$CONTENT/relay/pages.mdx" "Pages" "Relay screen inventory and navigation structure."

import "$SYNAP/docs-internal/relay/IMPLEMENTATION-PLAN.md" \
  "$CONTENT/relay/implementation.mdx" "Implementation Plan" "Relay implementation plan, phases, and milestones."

import "$SYNAP/docs-internal/relay/INTEGRATION-PLAN.md" \
  "$CONTENT/relay/integration.mdx" "Integration Plan" "Relay integration plan with backend, IS, and native OS."

import "$SYNAP/docs-internal/RELAY-NEXT-GEN-CAPABILITIES.md" \
  "$CONTENT/relay/next-gen.mdx" "Next-Gen Capabilities" "Next generation Relay capabilities and features."

# Native OS
import "$SYNAP/docs-internal/NATIVE-OS-GUIDE.md" \
  "$CONTENT/relay/native-os-guide.mdx" "Native OS Guide" "@synap-core/native-os — 7 sub-packages implementation guide."

import "$SYNAP/docs-internal/NATIVE-OS-UX-PLAN.md" \
  "$CONTENT/relay/native-os-ux.mdx" "Native OS UX Plan" "UX plan for share, spotlight, widgets, live activities."

import "$SYNAP/docs-internal/NATIVE-OS-DEFERRED.md" \
  "$CONTENT/relay/native-os-deferred.mdx" "Native OS Deferred" "D1-D11 deferred items and Q1-Q5 open questions."

import "$SYNAP/docs-internal/NEXT-GEN-IOS-PLAN.md" \
  "$CONTENT/relay/ios-plan.mdx" "iOS Plan" "Next-gen iOS implementation plan."

import "$SYNAP/docs-internal/NEXT-GEN-ANDROID-PLAN.md" \
  "$CONTENT/relay/android-plan.mdx" "Android Plan" "Next-gen Android implementation plan."

import "$SYNAP/docs-internal/NEXT-GEN-SHIP-PLAN.md" \
  "$CONTENT/relay/ship-plan.mdx" "Ship Plan" "Ship plan for mobile apps — App Store, Play Store."

# ──────────────────────────────────────────────────────────────────────────────
# SPACE 6: ONBOARDING & DEVOPS
# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo "── Space 6: Onboarding & DevOps ──────────────────────"

# Developer onboarding — synap-backend/docs/development/*.md retired; edit synap-team-docs/content/team/devops/*.mdx

import "$SYNAP/docs-internal/auth-consolidation-audit.md" \
  "$CONTENT/devops/auth-audit.mdx" "Auth Consolidation Audit" "Auth system audit across all surfaces."

import "$SYNAP/docs-internal/backlink-strategy.md" \
  "$CONTENT/devops/backlink-strategy.mdx" "Backlink Strategy" "Internal link graph and cross-repo documentation strategy."

echo ""
echo "═══════════════════════════════════════════════════════"
echo " Import complete."
echo " → Run: npm run build"
echo "═══════════════════════════════════════════════════════"
