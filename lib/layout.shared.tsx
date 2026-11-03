import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { Globe } from 'lucide-react';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import { gitConfig } from './shared';

/** The website, linked from every layout's nav. */
export const websiteLink: LinkItemType = {
  text: 'synap.live',
  url: 'https://www.synap.live',
  external: true,
  icon: <Globe aria-hidden />,
};

/**
 * Options shared by the home page, the docs and the 404 page: one nav title (the S mark, "Synap", "Docs"), a link
 * to the website, and the GitHub link. `githubUrl` renders the GitHub mark as an icon link.
 */
export function baseOptions({ links = [] }: { links?: LinkItemType[] } = {}): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2">
          <SynapLogoMark className="h-5 w-auto shrink-0" />
          <span className="text-[0.9375rem] font-semibold tracking-tight text-fd-foreground">Synap</span>
          <span className="rounded-full border border-fd-border px-1.5 py-px text-[0.6875rem] font-medium text-fd-muted-foreground">
            Docs
          </span>
        </span>
      ),
      url: '/',
    },
    links: [...links, websiteLink],
    githubUrl: `https://github.com/${gitConfig.user}`,
  };
}
