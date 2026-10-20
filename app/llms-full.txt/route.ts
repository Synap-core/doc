import { docsLlms } from '@/lib/source';

export const revalidate = false;

/** Every page of the docs as Markdown, in navigation order. */
export async function GET() {
  return new Response(await docsLlms.full(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
