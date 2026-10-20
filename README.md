# Synap documentation

The public documentation site for [Synap](https://synap.live): how to use it, self-host a pod, build on it and
contribute to it. Built with [Fumadocs](https://fumadocs.dev) on Next.js.

## Run it locally

Requires Node.js 22.18 or later.

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Before you open a pull request

```bash
npm run check      # frontmatter schema, internal links and navigation, retired package names
npm run build
```

CI runs the same checks and the build on every pull request.

## Where things are

- Pages: `content/docs/<section>/`, in six sections: `start`, `use`, `build`, `run`, `reference`, `community`.
  Each folder's `meta.json` sets the navigation order.
- How to write a page, the required frontmatter and the verification rule:
  [`content/docs/community/docs-style-guide.mdx`](content/docs/community/docs-style-guide.mdx).
- Instructions for coding agents: [`CLAUDE.md`](CLAUDE.md).
- The checks: `scripts/`.

This repository is public. Internal plans and notes do not belong here.
