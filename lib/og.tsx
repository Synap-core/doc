import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { siteUrl } from './shared';

/**
 * The social preview (Open Graph) image: 1200x630, the dark ink ground of the docs' dark theme (app/globals.css),
 * the amber S from public/brand/synap-mark.svg (read as is, never redrawn), and Geist, the site's type. Geist is
 * vendored as TTF in lib/og/ (SIL Open Font License, lib/og/Geist-OFL.txt) because the image renderer reads TTF, OTF
 * or WOFF, not the WOFF2 that next/font serves.
 *
 * Served by app/og/image.png (the site) and app/og/docs/[...slug] (one per page); both are built at build time.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const ink = {
  ground: '#26211c',
  text: '#f4ecdc',
  muted: '#b6aa96',
  accent: '#c9975f',
  rule: 'rgba(255, 238, 205, 0.15)',
};

/** The mark's aspect ratio (its viewBox is 724 x 1584). */
const MARK_RATIO = 724 / 1584;

async function assets() {
  const root = process.cwd();
  const [regular, semibold, mark] = await Promise.all([
    readFile(path.join(root, 'lib/og/Geist-Regular.ttf')),
    readFile(path.join(root, 'lib/og/Geist-SemiBold.ttf')),
    readFile(path.join(root, 'public/brand/synap-mark.svg')),
  ]);
  return {
    fonts: [
      { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'Geist', data: semibold, weight: 600 as const, style: 'normal' as const },
    ],
    markSrc: `data:image/svg+xml;base64,${mark.toString('base64')}`,
  };
}

/** Cut a long string at a word boundary, so a title or description never runs off the image. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max * 0.6 ? cut.lastIndexOf(' ') : max).trimEnd()}…`;
}

interface OgImageOptions {
  title: string;
  description?: string;
  /** The docs section the page is in ("Self-host a pod"); omitted for the site image. */
  section?: string;
}

export async function renderOgImage({ title, description, section }: OgImageOptions): Promise<ImageResponse> {
  const { fonts, markSrc } = await assets();
  const host = new URL(siteUrl).host;
  const isSite = !section;
  const markHeight = isSite ? 420 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: ink.ground,
          backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(235, 129, 5, 0.16), transparent 55%)',
          fontFamily: 'Geist',
          color: ink.text,
          padding: '64px 80px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {isSite ? null : <img src={markSrc} height={markHeight} width={Math.round(markHeight * MARK_RATIO)} alt="" />}
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>Synap Docs</div>
            {section ? (
              <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'flex-end', fontSize: 26, color: ink.accent }}>
                {section}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: isSite ? 760 : 1040 }}>
            <div
              style={{
                display: 'flex',
                fontSize: title.length > 40 ? 60 : 72,
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              {clip(title, 90)}
            </div>
            {description ? (
              <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.35, color: ink.muted }}>
                {clip(description, 170)}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              borderTop: `1px solid ${ink.rule}`,
              paddingTop: 20,
              fontSize: 24,
              color: ink.muted,
            }}
          >
            {host}
          </div>
        </div>
        {isSite ? (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingLeft: 40 }}>
            <img src={markSrc} height={markHeight} width={Math.round(markHeight * MARK_RATIO)} alt="" />
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
