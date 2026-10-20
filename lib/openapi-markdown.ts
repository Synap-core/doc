import spec from '@/content/reference-data/hub-openapi.json';

/**
 * Markdown for a generated Hub REST API page. Those pages are an <OpenAPIPage /> call with no Markdown body, so
 * their Markdown form (for /docs/<page>.md, llms-full.txt and the docs MCP) is rendered here from the same OpenAPI
 * description the HTML is rendered from.
 */

type Json = Record<string, any>;
const doc = spec as Json;
const METHODS = ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'] as const;

function deref(node: any, seen = new Set<string>()): any {
  if (!node || typeof node !== 'object' || typeof node.$ref !== 'string') return node;
  const ref: string = node.$ref;
  if (seen.has(ref) || !ref.startsWith('#/')) return node;
  seen.add(ref);
  const target = ref
    .slice(2)
    .split('/')
    .reduce<any>((acc, key) => acc?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], doc);
  return deref(target, seen) ?? node;
}

function typeOf(schema: any): string {
  const s = deref(schema);
  if (!s || typeof s !== 'object') return '';
  if (typeof schema?.$ref === 'string') return schema.$ref.split('/').pop();
  if (s.enum) return s.enum.map((v: unknown) => JSON.stringify(v)).join(' | ');
  if (s.type === 'array') return `array<${typeOf(s.items) || 'any'}>`;
  if (Array.isArray(s.type)) return s.type.join(' | ');
  if (s.type) return s.type;
  for (const k of ['oneOf', 'anyOf', 'allOf']) if (s[k]) return s[k].map(typeOf).join(k === 'allOf' ? ' & ' : ' | ');
  return 'object';
}

const cell = (text: unknown) => String(text ?? '').replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|');

function propertiesTable(schema: any): string[] {
  const s = deref(schema);
  const props = s?.properties ?? deref(s?.allOf?.find((x: any) => deref(x)?.properties))?.properties;
  if (!props) return [];
  const required = new Set<string>(s.required ?? []);
  const rows = ['| Field | Type | Required | Description |', '|---|---|---|---|'];
  for (const [name, prop] of Object.entries<any>(props)) {
    rows.push(`| \`${name}\` | ${cell(typeOf(prop))} | ${required.has(name) ? 'yes' : ''} | ${cell(deref(prop)?.description)} |`);
  }
  return rows;
}

function operationMarkdown(method: string, path: string, op: Json): string {
  const out = [`## ${method.toUpperCase()} ${path}`, ''];
  if (op.summary) out.push(op.summary, '');
  if (op.description && op.description !== op.summary) out.push(op.description, '');
  if (op.deprecated) out.push('Deprecated.', '');

  const params = [...(doc.paths[path]?.parameters ?? []), ...(op.parameters ?? [])].map((p: any) => deref(p));
  if (params.length) {
    out.push('Parameters:', '', '| Name | In | Type | Required | Description |', '|---|---|---|---|---|');
    for (const p of params) {
      out.push(`| \`${p.name}\` | ${p.in} | ${cell(typeOf(p.schema))} | ${p.required ? 'yes' : ''} | ${cell(p.description)} |`);
    }
    out.push('');
  }

  const body = deref(op.requestBody);
  if (body?.content) {
    for (const [type, media] of Object.entries<any>(body.content)) {
      out.push(`Request body (\`${type}\`${body.required ? ', required' : ''}): ${typeOf(media.schema)}`, '');
      const rows = propertiesTable(media.schema);
      if (rows.length) out.push(...rows, '');
    }
  }

  const responses = Object.entries<any>(op.responses ?? {});
  if (responses.length) {
    out.push('Responses:', '');
    for (const [status, res] of responses) out.push(`- \`${status}\`: ${cell(deref(res)?.description)}`);
    out.push('');
  }
  return out.join('\n');
}

/** The operations tagged `tag`, in the description's order, as Markdown. */
export function hubApiTagMarkdown(tag: string): string {
  const sections: string[] = [];
  for (const [path, item] of Object.entries<Json>(doc.paths)) {
    for (const method of METHODS) {
      const op = item[method];
      if (op && (op.tags ?? []).includes(tag)) sections.push(operationMarkdown(method, path, op));
    }
  }
  const base = doc.servers?.[0]?.url ?? '/api/hub';
  return [`Paths are relative to \`${base}\` on a pod.`, '', ...sections].join('\n');
}
