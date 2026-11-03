import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { AppWindow, ArrowRight, Blocks, Bot, Cloud, CodeXml, Library, Server, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import { baseOptions } from '@/lib/layout.shared';
import { homeUi } from '@/lib/home-ui';

/*
 * The home page routes by intent. Every sentence here is the wording of the page it links to (its description or its
 * opening lines), so it stays true as long as those pages are; change them together.
 */

interface PageLink {
  title: string;
  href: string;
}

const quickstarts = [
  {
    icon: <Cloud aria-hidden />,
    title: 'Cloud quickstart',
    description: 'Let Synap run the server. One command connects your computer, your agents and your phone.',
    href: '/docs/start/cloud-quickstart',
  },
  {
    icon: <Server aria-hidden />,
    title: 'Self-host quickstart',
    description: 'Install the open-source pod on a Linux server with Docker, behind automatic HTTPS.',
    href: '/docs/start/self-host-quickstart',
  },
];

const intents: { icon: ReactNode; title: string; description: string; href: string; links: PageLink[] }[] = [
  {
    icon: <AppWindow aria-hidden />,
    title: 'Use Synap',
    description: 'Browser on the desktop, Relay on your phone, plus Raycast. Synap Cloud or your own pod.',
    href: '/docs/use',
    links: [
      { title: 'Browser', href: '/docs/use/browser' },
      { title: 'Relay', href: '/docs/use/relay' },
      { title: 'Self-hosted pod or Synap Cloud', href: '/docs/use/cloud-vs-self-hosted' },
    ],
  },
  {
    icon: <Bot aria-hidden />,
    title: 'Connect your AI',
    description: 'Give Claude Code, Codex, Cursor, ChatGPT or any MCP client its own governed access to your pod.',
    href: '/docs/agents',
    links: [
      { title: 'Connect an agent', href: '/docs/agents' },
      { title: 'MCP', href: '/docs/agents/mcp' },
      { title: 'Agent skills', href: '/docs/agents/skills' },
    ],
  },
  {
    icon: <Blocks aria-hidden />,
    title: 'Make it yours',
    description: 'Shape a pod to your work, from installing a template to writing your own app.',
    href: '/docs/customize',
    links: [
      { title: 'Templates and spaces', href: '/docs/customize/spaces-and-templates' },
      { title: 'Marketplace', href: '/docs/customize/marketplace' },
      { title: 'Capabilities', href: '/docs/customize/capabilities' },
    ],
  },
  {
    icon: <Server aria-hidden />,
    title: 'Self-host a pod',
    description: 'Install, configure, domains and TLS, backups, upgrades and operations.',
    href: '/docs/run',
    links: [
      { title: 'Install', href: '/docs/run/install' },
      { title: 'Backups and restore', href: '/docs/run/backups' },
      { title: 'Upgrades', href: '/docs/run/upgrades' },
    ],
  },
  {
    icon: <CodeXml aria-hidden />,
    title: 'Build on Synap',
    description: 'The SDK for apps people sign in to, API keys and the Hub REST API for scripts, and webhooks.',
    href: '/docs/build',
    links: [
      { title: 'SDK first query', href: '/docs/build/sdk' },
      { title: 'API keys', href: '/docs/build/api-keys' },
      { title: 'Webhooks', href: '/docs/build/webhooks' },
    ],
  },
];

const conceptPath = [
  {
    title: 'What is Synap?',
    description: 'A data pod you own, with a governed place for AI agents to work on your records.',
    href: '/docs/concepts/what-is-synap',
  },
  {
    title: 'Kind and facets',
    description: 'One entity, one kind, many roles: what a thing is, apart from the roles it plays.',
    href: '/docs/concepts/kind-and-facets',
  },
  {
    title: 'Views',
    description: 'A named query plus a rendering configuration over the same records.',
    href: '/docs/concepts/views',
  },
  {
    title: 'Validation policy',
    description: 'Whether a requested change runs directly, becomes a proposal, or is refused.',
    href: '/docs/concepts/validation-policy',
  },
];

const lookups: { icon: ReactNode; title: string; href: string; links: PageLink[] }[] = [
  {
    icon: <Library aria-hidden />,
    title: 'Reference',
    href: '/docs/reference',
    links: [
      { title: 'CLI', href: '/docs/reference/cli' },
      { title: 'MCP tools', href: '/docs/reference/mcp-tools' },
      { title: 'Event catalog', href: '/docs/reference/events' },
      { title: 'Hub REST API', href: '/docs/reference/hub-api' },
    ],
  },
  {
    icon: <Users aria-hidden />,
    title: 'Community',
    href: '/docs/community',
    links: [
      { title: 'Contributing', href: '/docs/community' },
      { title: 'Security', href: '/docs/community/security' },
      { title: 'Docs style guide', href: '/docs/community/docs-style-guide' },
    ],
  },
];

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions({ links: [{ text: 'Documentation', url: '/docs/start' }] })} className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-4 pt-12 pb-20 md:gap-16 md:pt-20">
        <section className="flex flex-col items-start gap-5">
          <SynapLogoMark className="h-12 w-auto" />
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-fd-foreground md:text-[2.75rem] md:leading-[1.1]">
            Synap documentation
          </h1>
          <p className="max-w-2xl text-pretty text-base text-fd-muted-foreground md:text-lg">
            Synap is an open-source data pod: a server that holds your records and lets the AI agents you connect work on
            them. By default an agent&apos;s creates and edits apply directly and can be undone, while deletions and
            structural changes wait for your approval.
          </p>
          <p className="max-w-2xl text-pretty text-base text-fd-muted-foreground">
            It is for people who work with AI agents and want their notes, contacts, tasks and documents in one place
            they own. For example, you ask Claude Code to log a call with a client: it adds the person and a note about
            the call to your pod, and you find both in the Synap app on your desktop.
          </p>
          <FullSearchTrigger className="w-full max-w-md rounded-full bg-fd-card px-4 py-2.5" />
        </section>

        <section aria-labelledby="quickstarts">
          <h2 id="quickstarts" className={homeUi.sectionLabel}>
            Get a pod
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {quickstarts.map((q) => (
              <Link key={q.href} href={q.href} className={homeUi.linkCard}>
                <span className="flex items-center gap-3">
                  <span className={homeUi.iconTile}>{q.icon}</span>
                  <span className="text-base font-semibold text-fd-foreground">{q.title}</span>
                  <ArrowRight
                    className="ms-auto size-4 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="text-sm text-fd-muted-foreground">{q.description}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-fd-muted-foreground">
            Not sure which one?{' '}
            <Link href="/docs/start/choose-your-path" className={homeUi.inlineLink}>
              Choose your path
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="intents">
          <h2 id="intents" className={homeUi.sectionLabel}>
            What do you want to do?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {intents.map((intent) => (
              <div key={intent.href} className={`${homeUi.surface} flex flex-col gap-3 p-5`}>
                <Link
                  href={intent.href}
                  className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                >
                  <span className={homeUi.iconTile}>{intent.icon}</span>
                  <span className="text-base font-semibold text-fd-foreground group-hover:underline group-hover:decoration-fd-primary group-hover:underline-offset-4">
                    {intent.title}
                  </span>
                </Link>
                <p className="text-sm text-fd-muted-foreground">{intent.description}</p>
                <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t border-fd-border pt-3">
                  {intent.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={homeUi.inlineLink}>
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="how-it-works">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="how-it-works" className={`${homeUi.sectionLabel} mb-0`}>
              How Synap works
            </h2>
            <Link href="/docs/concepts" className={homeUi.inlineLink}>
              All concepts, in reading order
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ol className={`${homeUi.surface} divide-y divide-fd-border overflow-hidden`}>
            {conceptPath.map((step, i) => (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-fd-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring"
                >
                  <span className="mt-0.5 font-mono text-xs text-fd-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-fd-foreground">{step.title}</span>
                    <span className="text-sm text-fd-muted-foreground">{step.description}</span>
                  </span>
                  <ArrowRight
                    className="ms-auto mt-0.5 size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-fd-muted-foreground">
            Words you do not know are in the{' '}
            <Link href="/docs/concepts/glossary" className={homeUi.inlineLink}>
              glossary
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="look-up" className="grid gap-3 sm:grid-cols-2">
          <h2 id="look-up" className="sr-only">
            Look something up
          </h2>
          {lookups.map((group) => (
            <div key={group.href} className={`${homeUi.surface} flex flex-col gap-3 p-5`}>
              <Link
                href={group.href}
                className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                <span className={homeUi.iconTile}>{group.icon}</span>
                <span className="text-base font-semibold text-fd-foreground group-hover:underline group-hover:decoration-fd-primary group-hover:underline-offset-4">
                  {group.title}
                </span>
              </Link>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={homeUi.inlineLink}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </HomeLayout>
  );
}
