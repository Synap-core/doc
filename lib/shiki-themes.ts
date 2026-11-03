/**
 * Code highlighting in the Synap palette, one theme per colour scheme. Used by the MDX pages (source.config.ts) and
 * by the generated Hub REST API pages (components/api-page.tsx), so every code block on the site looks the same.
 *
 * Every colour is a design-system value (DESIGN.md, synap-landing/src/tokens.css), and each one reaches WCAG AA
 * (4.5:1) on both code block backgrounds of its theme (--color-fd-card, and --color-fd-secondary inside tabs).
 * The background itself comes from those tokens: Fumadocs ignores the theme's editor background.
 */
type ShikiTheme = {
  name: string;
  type: 'light' | 'dark';
  colors: Record<string, string>;
  tokenColors: { scope: string[]; settings: { foreground?: string; fontStyle?: string } }[];
};

interface Palette {
  text: string;
  comment: string;
  keyword: string;
  string: string;
  func: string;
  constant: string;
  property: string;
}

function synapTheme(name: string, type: 'light' | 'dark', p: Palette): ShikiTheme {
  return {
    name,
    type,
    colors: { 'editor.foreground': p.text },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: p.comment, fontStyle: 'italic' } },
      {
        scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'variable.language'],
        settings: { foreground: p.keyword },
      },
      {
        scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw', 'string.unquoted.argument'],
        settings: { foreground: p.string },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call',
          'entity.name.command',
          'support.function.builtin',
          'entity.name.type',
          'support.type',
          'entity.name.class',
          'entity.name.tag',
        ],
        settings: { foreground: p.func },
      },
      {
        scope: [
          'constant',
          'constant.numeric',
          'constant.language',
          'constant.character',
          'support.constant',
          'variable.other.constant',
          'constant.other.option',
        ],
        settings: { foreground: p.constant },
      },
      {
        scope: [
          'variable.other.property',
          'support.type.property-name',
          'meta.object-literal.key',
          'entity.other.attribute-name',
          'meta.mapping.key string',
          'entity.name.tag.yaml',
        ],
        settings: { foreground: p.property },
      },
      { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: p.comment } },
      { scope: ['markup.heading'], settings: { foreground: p.keyword, fontStyle: 'bold' } },
      { scope: ['markup.inserted'], settings: { foreground: p.string } },
      { scope: ['markup.deleted', 'invalid'], settings: { foreground: p.constant } },
    ],
  };
}

export const synapLight = synapTheme('synap-light', 'light', {
  text: '#1f1b17', // ink
  comment: '#685f54', // muted
  keyword: '#784f21', // the primary ochre (see app/globals.css)
  string: '#405236', // sage-ink
  func: '#2f6d69', // teal
  constant: '#9e4729', // clay
  property: '#3a3530', // ink-2
});

export const synapDark = synapTheme('synap-dark', 'dark', {
  text: '#f4ecdc',
  comment: '#b6aa96',
  keyword: '#c9975f',
  string: '#a8ba91', // sage
  func: '#76b9b2', // teal
  constant: '#db8867', // clay
  property: '#d9cfbd', // ink-2
});

export const synapCodeThemes = { light: synapLight, dark: synapDark };
