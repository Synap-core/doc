// Splits the Hub REST API description into one small OpenAPI document per tag: that tag's operations plus only
// the components they reach. Each generated page (content/docs/reference/hub-api/<tag>.mdx) is rendered from its
// own document, so a page carries tens of kilobytes of description instead of the whole 1 MB file.
// Used by lib/openapi.ts (rendering) and scripts/generate-reference.mjs (page generation). Plain JS so both can
// import it.

export const METHODS = ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'];

/** "Agent Skills" -> "agent-skills", "FocusSessions" -> "focus-sessions". */
export function slugifyTag(tag) {
  return tag
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** The schema id of a tag's document, as written in the generated pages. */
export const tagSchemaId = (tag) => `hub-api/${slugifyTag(tag)}`;

function collectRefs(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, out);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string' && value.startsWith('#/components/')) out.add(value);
      else collectRefs(value, out);
    }
  }
}

function resolvePointer(doc, ref) {
  return ref
    .slice(2)
    .split('/')
    .reduce((acc, key) => acc?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], doc);
}

/**
 * A stable id for an operation the description gives no `operationId`: "get /users/{userId}/entities" ->
 * "get-users-userId-entities". fumadocs-openapi lists an operation in the page's "On this page" table of contents
 * and in the search index only when it has an operationId; the heading itself still shows the summary.
 */
export function operationKey(method, route) {
  return `${method}-${route}`.replace(/[^A-Za-z0-9]+/g, '-').replace(/-$/, '');
}

/** Map of tag name -> { slug, schemaId, operations: [{method, path, summary}], document }. */
export function splitByTag(spec) {
  const tags = new Map();
  for (const [route, item] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      for (const tag of op.tags?.length ? op.tags : ['Other']) {
        if (!tags.has(tag)) tags.set(tag, { paths: {}, operations: [] });
        const entry = tags.get(tag);
        entry.paths[route] ??= Object.fromEntries(Object.entries(item).filter(([k]) => !METHODS.includes(k)));
        entry.paths[route][method] = op.operationId ? op : { ...op, operationId: operationKey(method, route) };
        entry.operations.push({ method, path: route, summary: op.summary });
      }
    }
  }

  const result = new Map();
  for (const [tag, { paths, operations }] of tags) {
    // Components reached from the operations, followed transitively.
    const reached = new Set();
    const queue = new Set();
    collectRefs(paths, queue);
    if (spec.security) collectRefs(spec.security, queue);
    while (queue.size) {
      const [ref] = queue;
      queue.delete(ref);
      if (reached.has(ref)) continue;
      reached.add(ref);
      const next = new Set();
      collectRefs(resolvePointer(spec, ref), next);
      for (const r of next) if (!reached.has(r)) queue.add(r);
    }
    const components = {};
    for (const ref of reached) {
      const [, , kind, name] = ref.split('/');
      const value = spec.components?.[kind]?.[name];
      if (value === undefined) continue;
      components[kind] ??= {};
      components[kind][name] = value;
    }
    if (spec.components?.securitySchemes) components.securitySchemes = spec.components.securitySchemes;

    result.set(tag, {
      slug: slugifyTag(tag),
      schemaId: tagSchemaId(tag),
      operations,
      document: {
        openapi: spec.openapi,
        info: { ...spec.info, title: tag },
        // The description's server is pod-relative (`/api/hub`); examples rendered on this site would otherwise
        // point at the docs host.
        servers: [
          {
            url: '{pod}/api/hub',
            description: 'Your pod',
            variables: { pod: { default: 'https://pod.example.com', description: 'The URL of your pod' } },
          },
        ],
        security: spec.security,
        tags: [{ name: tag }],
        paths,
        components,
      },
    });
  }
  return result;
}
