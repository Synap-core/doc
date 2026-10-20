#!/usr/bin/env node
// Copies the generated reference data (JSON) from the source repositories into
// content/reference-data/, and records where it came from in
// content/reference-data/sources.json. The copies are committed, so the site
// builds offline; scripts/generate-reference.mjs turns them into pages.
//
//   npm run reference:sync                         # from GitHub, each source at its default ref (main)
//   SYNAP_CLI_REF=claude/cli-reference \
//   SYNAP_BACKEND_REF=claude/docs-night \
//     npm run reference:sync                       # other refs (branch, tag or commit)
//   npm run reference:sync -- --from local         # from sibling checkouts (../synap-cli, ../synap-backend)
//   npm run reference:check                        # committed data == the files at the recorded commits
//   npm run reference:check -- --latest            # ... == the files at the tip of the recorded refs
//
// Remote mode resolves the ref to a commit with `git ls-remote` and downloads
// from raw.githubusercontent.com at that commit.
// Local mode reads with `git show <commit>:<path>` and never touches the network.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

export const DATA_DIR = path.join(ROOT, 'content/reference-data');
const LOCK = path.join(DATA_DIR, 'sources.json');

export const SOURCES = {
  cli: {
    repo: 'Synap-core/synap-cli',
    refEnv: 'SYNAP_CLI_REF',
    siblings: ['../synap-cli'],
    files: { 'cli.json': 'docs/reference/cli.json' },
  },
  backend: {
    repo: 'Synap-core/backend',
    refEnv: 'SYNAP_BACKEND_REF',
    siblings: ['../synap-backend', '../backend'],
    files: {
      'mcp-tools.json': 'docs/reference/mcp-tools.json',
      'events.json': 'docs/reference/events.json',
      'hub-openapi.json': 'docs/reference/hub-openapi.json',
    },
  },
};

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function resolveRemote(repo, ref) {
  if (/^[0-9a-f]{40}$/.test(ref)) return ref;
  // `git ls-remote` needs no token and has no API rate limit.
  const out = execFileSync('git', ['ls-remote', `https://github.com/${repo}.git`, `refs/heads/${ref}`, `refs/tags/${ref}`], {
    encoding: 'utf8',
  }).trim();
  if (!out) throw new Error(`${repo}: no branch or tag named "${ref}"`);
  return out.split(/\s+/)[0];
}

async function readRemote(repo, commit, file) {
  const url = `https://raw.githubusercontent.com/${repo}/${commit}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function localDir(source) {
  for (const s of source.siblings) {
    const dir = path.resolve(ROOT, s);
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
  }
  throw new Error(`${source.repo}: no local checkout at ${source.siblings.join(' or ')}`);
}

function resolveLocal(dir, ref) {
  for (const candidate of [ref, `origin/${ref}`]) {
    try {
      return execFileSync('git', ['-C', dir, 'rev-parse', '--verify', '--quiet', `${candidate}^{commit}`], {
        encoding: 'utf8',
      }).trim();
    } catch {}
  }
  throw new Error(`${dir}: ref "${ref}" not found (fetch it first)`);
}

const readLocal = (dir, commit, file) => execFileSync('git', ['-C', dir, 'show', `${commit}:${file}`], { maxBuffer: 64 << 20 });

function parseArgs(argv) {
  const args = { from: 'remote', check: false, latest: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from') args.from = argv[++i];
    else if (argv[i] === '--check') args.check = true;
    else if (argv[i] === '--latest') args.latest = true;
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  if (!['remote', 'local'].includes(args.from)) throw new Error('--from is remote or local');
  return args;
}

async function fetchSource(source, ref, from) {
  if (from === 'local') {
    const dir = localDir(source);
    const commit = resolveLocal(dir, ref);
    return { commit, read: (file) => readLocal(dir, commit, file) };
  }
  const commit = await resolveRemote(source.repo, ref);
  return { commit, read: (file) => readRemote(source.repo, commit, file) };
}

async function sync(args) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const lock = {
    $comment:
      'Written by scripts/sync-reference.mjs. Where each file in this folder was copied from. Do not edit; run `npm run reference:sync`.',
  };
  for (const [name, source] of Object.entries(SOURCES)) {
    const ref = process.env[source.refEnv] || 'main';
    const { commit, read } = await fetchSource(source, ref, args.from);
    const files = {};
    for (const [out, file] of Object.entries(source.files)) {
      const buf = await read(file);
      JSON.parse(buf.toString('utf8')); // must be JSON
      fs.writeFileSync(path.join(DATA_DIR, out), buf);
      files[out] = { path: file, sha256: sha256(buf) };
    }
    lock[name] = { repo: source.repo, ref, commit, files };
    console.log(`✓ ${source.repo}@${ref} (${commit.slice(0, 9)}): ${Object.keys(files).join(', ')}`);
  }
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
}

async function check(args) {
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
  const problems = [];
  for (const [name, source] of Object.entries(SOURCES)) {
    const entry = lock[name];
    if (!entry) {
      problems.push(`${name}: missing from sources.json`);
      continue;
    }
    const { commit, read } = await fetchSource(source, args.latest ? entry.ref : entry.commit, args.from);
    for (const [out, file] of Object.entries(source.files)) {
      const local = fs.existsSync(path.join(DATA_DIR, out)) ? fs.readFileSync(path.join(DATA_DIR, out)) : null;
      if (!local) {
        problems.push(`content/reference-data/${out}: missing`);
        continue;
      }
      if (sha256(local) !== entry.files?.[out]?.sha256) {
        problems.push(`content/reference-data/${out}: edited by hand (does not match sources.json); run npm run reference:sync`);
        continue;
      }
      const upstream = await read(file);
      if (!upstream.equals(local)) {
        problems.push(
          args.latest
            ? `${out}: ${source.repo}@${entry.ref} moved to ${commit.slice(0, 9)} and ${file} changed; run npm run reference:sync`
            : `${out}: differs from ${source.repo}@${entry.commit.slice(0, 9)}:${file}`,
        );
      }
    }
  }
  if (problems.length) {
    console.error(`✗ reference data: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`✓ reference data matches its sources${args.latest ? ' (latest)' : ''}`);
}

const args = parseArgs(process.argv.slice(2));
await (args.check ? check(args) : sync(args));
