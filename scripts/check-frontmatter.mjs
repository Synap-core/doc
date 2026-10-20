#!/usr/bin/env node
// Every page must carry the frontmatter described in community/docs-style-guide.
// The vocabulary comes from lib/page-meta.ts, the same lists source.config.ts
// validates against at build time (fumadocs-mdx fails the build on a bad page).
// This script stays as a fast CI check: it needs no build, reports every page at
// once, and adds rules a schema cannot express (last_reviewed age, owner handle).
// Run: npm run check:frontmatter
import { listPages, readPage, rel, report } from './lib.mjs';
import { AUDIENCES, AVAILABILITY, PAGE_TYPES, STATUSES } from '../lib/page-meta.ts';

const REQUIRED = ['title', 'description', 'type', 'audience', 'availability', 'status', 'owner'];
const OPTIONAL = ['last_reviewed', 'icon', 'full', 'generated_from'];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);
const MAX_REVIEW_AGE_DAYS = 183; // flag pages not reviewed for six months

const problems = [];
const today = new Date(process.env.CHECK_TODAY ?? new Date().toISOString().slice(0, 10));

for (const file of listPages()) {
  const where = rel(file);
  const { frontmatter: fm, error } = readPage(file);
  if (error) {
    problems.push(`${where}: ${error}`);
    continue;
  }
  for (const key of REQUIRED) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === '') problems.push(`${where}: missing "${key}"`);
  }
  for (const key of Object.keys(fm)) {
    if (!ALLOWED.has(key)) problems.push(`${where}: unknown key "${key}" (allowed: ${[...ALLOWED].join(', ')})`);
  }
  if (fm.title !== undefined && typeof fm.title !== 'string') problems.push(`${where}: "title" must be a string`);
  if (fm.description !== undefined && typeof fm.description !== 'string')
    problems.push(`${where}: "description" must be a string`);
  if (fm.type !== undefined && !PAGE_TYPES.includes(fm.type))
    problems.push(`${where}: type "${fm.type}" is not one of ${PAGE_TYPES.join(', ')}`);
  if (fm.audience !== undefined && !AUDIENCES.includes(fm.audience))
    problems.push(`${where}: audience "${fm.audience}" is not one of ${AUDIENCES.join(', ')}`);
  if (fm.status !== undefined && !STATUSES.includes(fm.status))
    problems.push(`${where}: status "${fm.status}" is not one of ${STATUSES.join(', ')}`);
  if (fm.availability !== undefined) {
    if (!Array.isArray(fm.availability) || fm.availability.length === 0) {
      problems.push(`${where}: "availability" must be a non-empty list`);
    } else {
      for (const a of fm.availability) {
        if (!AVAILABILITY.includes(a)) problems.push(`${where}: availability "${a}" is not one of ${AVAILABILITY.join(', ')}`);
      }
    }
  }
  if (fm.owner !== undefined && (typeof fm.owner !== 'string' || /\s/.test(fm.owner)))
    problems.push(`${where}: "owner" must be a GitHub handle`);
  if (fm.last_reviewed !== undefined) {
    const value = String(fm.last_reviewed);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
      problems.push(`${where}: last_reviewed "${value}" must be a date (YYYY-MM-DD)`);
    } else {
      const age = (today - new Date(value)) / 86_400_000;
      if (age < 0) problems.push(`${where}: last_reviewed ${value} is in the future`);
      else if (age > MAX_REVIEW_AGE_DAYS)
        problems.push(`${where}: last_reviewed ${value} is more than six months old: re-verify the page or remove the date`);
    }
  }
}

process.exit(report('frontmatter', problems));
