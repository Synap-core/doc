'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface NavigationMenuProps {
  children: ReactNode;
  className?: string;
}

interface NavigationMenuItemProps {
  href: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  isActive?: boolean;
  isExternal?: boolean;
  className?: string;
}

interface NavigationMenuSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function NavigationMenu({ children, className = '' }: NavigationMenuProps) {
  return (
    <nav className={cn('space-y-6', className)}>
      {children}
    </nav>
  );
}

export function NavigationMenuSection({ title, children, className = '' }: NavigationMenuSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground px-3">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function NavigationMenuItem({
  href,
  icon,
  title,
  description,
  isActive = false,
  isExternal = false,
  className = ''
}: NavigationMenuItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            isActive 
              ? 'bg-fd-primary/10 text-fd-primary'
              : 'bg-fd-muted text-fd-muted-foreground'
          )}>
            <div className="text-lg">
              {icon}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'text-sm font-medium truncate',
              isActive 
                ? 'text-fd-primary'
                : 'text-fd-foreground'
            )}>
              {title}
            </span>
            {isExternal ? (
              <ExternalLink className="w-3.5 h-3.5 text-fd-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-fd-muted-foreground flex-shrink-0" />
            )}
          </div>
          
          {description && (
            <p className="text-xs text-fd-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </>
  );

  const classes = cn(
    'block p-3 rounded-xl border transition-all duration-200',
    'hover:shadow-md hover:-translate-y-0.5',
    isActive
      ? 'border-fd-primary/30 bg-fd-primary/5'
      : 'border-fd-border/50 bg-fd-card/50 hover:border-fd-border hover:bg-fd-card',
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function QuickActionsMenu({ className = '' }: { className?: string }) {
  return (
    <div className={cn('p-4 bg-gradient-to-br from-fd-card to-fd-card/90 border border-fd-border/50 rounded-2xl', className)}>
      <h3 className="text-sm font-semibold text-fd-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <button className="p-3 rounded-lg bg-fd-muted/50 hover:bg-fd-muted text-fd-foreground text-xs font-medium transition-colors">
          Search Docs
        </button>
        <button className="p-3 rounded-lg bg-fd-muted/50 hover:bg-fd-muted text-fd-foreground text-xs font-medium transition-colors">
          Recent Files
        </button>
        <button className="p-3 rounded-lg bg-fd-muted/50 hover:bg-fd-muted text-fd-foreground text-xs font-medium transition-colors">
          API Reference
        </button>
        <button className="p-3 rounded-lg bg-fd-muted/50 hover:bg-fd-muted text-fd-foreground text-xs font-medium transition-colors">
          Team Chat
        </button>
      </div>
    </div>
  );
}