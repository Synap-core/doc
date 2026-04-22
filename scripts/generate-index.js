/**
 * Auto-generates DOC-INDEX.md from frontmatter in every content/*.mdx file.
 *
 * Run: `node scripts/generate-index.js`
 *
 * Output: synap-team-docs/docs/DOC-INDEX.md
 *   - Topic cluster: pages grouped by subject area
 *   - Per-page: title, description, last_updated, audience, tags
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..', 'content');
const OUTPUT = path.resolve(__dirname, '..', 'docs', 'DOC-INDEX.md');

const BK = '`';

// ---------------------------------------------------------------------------
// Parse frontmatter from Markdown
// ---------------------------------------------------------------------------

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;

  const raw = match[1];
  const obj = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2];
    if (val.startsWith('[')) {
      // Handle YAML-style arrays: [a, b, c] and ["a", "b", "c"]
      const inner = val.slice(1, -1).trim();
      if (inner === '') {
        obj[key] = [];
      } else {
        const items = inner.split(',').map(function(s) {
          return s.replace(/^["']|["']$/g, '').trim();
        }).filter(Boolean);
        obj[key] = items.length === 1 ? items[0] : items;
      }
    } else {
      obj[key] = val.replace(/"/g, '').trim();
    }
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Collect all docs
// ---------------------------------------------------------------------------

function walk(dir, relativeBase) {
  if (!relativeBase) relativeBase = 'content';
  const entries = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, dirent.name);
    const rel = relativeBase + '/' + dirent.name;
    const name = dirent.name;
    if (name.endsWith('.mdx') || name.endsWith('.md')) {
      const source = fs.readFileSync(fullPath, 'utf8');
      const fm = parseFrontmatter(source);
      entries.push({
        path: rel,
        title: fm ? (fm.title || name) : name,
        description: fm ? (fm.description || '') : '',
        section: fm ? (fm.section || '') : '',
        audience: fm ? (fm.audience || 'users') : 'users',
        tags: fm ? (fm.tags || []) : [],
        last_updated: fm ? (fm.last_updated || '') : '',
        version: fm ? (fm.version || '') : '',
        toc: fm ? (fm.toc || '') : '',
      });
    } else if (fs.statSync(fullPath).isDirectory()) {
      entries.push(...walk(fullPath, rel));
    }
  }
  return entries;
}

const allDocs = walk(ROOT).sort((a, b) => a.path.localeCompare(b.path));

// ---------------------------------------------------------------------------
// Derive "topic clusters" from the path structure
// Ordered by purpose, then by user intent (not file paths).
// Find() returns first match, so specific patterns come before general ones.
// ---------------------------------------------------------------------------

// Public docs — grouped by what the reader is trying to do
const GROUPS = [
  // === PUBLIC DOCS ===
  { pattern: /^content\/docs\/start\/getting-started\//, label: 'Getting Started',              icon: 'rocket' },
  { pattern: /^content\/docs\/start\//,                  label: 'Getting Started',              icon: 'rocket' },
  { pattern: /^content\/docs\/start\/concepts\//,         label: 'Core Product Concepts',        icon: 'lightbulb' },
  { pattern: /^content\/docs\/architecture\/concepts\//,  label: 'Architecture Concepts',        icon: 'layout' },
  { pattern: /^content\/docs\/architecture\/deployment\//, label: 'Deployment',                  icon: 'server' },
  { pattern: /^content\/docs\/architecture\/security\//,  label: 'Security',                    icon: 'shield' },
  { pattern: /^content\/docs\/architecture\/components\//, label: 'System Components',          icon: 'cpu' },
  { pattern: /^content\/docs\/architecture\/events\//,    label: 'Event System',               icon: 'zap' },
  { pattern: /^content\/docs\/architecture\//,            label: 'Architecture Overview',       icon: 'network' },
  { pattern: /^content\/docs\/integrate\/agents\/connect\//,  label: 'Agent Connect Guides',     icon: 'link-2' },
  { pattern: /^content\/docs\/integrate\/reference\//,       label: 'API Reference',            icon: 'book' },
  { pattern: /^content\/docs\/integrate\/integrations\//,    label: 'Integration How-To',       icon: 'puzzle' },
  { pattern: /^content\/docs\/integrate\/development\//,     label: 'Development Guide',        icon: 'terminal' },
  { pattern: /^content\/docs\/integrate\/agents\//,          label: 'Agent Integration',        icon: 'bot' },
  { pattern: /^content\/docs\/integrate\//,                  label: 'Integration',              icon: 'puzzle' },
  { pattern: /^content\/docs\/api\//,                        label: 'API Docs',                 icon: 'file-json' },
  { pattern: /^content\/docs\/contributing\/guides\//,       label: 'Contribution Guides',      icon: 'wrench' },
  { pattern: /^content\/docs\/contributing\//,               label: 'Contributing Overview',    icon: 'heart' },
  { pattern: /^content\/docs\/cloud\//,                      label: 'Cloud & SaaS',             icon: 'cloud' },

// === TEAM FEATURES (root-level overview pages) ===
  { pattern: /^content\/team\/features\//,            label: 'Features Index',     icon: 'grid' },

// === PLATFORM ENGINEERING — file prefix patterns ===
  { pattern: /^content\/team\/platform\/(channel|chat|signal|feed|unified|hub-protocol|notifications|realtime|connectors)/,
    label: 'Communication & Feeds',    icon: 'message-square' },
  { pattern: /^content\/team\/platform\/(auth|permissions|security|trusted-issuers|api-keys)/,
    label: 'Auth & Security',          icon: 'shield-check' },
  { pattern: /^content\/team\/platform\/(entity|property|views|cell)/,
    label: 'Entity & View System',     icon: 'database' },
  { pattern: /^content\/team\/platform\/(event|migrations|server)/,
    label: 'Event Chain & Data Tier',  icon: 'layers' },
  { pattern: /^content\/team\/platform\/(pod-to|cross-pod|provisioning|import|file)/,
    label: 'Data Sync & Import',       icon: 'download-cloud' },
  { pattern: /^content\/team\/platform\/(openclaw|ai-|session)/,
    label: 'OpenClaw & AI Integration', icon: 'bot' },
  { pattern: /^content\/team\/platform\/(onboarding|design|review|s-tier|teamdoc)/,
    label: 'Process & Reviews',        icon: 'clipboard-check' },
  { pattern: /^content\/team\/platform\/(capture|golden|creating|floating|hold|native)/,
    label: 'Feature Design & UX',      icon: 'palette' },
  { pattern: /^content\/team\/platform\//,
    label: 'Platform Engineering',     icon: 'layers' },

// === INTELLIGENCE SERVICE — file prefix patterns ===
  { pattern: /^content\/team\/intelligence\/skill-/,       label: 'Agent Skills',       icon: 'zap' },
  { pattern: /^content\/team\/intelligence\/monitor-/,     label: 'Agent Monitoring',   icon: 'eye' },
  { pattern: /^content\/team\/intelligence\/view-/,        label: 'View Types (Agent)', icon: 'tablet' },
  { pattern: /^content\/team\/intelligence\//,             label: 'AI & Intelligence Service', icon: 'sparkles' },

  // === SURFACES ===
  { pattern: /^content\/team\/relay\//,         label: 'Relay Mobile',       icon: 'smartphone' },
  { pattern: /^content\/team\/browser\//,       label: 'Browser Desktop',    icon: 'monitor' },
  { pattern: /^content\/team\/studio\//,        label: 'Studio App',         icon: 'monitor' },
  { pattern: /^content\/team\/eve-cli\//,       label: 'EVE CLI',            icon: 'terminal' },
  { pattern: /^content\/team\/raycast\//,       label: 'Raycast Extension',  icon: 'zap' },
  { pattern: /^content\/team\/synap-app\//,    label: 'Synap App',          icon: 'monitor' },
  { pattern: /^content\/team\/synap-packages\//, label: 'Shared Packages',  icon: 'package' },

  // === DEVOPS & CONTROL PLANE ===
  { pattern: /^content\/team\/devops\/(operations|incident|backups|rolling|infrastructure|monitoring|start-here|unified|quick-start)\//, label: 'DevOps Runbooks', icon: 'life-buoy' },
  { pattern: /^content\/team\/devops\/(security|docker|install|auth-audit|sdk|front)\//, label: 'DevOps Setup & Security', icon: 'shield' },
  { pattern: /^content\/team\/devops\//,             label: 'DevOps & Infrastructure',    icon: 'terminal' },
  { pattern: /^content\/team\/control-plane\/(pod-|deploy|incident|infrastructure|signal|slo|operations|arch)\//, label: 'Control Plane Ops', icon: 'clock' },
  { pattern: /^content\/team\/control-plane\//,       label: 'Control Plane',              icon: 'crown' },

  // === TECH MATRIX ===
  { pattern: /^content\/team\/tech-matrix\//, label: 'Dev Environment Setup', icon: 'terminal' },
  { pattern: /^content\/team\/technologies\//, label: 'Infrastructure Tech Stack', icon: 'cpu' },

  // === PRODUCT & STRATEGY ===
  { pattern: /^content\/team\/home\//,     label: 'Product Vision & Strategy',   icon: 'compass' },

  // === BUSINESS & GOVERNANCE ===
  { pattern: /^content\/team\/go-to-market\//,   label: 'Go-to-Market',          icon: 'trending-up' },
  { pattern: /^content\/team\/ops-marketing\//,  label: 'Ops & Marketing',       icon: 'megaphone' },
  { pattern: /^content\/team\/decisions\//,      label: 'Decision Records',      icon: 'git-pull-request' },

  // === ARCHIVE ===
  { pattern: /^content\/team\/archive\//,    label: 'Archive',     icon: 'archive-x' },
];

function getGroup(pagePath) {
  const entry = GROUPS.find(function(g) { return g.pattern.test(pagePath); });
  return entry ? { label: entry.label, icon: entry.icon } : { label: 'Unclassified', icon: 'help-circle' };
}

// ---------------------------------------------------------------------------
// Build the group map
// ---------------------------------------------------------------------------

const groupMap = {};

for (const doc of allDocs) {
  const grp = getGroup(doc.path);
  if (!groupMap[grp.label]) {
    groupMap[grp.label] = { icon: grp.icon, pages: [] };
  }
  groupMap[grp.label].pages.push(doc);
}

const sortedGroups = Object.entries(groupMap)
  .sort(function(a, b) { return b[1].pages.length - a[1].pages.length; });

const totalGroups = sortedGroups.length;
const totalDocs = allDocs.length;
const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Generate markdown
// ---------------------------------------------------------------------------

let lines = [];

lines.push('# Documentation Index');
lines.push('');
lines.push('**Auto-generated on ' + now + '** — ' + totalDocs + ' pages across ' + totalGroups + ' topic clusters.');
lines.push('This index makes Synap documentation searchable and navigable for both humans and AI agents.');
lines.push('');
lines.push('**Canonical documentation surface:** ' + BK + 'synap-team-docs/content/' + BK);
lines.push('- **Public docs** (users): ' + BK + 'content/docs/' + BK + ' — product journeys, architecture, integration guides');
lines.push('- **Internal docs** (team): ' + BK + 'content/team/' + BK + ' — engineering runbooks, feature specs, platform notes');
lines.push('');
lines.push('<!-- DO NOT EDIT THIS FILE MANUALLY. It is generated by ' + BK + 'scripts/generate-index.js' + BK + '. -->');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Quick Navigation');

for (const labelData of sortedGroups) {
  const label = labelData[0];
  const group = labelData[1];
  const top3 = group.pages.slice(0, 3).map(function(p) {
    const slug = p.path.replace(/^content\//, '').replace(/\.(mdx|md)$/, '').replace(/\/index$/, '');
    return '[' + p.title + '](' + slug + ')';
  }).join(' & ');
  lines.push('- **' + (group.icon || '') + ' ' + label + '** (' + group.pages.length + ' pages): ' + top3);
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Full Index by Topic Cluster');

for (let gi = 0; gi < sortedGroups.length; gi++) {
  const label = sortedGroups[gi][0];
  const group = sortedGroups[gi][1];

  const sortedPages = group.pages.slice().sort(function(a, b) {
    const dateA = a.last_updated || '0000';
    const dateB = b.last_updated || '0000';
    return dateB.localeCompare(dateA);
  });

  lines.push('');
  lines.push('### ' + (group.icon || '') + ' ' + label + ' (' + group.pages.length + ')');
  lines.push('');

  for (const p of sortedPages) {
    const slug = p.path.replace(/^content\//, '').replace(/\.(mdx|md)$/, '').replace(/\/index$/, '');
    const tagsStr = p.tags && p.tags.length ? ' &mdash; tags: ' + p.tags.join(', ') : '';
    const updatedStr = p.last_updated ? '_updated: ' + p.last_updated + '_' : '';
    const audStr = p.audience !== 'users' && p.audience ? ' [' + p.audience + ']' : '';
    lines.push('- [' + p.title + '](' + slug + ')' + audStr + ' ' + updatedStr + tagsStr);
  }
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Cross-Topic Overlaps');
lines.push('');
lines.push('Pages that span multiple subject areas.');
lines.push('');
lines.push('| Page | Overlaps |');
lines.push('|------|----------|');

const crossTopics = [
  { name: 'Entities & Profiles', tags: ['entity', 'profile', 'schema', 'property'] },
  { name: 'Channels', tags: ['channel', 'thread', 'ai_thread'] },
  { name: 'Views', tags: ['view', 'kanban', 'table', 'bento', 'calendar'] },
  { name: 'AI & Agents', tags: ['agent', 'ai', 'orchestrator', 'persona', 'intelligence'] },
  { name: 'Events & Proposals', tags: ['event', 'proposal', 'governance', 'permission'] },
  { name: 'Mobile', tags: ['relay', 'native-os', 'mobile', 'expo', 'react-native'] },
  { name: 'DevOps', tags: ['devops', 'docker', 'deployment', 'infrastructure', 'runbook'] },
];

for (const ct of crossTopics) {
  const crossDocs = allDocs.filter(function(d) {
    if (!d.tags || !d.tags.length) return false;
    return ct.tags.some(function(t) {
      return d.tags.some(function(tag) { return tag.toLowerCase().indexOf(t) !== -1; });
    });
  });
  if (crossDocs.length > 3) {
    lines.push('| **' + ct.name + '** (' + crossDocs.length + ' relevant) |');
    lines.push('| &mdash; |');
    for (const d of crossDocs.slice(0, 5)) {
      const slug = d.path.replace(/^content\//, '').replace(/\.(mdx|md)$/, '').replace(/\/index$/, '');
      lines.push('| [' + d.title + '](' + slug + ') |');
    }
    if (crossDocs.length > 5) lines.push('| &hellip; (' + (crossDocs.length - 5) + ' more) |');
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('## Search Tips');
lines.push('');
lines.push('- **Find a topic**: Use your browser command-F and search for any keyword');
lines.push('- **Find recent updates**: Pages are sorted by last_updated descending within each group');
lines.push('- **Find team-only docs**: They have a [team] annotation; all others are [users] or unannotated');
lines.push('- **Find by tag**: Search for tags to see which docs share keywords');
lines.push('- **AI agents reference**: When building with Synap, search CLAUDE.md for architecture rules, then use this index to find detailed documentation');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Generation');
lines.push('');
lines.push('- **Script:** ' + BK + 'scripts/generate-index.js' + BK);
lines.push('- **Source:** scans ' + BK + 'content/' + BK + ' for all .mdx/.md files with frontmatter');
lines.push('- **Groups:** uses GROUPS config array for topic clustering');
lines.push('- **Re-run:** ' + BK + 'node scripts/generate-index.js' + BK);

fs.writeFileSync(OUTPUT, lines.join('\n') + '\n');
console.log('Generated DOC-INDEX.md: ' + totalDocs + ' pages, ' + totalGroups + ' clusters');
