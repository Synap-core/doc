import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { AppWindow, ArrowRight, BookOpen, CodeXml, Library, Rocket, Server, Users } from 'lucide-react';
import Link from 'next/link';
import { baseOptions } from '@/lib/layout.shared';
import { homeUi } from '@/lib/home-ui';

const sections = [
  {
    icon: <Rocket className="size-5" />,
    title: 'Start',
    description: 'What Synap is, the quickstarts for Synap Cloud and for your own server, and the glossary.',
    href: '/docs/start',
  },
  {
    icon: <AppWindow className="size-5" />,
    title: 'Use',
    description: 'The apps: Browser on the desktop, Relay on your phone, Raycast and Eve. Cloud or self-hosted.',
    href: '/docs/use',
  },
  {
    icon: <CodeXml className="size-5" />,
    title: 'Build',
    description: 'The SDK, API keys, webhooks, MCP and agent skills: build on your pod or connect an agent to it.',
    href: '/docs/build',
  },
  {
    icon: <Server className="size-5" />,
    title: 'Run',
    description: 'Self-host a pod: install, configure, domains and TLS, backups, upgrades and operations.',
    href: '/docs/run',
  },
  {
    icon: <Library className="size-5" />,
    title: 'Reference',
    description: 'CLI, event catalog, Hub REST API and MCP tools.',
    href: '/docs/reference',
  },
  {
    icon: <Users className="size-5" />,
    title: 'Community',
    description: 'Contribute to the open-source repositories, report a vulnerability, and write docs.',
    href: '/docs/community',
  },
];

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions()} className="min-h-screen" links={[{ text: 'Documentation', url: '/docs/start' }]}>
      <div className="container mx-auto flex flex-1 flex-col gap-12 px-4 py-10 md:gap-16 md:py-14">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
            Documentation
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
            Your data pod, with agents you govern
          </h1>
          <p className="mt-4 text-pretty text-lg text-fd-muted-foreground">
            Synap is an open-source data pod. Your agents work on records you own, and their changes reach your data as
            proposals you approve.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link href="/docs/start" className={homeUi.primaryCta}>
              Start here
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/docs/start/what-is-synap" className={homeUi.secondaryCta}>
              <BookOpen className="size-4" aria-hidden />
              What is Synap?
            </Link>
          </div>
        </section>

        <section aria-labelledby="sections-heading">
          <h2 id="sections-heading" className="sr-only">
            Sections
          </h2>
          <Cards>
            {sections.map((section) => (
              <Card
                key={section.href}
                className="h-full"
                icon={section.icon}
                title={section.title}
                description={section.description}
                href={section.href}
              />
            ))}
          </Cards>
        </section>
      </div>
    </HomeLayout>
  );
}
