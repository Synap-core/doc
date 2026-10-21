import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import { gitConfig } from './shared';

/**
 * Options shared by the home page, the docs and the 404 page: one nav title and one GitHub link.
 * `githubUrl` renders the GitHub mark as an icon link (the docs sidebar footer, the home navbar).
 */
export function baseOptions({ docsLabel = false }: { docsLabel?: boolean } = {}): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2">
          <SynapLogoMark className="size-5 shrink-0" />
          <span className={docsLabel ? 'font-bold text-sm tracking-tight text-fd-foreground' : 'font-bold text-fd-foreground'}>
            Synap
          </span>
          {docsLabel ? <span className="text-xs font-medium text-fd-muted-foreground">Docs</span> : null}
        </span>
      ),
      url: '/',
    },
    githubUrl: `https://github.com/${gitConfig.user}`,
  };
}
