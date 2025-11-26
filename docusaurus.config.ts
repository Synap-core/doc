import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Synap Documentation',
  tagline: 'Event-Sourced Knowledge Backend with AI',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://docs.synap.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'Synap-core',
  projectName: 'backend',

  onBrokenLinks: 'warn',
  markdown: {
    mermaid: true, // Enable Mermaid diagrams
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Synap-core/backend/tree/main/apps/docs/',
          routeBasePath: '/',
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Add Mermaid theme
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    image: 'img/synap-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Synap',
      logo: {
        alt: 'Synap Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/Synap-core/backend',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started/introduction',
            },
            {
              label: 'Architecture',
              to: '/architecture/overview',
            },
            {
              label: 'API Reference',
              to: '/api/data-pod/overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Synap-core/backend',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/Synap-core/backend/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/Synap-core/backend/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Strategy',
              to: '/strategy/vision',
            },
            {
              label: 'Roadmap',
              to: '/strategy/roadmap',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Synap. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'sql', 'json'],
    },
    // Mermaid configuration
    mermaid: {
      theme: {light: 'default', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
